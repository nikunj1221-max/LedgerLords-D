import { AIPlanner } from '../services/aiPlanner.js';
import { SchedulingEngine } from '../simulation/engine.js';
import { DataService } from '../data/dataService.js';
import { approvedDataSources } from '../data/mockData.js';
import { WorkspacePlanSchema } from '../validators/schemas.js';

// In-memory workspace store with history
const workspacesStore = new Map();
const workspaceHistoryStore = new Map();

export class WorkspaceController {
  static getHealth(req, res) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      provider: process.env.AI_PROVIDER || 'mock',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      hasGroqKey: Boolean(process.env.GROQ_API_KEY),
      version: '1.0.0',
    });
  }

  static async generate(req, res) {
    try {
      const { goal, preferences } = req.body;
      const workspace = await AIPlanner.generate(goal, preferences);

      // Save to store
      workspacesStore.set(workspace.id, workspace);

      // Initial history record
      workspaceHistoryStore.set(workspace.id, [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          changeSummary: 'Initial workspace generation from user goal',
          workspace: structuredClone(workspace),
        }
      ]);

      // Resolve approved data sources for widgets
      const resolvedData = {};
      workspace.widgets.forEach(w => {
        (w.dataSourceIds || []).forEach(srcId => {
          if (!resolvedData[srcId] && approvedDataSources[srcId]) {
            resolvedData[srcId] = DataService.getDataSource(srcId);
          }
        });
      });

      res.json({
        success: true,
        workspace,
        resolvedData,
      });
    } catch (err) {
      console.error('Error generating workspace:', err);
      res.status(500).json({ error: 'Failed to generate workspace: ' + err.message });
    }
  }

  static async adapt(req, res) {
    try {
      const { currentWorkspace, instruction } = req.body;
      if (!currentWorkspace || !instruction) {
        return res.status(400).json({ error: 'currentWorkspace and instruction are required' });
      }

      const result = await AIPlanner.adapt(currentWorkspace, instruction);
      const updatedWs = result.updatedWorkspace;

      // Update store
      workspacesStore.set(updatedWs.id, updatedWs);

      // Append to history
      const history = workspaceHistoryStore.get(updatedWs.id) || [];
      history.push({
        version: updatedWs.version,
        timestamp: new Date().toISOString(),
        changeSummary: result.changeSummary,
        workspace: structuredClone(updatedWs),
      });
      workspaceHistoryStore.set(updatedWs.id, history);

      // Resolve any newly required data sources
      const resolvedData = {};
      updatedWs.widgets.forEach(w => {
        (w.dataSourceIds || []).forEach(srcId => {
          if (!resolvedData[srcId] && approvedDataSources[srcId]) {
            resolvedData[srcId] = DataService.getDataSource(srcId);
          }
        });
      });

      res.json({
        success: true,
        workspace: updatedWs,
        changeSummary: result.changeSummary,
        simulationTrigger: result.simulationTrigger,
        evidenceTrigger: result.evidenceTrigger,
        resolvedData,
      });
    } catch (err) {
      console.error('Error adapting workspace:', err);
      res.status(500).json({ error: 'Failed to adapt workspace: ' + err.message });
    }
  }

  static listWorkspaces(req, res) {
    const list = Array.from(workspacesStore.values()).map(ws => ({
      id: ws.id,
      title: ws.title,
      goal: ws.goal,
      intentMode: ws.intentMode,
      version: ws.version,
      updatedAt: ws.updatedAt,
      widgetCount: ws.widgets.length,
    }));
    res.json({ workspaces: list });
  }

  static createWorkspace(req, res) {
    try {
      const parseResult = WorkspacePlanSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid workspace plan', details: parseResult.error.format() });
      }
      const ws = parseResult.data;
      workspacesStore.set(ws.id, ws);
      res.status(201).json({ success: true, workspace: ws });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static getWorkspace(req, res) {
    const ws = workspacesStore.get(req.params.id);
    if (!ws) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.json({ workspace: ws });
  }

  static updateWorkspace(req, res) {
    const ws = workspacesStore.get(req.params.id);
    if (!ws) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    const merged = {
      ...ws,
      ...req.body,
      version: (ws.version || 1) + 1,
      updatedAt: new Date().toISOString(),
    };

    workspacesStore.set(ws.id, merged);

    const history = workspaceHistoryStore.get(ws.id) || [];
    history.push({
      version: merged.version,
      timestamp: new Date().toISOString(),
      changeSummary: req.body.changeSummary || 'Manual workspace modification',
      workspace: structuredClone(merged),
    });
    workspaceHistoryStore.set(ws.id, history);

    res.json({ success: true, workspace: merged });
  }

  static getHistory(req, res) {
    const history = workspaceHistoryStore.get(req.params.id) || [];
    res.json({ history });
  }

  static restoreVersion(req, res) {
    const { version } = req.body;
    const history = workspaceHistoryStore.get(req.params.id);
    if (!history) {
      return res.status(404).json({ error: 'No history for this workspace' });
    }

    const targetRecord = history.find(h => h.version === Number(version));
    if (!targetRecord) {
      return res.status(404).json({ error: `Version ${version} not found in history` });
    }

    const restoredWs = structuredClone(targetRecord.workspace);
    restoredWs.version = Math.max(...history.map(h => h.version)) + 1;
    restoredWs.updatedAt = new Date().toISOString();

    workspacesStore.set(restoredWs.id, restoredWs);
    history.push({
      version: restoredWs.version,
      timestamp: new Date().toISOString(),
      changeSummary: `Restored back to Version ${version}`,
      workspace: structuredClone(restoredWs),
    });

    res.json({
      success: true,
      workspace: restoredWs,
      restoredFromVersion: version,
    });
  }

  static runSimulation(req, res) {
    try {
      const { scenarioType, params, baselineTasks } = req.body;
      const tasks = baselineTasks || approvedDataSources['project-tasks'].data;
      const simulation = SchedulingEngine.runSimulation(tasks, scenarioType, params);
      res.json({ success: true, simulation });
    } catch (err) {
      console.error('Simulation error:', err);
      res.status(500).json({ error: 'Simulation calculation error: ' + err.message });
    }
  }

  static getDataSource(req, res) {
    try {
      const { sourceId } = req.params;
      const data = DataService.getDataSource(sourceId, req.query);
      res.json({ success: true, source: data });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
}
