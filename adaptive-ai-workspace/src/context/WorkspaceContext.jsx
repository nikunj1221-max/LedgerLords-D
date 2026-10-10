import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api.js';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(null);
  const [resolvedData, setResolvedData] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [activeSimulation, setActiveSimulation] = useState(null);

  // Drawers and Modals
  const [timeMachineOpen, setTimeMachineOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [clarificationModalOpen, setClarificationModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);

  // Loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('');

  // Version History & Undo/Redo Stacks
  const [history, setHistory] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Result interpretation & section view
  const [latestChangeSummary, setLatestChangeSummary] = useState('');
  const [recentUpdatedWidgetIds, setRecentUpdatedWidgetIds] = useState([]);
  const [sectionViewMode, setSectionViewMode] = useState('sections'); // 'sections' or 'grid'

  // User preferences
  const [userPreferences, setUserPreferences] = useState({
    density: 'comfortable',
    themeAccent: 'indigo',
    defaultIntentMode: 'explore',
  });

  // Push snapshot to undo stack
  const pushUndo = (current) => {
    if (!current) return;
    setUndoStack(prev => [...prev.slice(-15), structuredClone(current)]);
    setRedoStack([]);
  };

  /**
   * Initial Generation from User Goal
   */
  const generateWorkspace = async (goal) => {
    setIsGenerating(true);
    setGenerationStage('Understanding your goal...');

    setTimeout(() => setGenerationStage('Selecting useful tools...'), 250);
    setTimeout(() => setGenerationStage('Preparing your workspace...'), 500);
    setTimeout(() => setGenerationStage('Connecting the information...'), 750);
    setTimeout(() => setGenerationStage('Finalizing your layout...'), 1000);

    try {
      const res = await apiService.generateWorkspace(goal, userPreferences);
      if (res && res.workspace) {
        setWorkspace(res.workspace);
        setResolvedData(res.resolvedData || {});
        setActiveFilters(res.workspace.activeFilters || {});
        setUndoStack([]);
        setRedoStack([]);
        setActiveSimulation(null);
        setLatestChangeSummary(res.workspace.explanation || 'Initial workspace generated from your goal.');
        setRecentUpdatedWidgetIds(res.workspace.widgets.map(w => w.id));

        // Record initial history
        const initialRecord = {
          version: 1,
          timestamp: new Date().toISOString(),
          changeSummary: 'Initial workspace generation from goal',
          workspace: structuredClone(res.workspace),
        };
        setHistory([initialRecord]);
      }
    } catch (err) {
      console.error('Failed to generate workspace:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  /**
   * Follow-up Adaptation
   */
  const adaptWorkspace = async (instruction) => {
    if (!workspace) return;
    pushUndo(workspace);

    setIsGenerating(true);
    setGenerationStage('Analyzing follow-up instruction...');

    try {
      const res = await apiService.adaptWorkspace(workspace, instruction);
      if (res && res.workspace) {
        setWorkspace(res.workspace);
        if (res.resolvedData) {
          setResolvedData(prev => ({ ...prev, ...res.resolvedData }));
        }

        setLatestChangeSummary(res.changeSummary || 'Workspace adapted.');

        // Highlight affected widgets
        const affectedIds = [];
        const lowerInst = (instruction || '').toLowerCase();
        if (lowerInst.includes('agenda') || lowerInst.includes('30') || lowerInst.includes('technical')) {
          affectedIds.push('w-agenda', 'w-timeline');
        } else if (lowerInst.includes('delay') || lowerInst.includes('launch')) {
          affectedIds.push('w-timeline', 'w-tasks');
        } else if (lowerInst.includes('compare') || lowerInst.includes('scope') || lowerInst.includes('decision')) {
          affectedIds.push('w-decision-compare', 'w-decision');
        } else if (lowerInst.includes('action') || lowerInst.includes('execute') || lowerInst.includes('plan')) {
          affectedIds.push('w-goal-progress', 'w-tasks');
        } else if (lowerInst.includes('risk') || lowerInst.includes('blocker')) {
          affectedIds.push('w-risks', 'w-blockers');
        }
        setRecentUpdatedWidgetIds(affectedIds.length > 0 ? affectedIds : res.workspace.widgets.slice(0, 2).map(w => w.id));

        // Add history version
        const newRecord = {
          version: res.workspace.version,
          timestamp: new Date().toISOString(),
          changeSummary: res.changeSummary || 'Follow-up instruction adaptation',
          workspace: structuredClone(res.workspace),
        };
        setHistory(prev => [...prev, newRecord]);

        // If simulation was triggered (e.g. 2-week delay question)
        if (res.simulationTrigger?.openTimeMachine && res.simulationTrigger?.simulation) {
          setActiveSimulation(res.simulationTrigger.simulation);
          setTimeMachineOpen(true);
        }

        // If evidence was triggered (e.g. "Why do you think this delay affects the launch?")
        if (res.evidenceTrigger?.openEvidenceDrawer) {
          setSelectedInsight({
            id: res.evidenceTrigger.insightId || 'INS-DELAY-1',
            statement: 'A 2-week kickoff delay pushes public launch from Nov 20 to Dec 4 (+14 days) via critical path.',
            type: 'calculated_result',
            sourceDataset: 'project-tasks (TASK-1 -> TASK-2 -> TASK-4 -> TASK-5)',
            relevantValues: { baselineDate: '2026-11-20', simulatedDate: '2026-12-04', criticalShift: '14 calendar days' },
            formula: 'earliestStartDate(T) = max(dueDate(Dep_i) + 1); dueDate(T) = earliestStartDate(T) + duration - 1',
            calculationSteps: [
              'TASK-1 delayed by 14 days -> finish moved to 2026-11-03',
              'TASK-2 depends on TASK-1 -> start moved to 2026-11-04, finish to 2026-11-17',
              'TASK-4 depends on TASK-2 -> start moved to 2026-11-18, finish to 2026-11-25',
              'TASK-5 depends on TASK-4 -> finish moved to 2026-12-03',
              'TASK-6 (Public Launch) moved to 2026-12-04.'
            ],
            assumptions: [
              'Task durations remain unchanged without overtime compression',
              'Sequential dependencies are mandatory',
              'No additional engineering resources are allocated'
            ],
            limitations: [
              'Does not calculate unexpected vendor turnaround latency',
              'Uses standard calendar day schedule'
            ]
          });
          setEvidenceDrawerOpen(true);
        }
      }
    } catch (err) {
      console.error('Failed to adapt workspace:', err);
    } finally {
      setIsGenerating(false);
      setGenerationStage('');
    }
  };

  /**
   * Intent Morphing (Explore | Decide | Execute)
   */
  const setIntentMode = (mode) => {
    if (!workspace || workspace.intentMode === mode) return;
    pushUndo(workspace);

    const updated = structuredClone(workspace);
    updated.intentMode = mode;
    updated.version = (updated.version || 1) + 1;
    updated.updatedAt = new Date().toISOString();

    // Transform widget layouts and visibility based on mode
    if (mode === 'explore') {
      updated.widgets.forEach(w => {
        if (w.type === 'ProjectOverview' || w.type === 'SummaryCards' || w.type === 'ChartWidget') {
          w.layout.order = 1;
        } else if (w.type === 'InsightList' || w.type === 'RiskList') {
          w.layout.order = 2;
        }
      });
    } else if (mode === 'decide') {
      // Prioritize decision comparison
      const hasDecision = updated.widgets.some(w => w.type === 'DecisionComparison');
      if (!hasDecision) {
        updated.widgets.unshift({
          id: 'w-decision-compare',
          type: 'DecisionComparison',
          title: 'Strategic Decision Matrix: Delay vs. Scope Reduction',
          description: 'Calculated trade-offs across launch options',
          dataSourceIds: ['decision-options'],
          layout: { colSpan: 12, order: 0 },
          isPinned: true,
          explanation: 'Prioritized comparison matrix in Decide mode.',
          intentModes: ['decide'],
          config: {}
        });
      }
    } else if (mode === 'execute') {
      // Prioritize TaskList and GoalProgress
      const hasProgress = updated.widgets.some(w => w.type === 'GoalProgress');
      if (!hasProgress) {
        updated.widgets.unshift({
          id: 'w-goal-progress',
          type: 'GoalProgress',
          title: 'Action Plan Execution Tracker',
          description: 'Implementation milestones for agreed launch path',
          dataSourceIds: ['project-tasks'],
          layout: { colSpan: 12, order: 0 },
          isPinned: true,
          explanation: 'Prioritized execution workflow in Execute mode.',
          intentModes: ['execute'],
          config: {}
        });
      }
      updated.widgets.forEach(w => {
        if (w.type === 'TaskList') {
          w.layout.colSpan = 12;
          w.layout.order = 1;
        }
      });
    }

    setWorkspace(updated);

    const newRecord = {
      version: updated.version,
      timestamp: new Date().toISOString(),
      changeSummary: `Morphed workspace intent mode to ${mode.toUpperCase()}`,
      workspace: structuredClone(updated),
    };
    setHistory(prev => [...prev, newRecord]);
  };

  /**
   * Cross-Widget Filtering
   */
  const setFilter = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));

    // Update resolved data for filter if applicable
    if (key === 'region') {
      setResolvedData(prev => {
        const copy = structuredClone(prev);
        if (copy['sales-summary']) {
          if (value === 'North America - West') {
            copy['sales-summary'].data.activeRegion = 'North America - West';
            copy['sales-summary'].data.totalRevenue = '$310,000';
            copy['sales-summary'].data.revenueChange = '-24.6%';
            copy['sales-summary'].data.closedDeals = 34;
            copy['sales-summary'].data.dealsChange = '-28.2%';
          } else if (value === 'North America - East') {
            copy['sales-summary'].data.activeRegion = 'North America - East';
            copy['sales-summary'].data.totalRevenue = '$480,000';
            copy['sales-summary'].data.revenueChange = '-3.1%';
          }
        }
        return copy;
      });
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    // Reset data filters
    setResolvedData(prev => {
      const copy = structuredClone(prev);
      if (copy['sales-summary']) {
        copy['sales-summary'].data.activeRegion = 'All Regions';
        copy['sales-summary'].data.totalRevenue = '$1,248,500';
        copy['sales-summary'].data.revenueChange = '-14.2%';
        copy['sales-summary'].data.closedDeals = 142;
        copy['sales-summary'].data.dealsChange = '-18.4%';
      }
      return copy;
    });
  };

  /**
   * Widget Actions: Pin, Remove, Add
   */
  const togglePinWidget = (id) => {
    if (!workspace) return;
    setWorkspace(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => w.id === id ? { ...w, isPinned: !w.isPinned } : w),
    }));
  };

  const removeWidget = (id) => {
    if (!workspace) return;
    pushUndo(workspace);
    setWorkspace(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== id),
    }));
  };

  const addWidget = (newWidget) => {
    if (!workspace) return;
    pushUndo(workspace);
    setWorkspace(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));
  };

  /**
   * Missing Information Updates
   */
  const updateMissingInfo = (id, value) => {
    if (!workspace) return;
    setWorkspace(prev => ({
      ...prev,
      missingInfo: prev.missingInfo.map(item =>
        item.id === id ? { ...item, value, resolved: Boolean(value.trim()) } : item
      ),
    }));
  };

  /**
   * Time Machine Simulation Controls
   */
  const openTimeMachine = async (scenarioType = 'delay_launch', params = { weeks: 2 }) => {
    try {
      const res = await apiService.runSimulation(scenarioType, params);
      if (res && res.simulation) {
        setActiveSimulation(res.simulation);
        setTimeMachineOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const applyScenario = (simulation) => {
    if (!workspace || !simulation) return;
    pushUndo(workspace);

    // Apply simulation milestone dates to baseline workspace
    const updated = structuredClone(workspace);
    updated.version = (updated.version || 1) + 1;
    updated.updatedAt = new Date().toISOString();

    // Update project overview with new target launch date
    const overviewWidget = updated.widgets.find(w => w.type === 'ProjectOverview');
    if (overviewWidget) {
      overviewWidget.description = `Active applied scenario: ${simulation.scenarioDescription}`;
    }

    setWorkspace(updated);

    const newRecord = {
      version: updated.version,
      timestamp: new Date().toISOString(),
      changeSummary: `Applied Time Machine scenario: ${simulation.scenarioDescription}`,
      workspace: structuredClone(updated),
    };
    setHistory(prev => [...prev, newRecord]);
    setTimeMachineOpen(false);
  };

  const discardScenario = () => {
    setActiveSimulation(null);
    setTimeMachineOpen(false);
  };

  /**
   * Self-Proving Insights Controls
   */
  const openEvidence = (insight) => {
    setSelectedInsight(insight);
    setEvidenceDrawerOpen(true);
  };

  const closeEvidence = () => {
    setEvidenceDrawerOpen(false);
  };

  /**
   * Undo and Redo
   */
  const undo = () => {
    if (undoStack.length === 0 || !workspace) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, structuredClone(workspace)]);
    setUndoStack(prev => prev.slice(0, -1));
    setWorkspace(previous);
  };

  const redo = () => {
    if (redoStack.length === 0 || !workspace) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, structuredClone(workspace)]);
    setRedoStack(prev => prev.slice(0, -1));
    setWorkspace(next);
  };

  /**
   * Version History Restoration
   */
  const restoreVersion = (versionNum) => {
    const record = history.find(h => h.version === Number(versionNum));
    if (!record) return;
    pushUndo(workspace);

    const restored = structuredClone(record.workspace);
    restored.version = Math.max(...history.map(h => h.version)) + 1;
    restored.updatedAt = new Date().toISOString();

    setWorkspace(restored);
    setHistory(prev => [
      ...prev,
      {
        version: restored.version,
        timestamp: new Date().toISOString(),
        changeSummary: `Restored to state from Version ${versionNum}`,
        workspace: structuredClone(restored),
      }
    ]);
    setHistoryDrawerOpen(false);
  };

  const updatePreferences = (newPrefs) => {
    setUserPreferences(prev => ({ ...prev, ...newPrefs }));
    if (workspace) {
      setWorkspace(prev => ({
        ...prev,
        userPreferences: { ...prev.userPreferences, ...newPrefs },
      }));
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        resolvedData,
        activeFilters,
        activeSimulation,
        timeMachineOpen,
        selectedInsight,
        evidenceDrawerOpen,
        historyDrawerOpen,
        clarificationModalOpen,
        preferencesModalOpen,
        isGenerating,
        generationStage,
        history,
        latestChangeSummary,
        recentUpdatedWidgetIds,
        sectionViewMode,
        setSectionViewMode,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
        userPreferences,
        generateWorkspace,
        adaptWorkspace,
        setIntentMode,
        setFilter,
        clearFilters,
        togglePinWidget,
        removeWidget,
        addWidget,
        updateMissingInfo,
        openTimeMachine,
        applyScenario,
        discardScenario,
        openEvidence,
        closeEvidence,
        setTimeMachineOpen,
        setHistoryDrawerOpen,
        setClarificationModalOpen,
        setPreferencesModalOpen,
        undo,
        redo,
        restoreVersion,
        updatePreferences,
        resetWorkspace: () => setWorkspace(null),
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
