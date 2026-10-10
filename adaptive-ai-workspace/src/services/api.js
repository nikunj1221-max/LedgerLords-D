import { MockPlanner } from '../../server/services/mockPlanner.js';
import { SchedulingEngine } from '../../server/simulation/engine.js';
import { approvedDataSources } from '../../server/data/mockData.js';

const API_BASE = '/api';

export const apiService = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) return await res.json();
    } catch {
      // client-side fallback
    }
    return { status: 'ok', provider: 'mock (client fallback)' };
  },

  async generateWorkspace(goal, preferences = {}) {
    try {
      const res = await fetch(`${API_BASE}/workspace/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, preferences }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend call failed, using client fallback:', e);
    }

    // Client-side fallback: direct mock planner
    const ws = MockPlanner.generateWorkspace(goal, preferences);
    const resolvedData = {};
    ws.widgets.forEach(w => {
      (w.dataSourceIds || []).forEach(src => {
        if (approvedDataSources[src]) resolvedData[src] = structuredClone(approvedDataSources[src]);
      });
    });

    return {
      success: true,
      workspace: ws,
      resolvedData,
    };
  },

  async adaptWorkspace(currentWorkspace, instruction) {
    try {
      const res = await fetch(`${API_BASE}/workspace/adapt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentWorkspace, instruction }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend adapt call failed, using client fallback:', e);
    }

    // Client-side fallback
    const result = MockPlanner.adaptWorkspace(currentWorkspace, instruction);
    const resolvedData = {};
    result.updatedWorkspace.widgets.forEach(w => {
      (w.dataSourceIds || []).forEach(src => {
        if (approvedDataSources[src]) resolvedData[src] = structuredClone(approvedDataSources[src]);
      });
    });

    return {
      success: true,
      workspace: result.updatedWorkspace,
      changeSummary: result.changeSummary,
      simulationTrigger: result.simulationTrigger,
      evidenceTrigger: result.evidenceTrigger,
      resolvedData,
    };
  },

  async runSimulation(scenarioType, params, baselineTasks) {
    try {
      const res = await fetch(`${API_BASE}/simulations/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioType, params, baselineTasks }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend simulation call failed, using client fallback:', e);
    }

    const tasks = baselineTasks || approvedDataSources['project-tasks'].data;
    const sim = SchedulingEngine.runSimulation(tasks, scenarioType, params);
    return { success: true, simulation: sim };
  },

  async getHistory(workspaceId) {
    try {
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/history`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('History call failed:', e);
    }
    return { history: [] };
  },

  async restoreVersion(workspaceId, version) {
    try {
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Restore call failed:', e);
    }
    return null;
  }
};
