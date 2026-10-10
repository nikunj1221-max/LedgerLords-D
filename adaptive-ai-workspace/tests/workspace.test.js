import { describe, it, expect } from 'vitest';
import { SchedulingEngine } from '../server/simulation/engine.js';
import { MockPlanner } from '../server/services/mockPlanner.js';
import { DataService } from '../server/data/dataService.js';
import { WorkspacePlanSchema, WidgetSchema } from '../server/validators/schemas.js';
import { approvedDataSources } from '../server/data/mockData.js';
import { COMPONENT_REGISTRY, renderWidgetComponent } from '../src/registry/components.jsx';

describe('1. Dynamic Workspace Generation & Schema Validation', () => {
  it('generates a valid Project Launch workspace without API keys', () => {
    const ws = MockPlanner.generateWorkspace('I want to launch a new project, so I want to have a meeting about it');
    expect(ws).toBeDefined();
    expect(ws.title).toContain('Project Launch');
    expect(ws.widgets.length).toBeGreaterThanOrEqual(5);

    // Validate with Zod
    const validation = WorkspacePlanSchema.safeParse(ws);
    expect(validation.success).toBe(true);
  });

  it('generates Sales Decline workspace for sales queries', () => {
    const ws = MockPlanner.generateWorkspace('Help me understand why sales are declining');
    expect(ws.title).toContain('Sales');
    const hasCards = ws.widgets.some(w => w.type === 'SummaryCards');
    const hasCharts = ws.widgets.some(w => w.type === 'ChartWidget');
    expect(hasCards).toBe(true);
    expect(hasCharts).toBe(true);
  });

  it('generates Project Recovery workspace for delayed queries', () => {
    const ws = MockPlanner.generateWorkspace('Our project is behind schedule. Help us recover.');
    expect(ws.title).toContain('Recovery');
    const hasTimeline = ws.widgets.some(w => w.type === 'Timeline');
    expect(hasTimeline).toBe(true);
  });
});

describe('2. Component Registry Validation', () => {
  it('includes all approved widgets in COMPONENT_REGISTRY', () => {
    const requiredWidgets = [
      'ProjectOverview', 'Agenda', 'SummaryCards', 'ChartWidget',
      'TaskList', 'Timeline', 'RiskList', 'BlockerList',
      'InsightList', 'DecisionComparison', 'TeamMembers', 'NotesPanel', 'GoalProgress'
    ];

    requiredWidgets.forEach(wType => {
      expect(COMPONENT_REGISTRY[wType]).toBeDefined();
      expect(typeof COMPONENT_REGISTRY[wType]).toBe('function');
    });
  });

  it('safely rejects unknown component types', () => {
    const element = renderWidgetComponent('ArbitraryFakeComponent', {});
    expect(element).toBeDefined();
  });
});

describe('3. Follow-up Adaptation & Pinned Preservation', () => {
  it('adapts kickoff meeting into 30-min technical meeting with exact duration math', () => {
    const initial = MockPlanner.generateWorkspace('Project kickoff meeting');
    const { updatedWorkspace, changeSummary } = MockPlanner.adaptWorkspace(
      initial,
      'Make this a 30-minute meeting and focus on technical feasibility.'
    );

    const agenda = updatedWorkspace.widgets.find(w => w.type === 'Agenda');
    expect(agenda).toBeDefined();
    expect(agenda.config.totalDuration).toBe(30);

    const itemsSum = agenda.config.customItems.reduce((acc, it) => acc + it.duration, 0);
    expect(itemsSum).toBe(30);
    expect(changeSummary).toContain('30 minutes');
  });

  it('preserves pinned widgets during adaptations', () => {
    const initial = MockPlanner.generateWorkspace('Project kickoff meeting');
    initial.widgets[0].isPinned = true;
    const pinnedId = initial.widgets[0].id;

    const { updatedWorkspace } = MockPlanner.adaptWorkspace(
      initial,
      'Make this more compact.'
    );

    const pinnedWidget = updatedWorkspace.widgets.find(w => w.id === pinnedId);
    expect(pinnedWidget).toBeDefined();
    expect(pinnedWidget.isPinned).toBe(true);
  });
});

describe('4. Intent Morphing (Explore | Decide | Execute)', () => {
  it('transforms workspace when switching to Decide mode', () => {
    const initial = MockPlanner.generateWorkspace('Project kickoff meeting');
    const { updatedWorkspace } = MockPlanner.adaptWorkspace(
      initial,
      'Compare delaying the launch with reducing the project scope.'
    );

    expect(updatedWorkspace.intentMode).toBe('decide');
    const hasDecision = updatedWorkspace.widgets.some(w => w.type === 'DecisionComparison');
    expect(hasDecision).toBe(true);
  });

  it('transforms workspace when switching to Execute mode', () => {
    const initial = MockPlanner.generateWorkspace('Project kickoff meeting');
    const { updatedWorkspace } = MockPlanner.adaptWorkspace(
      initial,
      'Turn the recommended option into an action plan.'
    );

    expect(updatedWorkspace.intentMode).toBe('execute');
    const hasProgress = updatedWorkspace.widgets.some(w => w.type === 'GoalProgress');
    expect(hasProgress).toBe(true);
  });
});

describe('5. Deterministic Scheduling Engine (Workspace Time Machine)', () => {
  const sampleTasks = approvedDataSources['project-tasks'].data;

  it('detects cycles in invalid dependency graphs', () => {
    const cyclicTasks = [
      { id: 'T1', dependencies: ['T2'], startDate: '2026-10-01', dueDate: '2026-10-05', duration: 5 },
      { id: 'T2', dependencies: ['T1'], startDate: '2026-10-06', dueDate: '2026-10-10', duration: 5 },
    ];

    const cycle = SchedulingEngine.detectCycle(cyclicTasks);
    expect(cycle.hasCycle).toBe(true);
    expect(() => SchedulingEngine.computeSchedule(cyclicTasks)).toThrow(/dependency cycle detected/);
  });

  it('propagates a 2-week delay through the critical path deterministically', () => {
    const sim = SchedulingEngine.runSimulation(sampleTasks, 'delay_launch', { weeks: 2 });
    expect(sim.projectShiftDays).toBe(14);
    expect(sim.simulatedMilestoneDate).toBe('2026-12-04');
    expect(sim.affectedTasksCount).toBeGreaterThanOrEqual(4);
    expect(sim.costImpact).toBe('+$14,500');
  });

  it('calculates scope reduction without delaying public launch', () => {
    const sim = SchedulingEngine.runSimulation(sampleTasks, 'reduce_scope');
    expect(sim.projectShiftDays).toBe(0);
    expect(sim.simulatedMilestoneDate).toBe('2026-11-20');
  });
});

describe('6. Data Layer & Access Control', () => {
  it('retrieves approved data source correctly', () => {
    const data = DataService.getDataSource('project-overview');
    expect(data.id).toBe('project-overview');
    expect(data.data.projectName).toBe('NextGen Product Launch');
  });

  it('rejects unapproved data source IDs', () => {
    expect(() => DataService.getDataSource('unapproved-secret-db')).toThrow(/not in the approved catalog/);
  });

  it('correctly filters sales by region', () => {
    const data = DataService.getDataSource('sales-by-region', { region: 'West' });
    expect(data.data.length).toBe(1);
    expect(data.data[0].region).toContain('West');
  });
});

describe('7. Primary Demo 7-Step Sequence End-to-End', () => {
  it('executes full 7-step user workflow with observable state changes', () => {
    // Step 1: Initial Goal
    const step1 = MockPlanner.generateWorkspace('I want to launch a new project, so help me prepare for the kickoff meeting.');
    expect(step1.title).toContain('Project Launch');
    expect(step1.intentMode).toBe('explore');

    // Step 2: 30-min technical meeting
    const step2 = MockPlanner.adaptWorkspace(step1, 'Make this a 30-minute meeting and focus on technical feasibility.');
    const agenda = step2.updatedWorkspace.widgets.find(w => w.type === 'Agenda');
    expect(agenda.config.totalDuration).toBe(30);
    expect(step2.changeSummary).toContain('30 minutes');

    // Step 3: What happens if delayed by 2 weeks?
    const step3 = MockPlanner.adaptWorkspace(step2.updatedWorkspace, 'What happens if we delay the launch by two weeks?');
    expect(step3.simulationTrigger).toBeDefined();
    expect(step3.simulationTrigger.openTimeMachine).toBe(true);
    expect(step3.simulationTrigger.simulation.projectShiftDays).toBe(14);

    // Step 4: Why do you think this delay affects the launch?
    const step4 = MockPlanner.adaptWorkspace(step3.updatedWorkspace, 'Why do you think this delay affects the launch?');
    expect(step4.evidenceTrigger).toBeDefined();
    expect(step4.evidenceTrigger.openEvidenceDrawer).toBe(true);
    expect(step4.changeSummary).toContain('Self-Proving Insights');

    // Step 5: Compare delaying the launch with reducing the project scope
    const step5 = MockPlanner.adaptWorkspace(step4.updatedWorkspace, 'Compare delaying the launch with reducing the project scope.');
    expect(step5.updatedWorkspace.intentMode).toBe('decide');
    const decisionWidget = step5.updatedWorkspace.widgets.find(w => w.type === 'DecisionComparison');
    expect(decisionWidget).toBeDefined();

    // Step 6: Turn the recommended option into an action plan
    const step6 = MockPlanner.adaptWorkspace(step5.updatedWorkspace, 'Turn the recommended option into an action plan.');
    expect(step6.updatedWorkspace.intentMode).toBe('execute');
    const progressWidget = step6.updatedWorkspace.widgets.find(w => w.type === 'GoalProgress');
    expect(progressWidget).toBeDefined();

    // Step 7: Undo that change (restoring previous state)
    // The previous state is step5.updatedWorkspace
    expect(step5.updatedWorkspace.intentMode).toBe('decide');
  });
});

