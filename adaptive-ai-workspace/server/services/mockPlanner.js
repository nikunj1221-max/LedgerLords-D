import { approvedDataSources } from '../data/mockData.js';
import { SchedulingEngine } from '../simulation/engine.js';

/**
 * Deterministic Mock Planner
 * Provides 100% reliable, zero-API-key workspace generation, follow-up adaptation,
 * and state-aware morphing.
 */
export class MockPlanner {
  /**
   * Generate an initial workspace plan from user goal.
   */
  static generateWorkspace(goal, preferences = {}) {
    const lowerGoal = (goal || '').toLowerCase();

    // 1. Primary Demo: Project Launch / Kickoff Meeting
    if (
      lowerGoal.includes('launch') ||
      lowerGoal.includes('kickoff') ||
      lowerGoal.includes('meeting') ||
      lowerGoal.includes('project') && !lowerGoal.includes('recover') && !lowerGoal.includes('behind')
    ) {
      return this.createProjectLaunchWorkspace(goal, preferences);
    }

    // 2. Scenario A: Sales decline
    if (
      lowerGoal.includes('sale') ||
      lowerGoal.includes('declin') ||
      lowerGoal.includes('revenue')
    ) {
      return this.createSalesDeclineWorkspace(goal, preferences);
    }

    // 3. Scenario B: Project recovery
    if (
      lowerGoal.includes('recover') ||
      lowerGoal.includes('behind') ||
      lowerGoal.includes('schedule') ||
      lowerGoal.includes('delay')
    ) {
      return this.createProjectRecoveryWorkspace(goal, preferences);
    }

    // 4. General Goal Fallback
    return this.createGeneralWorkspace(goal, preferences);
  }

  /**
   * Project Launch Workspace (Master Primary Demo)
   */
  static createProjectLaunchWorkspace(goal, preferences = {}) {
    return {
      id: `ws-${Date.now()}`,
      title: 'Project Launch Kickoff Workspace',
      goal: goal || 'Prepare for a new project kickoff meeting',
      intentMode: preferences.defaultIntentMode || 'explore',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      explanation: 'Generated a comprehensive Project Launch workspace structured around your kickoff objective. Includes strategic overview, an editable 60-minute agenda, attendee role recommendations, core discussion topics, milestone schedule, identified project risks, and an actionable checklist.',
      userPreferences: {
        density: preferences.density || 'comfortable',
        themeAccent: preferences.themeAccent || 'indigo',
        defaultIntentMode: preferences.defaultIntentMode || 'explore',
      },
      activeFilters: {},
      missingInfo: [
        {
          id: 'info-1',
          label: 'Confirmed Meeting Date & Time',
          description: 'Proposed date is tentatively 2026-10-14 10:00 AM PST',
          value: '2026-10-14 10:00 AM',
          required: true,
          resolved: false,
        },
        {
          id: 'info-2',
          label: 'Customer Beta Target Segment',
          description: 'Identify enterprise vs mid-market tier for initial pilot rollout',
          value: '',
          required: false,
          resolved: false,
        },
        {
          id: 'info-3',
          label: 'Third-party Payment Gateway Vendor',
          description: 'Stripe vs Adyen enterprise contract sign-off',
          value: '',
          required: false,
          resolved: false,
        }
      ],
      widgets: [
        {
          id: 'w-overview',
          type: 'ProjectOverview',
          title: 'Project Overview & Objectives',
          description: 'Mission statement, target timeline, budget, and key success criteria',
          dataSourceIds: ['project-overview'],
          layout: { colSpan: 12, order: 1 },
          isPinned: true,
          explanation: 'Essential grounding context for meeting attendees to align on the core problem and measurable success metrics.',
          intentModes: ['explore', 'decide', 'execute'],
          config: {}
        },
        {
          id: 'w-agenda',
          type: 'Agenda',
          title: 'Kickoff Meeting Agenda (60 mins)',
          description: 'Structured duration breakdown with item topics and speakers',
          dataSourceIds: ['meeting-agenda'],
          layout: { colSpan: 7, order: 2 },
          isPinned: true,
          explanation: 'Calculated meeting flow ensuring time is allocated across vision, requirements, feasibility, and next actions.',
          intentModes: ['explore', 'decide', 'execute'],
          config: { totalDuration: 60, focus: 'General Kickoff' }
        },
        {
          id: 'w-team',
          type: 'TeamMembers',
          title: 'Recommended Attendee Roles',
          description: 'Cross-functional leads required for alignment and sign-off',
          dataSourceIds: ['project-overview'],
          layout: { colSpan: 5, order: 3 },
          isPinned: false,
          explanation: 'Identifies functional representatives needed to guarantee decision authority in the room.',
          intentModes: ['explore', 'decide'],
          config: {}
        },
        {
          id: 'w-timeline',
          type: 'Timeline',
          title: 'Project Milestones & Dependency Timeline',
          description: 'Sequential delivery schedule from architecture to public launch',
          dataSourceIds: ['project-tasks'],
          layout: { colSpan: 8, order: 4 },
          isPinned: false,
          explanation: 'Visualizes the critical path from kickoff to the Nov 20 launch milestone.',
          intentModes: ['explore', 'decide', 'execute'],
          config: {}
        },
        {
          id: 'w-risks',
          type: 'RiskList',
          title: 'Potential Risks & Unknowns',
          description: 'Identified blockers, single points of failure, and mitigation plans',
          dataSourceIds: ['project-blockers'],
          layout: { colSpan: 4, order: 5 },
          isPinned: false,
          explanation: 'Proactively surfaces critical risks, clearly differentiating observed constraints from hypotheses.',
          intentModes: ['explore', 'decide'],
          config: {}
        },
        {
          id: 'w-tasks',
          type: 'TaskList',
          title: 'Next Steps & Preparation Tasks',
          description: 'Action items required prior to meeting kickoff and post-meeting execution',
          dataSourceIds: ['project-tasks'],
          layout: { colSpan: 7, order: 6 },
          isPinned: false,
          explanation: 'Converts alignment outcomes into discrete, assigned deliverables with due dates.',
          intentModes: ['decide', 'execute'],
          config: {}
        },
        {
          id: 'w-notes',
          type: 'NotesPanel',
          title: 'Important Discussion Questions',
          description: 'Guiding inquiry prompts to prevent derailment during meeting',
          dataSourceIds: ['project-overview'],
          layout: { colSpan: 5, order: 7 },
          isPinned: false,
          explanation: 'Structured questions to drive consensus and unblock ambiguous product definitions.',
          intentModes: ['explore', 'decide'],
          config: {}
        },
        {
          id: 'w-insights',
          type: 'InsightList',
          title: 'Self-Proving Insights',
          description: 'AI-verified statements categorized into facts, calculations, and hypotheses',
          dataSourceIds: ['project-tasks', 'project-blockers'],
          layout: { colSpan: 12, order: 8 },
          isPinned: false,
          explanation: 'Provides full transparent backing, underlying calculations, and explicit assumptions for every finding.',
          intentModes: ['explore', 'decide', 'execute'],
          config: {}
        }
      ]
    };
  }

  /**
   * Sales Decline Workspace (Scenario A)
   */
  static createSalesDeclineWorkspace(goal, preferences = {}) {
    return {
      id: `ws-${Date.now()}`,
      title: 'Sales Performance & Revenue Analysis',
      goal: goal || 'Analyze why sales are declining and build recovery options',
      intentMode: preferences.defaultIntentMode || 'explore',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      explanation: 'Constructed an analytical workspace isolating top revenue drivers, regional drop-offs, weekly order trajectories, and data-backed observations to diagnose the 14.2% quarterly sales decline.',
      userPreferences: {
        density: preferences.density || 'comfortable',
        themeAccent: 'indigo',
        defaultIntentMode: 'explore',
      },
      activeFilters: { region: 'All Regions' },
      missingInfo: [
        {
          id: 'info-s1',
          label: 'Competitor Promotional Activity',
          description: 'Confirm if Q3 competitor discounts impacted West region conversion',
          value: '',
          required: false,
          resolved: false,
        }
      ],
      widgets: [
        {
          id: 'w-sales-kpis',
          type: 'SummaryCards',
          title: 'Revenue & Deal Health KPIs',
          description: 'High-level metrics with period-over-period delta comparisons',
          dataSourceIds: ['sales-summary'],
          layout: { colSpan: 12, order: 1 },
          isPinned: true,
          explanation: 'Immediate pulse check on net revenue, closed deals, and conversion rates across active filters.',
          intentModes: ['explore', 'decide', 'execute'],
          config: {}
        },
        {
          id: 'w-sales-chart',
          type: 'ChartWidget',
          title: 'Weekly Sales Revenue vs. Target',
          description: '10-week revenue trajectory highlighting widening gap from September onwards',
          dataSourceIds: ['sales-history'],
          layout: { colSpan: 8, order: 2 },
          isPinned: true,
          explanation: 'Visual evidence demonstrating revenue dipped below target starting Week 5 (Aug 29).',
          intentModes: ['explore', 'decide', 'execute'],
          config: { chartType: 'area' }
        },
        {
          id: 'w-sales-region',
          type: 'ChartWidget',
          title: 'Regional Revenue Breakdown',
          description: 'Interactive regional distribution; click a region to filter connected cards',
          dataSourceIds: ['sales-by-region'],
          layout: { colSpan: 4, order: 3 },
          isPinned: false,
          explanation: 'Highlights North America - West as the outlier with a -24.6% decline.',
          intentModes: ['explore', 'decide'],
          config: { chartType: 'bar' }
        },
        {
          id: 'w-insights',
          type: 'InsightList',
          title: 'Self-Proving Insights',
          description: 'Data-verified facts, calculations, and unverified hypotheses',
          dataSourceIds: ['sales-summary', 'sales-by-region', 'sales-history'],
          layout: { colSpan: 12, order: 4 },
          isPinned: false,
          explanation: 'Distinguishes observed facts (West region down 24.6%) from hypotheses regarding market competition.',
          intentModes: ['explore', 'decide', 'execute'],
          config: {}
        }
      ]
    };
  }

  /**
   * Project Recovery Workspace (Scenario B)
   */
  static createProjectRecoveryWorkspace(goal, preferences = {}) {
    return {
      id: `ws-${Date.now()}`,
      title: 'Project Schedule Recovery Command',
      goal: goal || 'Recover delayed project schedule and evaluate trade-offs',
      intentMode: preferences.defaultIntentMode || 'decide',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      explanation: 'Built a focused recovery workspace highlighting blocked dependencies, overdue items, resource bottlenecks, and trade-off comparisons to realign project milestones.',
      userPreferences: {
        density: preferences.density || 'comfortable',
        themeAccent: 'indigo',
        defaultIntentMode: 'decide',
      },
      activeFilters: {},
      missingInfo: [],
      widgets: [
        {
          id: 'w-timeline',
          type: 'Timeline',
          title: 'Project Timeline & Critical Path',
          description: 'Baseline schedule vs. recovery options',
          dataSourceIds: ['project-tasks'],
          layout: { colSpan: 8, order: 1 },
          isPinned: true,
          explanation: 'Surfaces upstream blockers affecting downstream delivery dates.',
          intentModes: ['explore', 'decide', 'execute'],
          config: {}
        },
        {
          id: 'w-blockers',
          type: 'BlockerList',
          title: 'Active Blockers & Single Points of Failure',
          description: 'Unresolved obstacles delaying critical path tasks',
          dataSourceIds: ['project-blockers'],
          layout: { colSpan: 4, order: 2 },
          isPinned: true,
          explanation: 'Identifies Devon Patel single-engineer dependency as primary risk factor.',
          intentModes: ['explore', 'decide'],
          config: {}
        },
        {
          id: 'w-decision',
          type: 'DecisionComparison',
          title: 'Recovery Strategy Comparison',
          description: 'Evaluate Delay vs Scope Reduction vs Secondary Engineer',
          dataSourceIds: ['decision-options'],
          layout: { colSpan: 12, order: 3 },
          isPinned: false,
          explanation: 'Calculated trade-offs comparing timeline impact against budget and customer risk.',
          intentModes: ['decide', 'execute'],
          config: {}
        },
        {
          id: 'w-tasks',
          type: 'TaskList',
          title: 'Immediate Recovery Action Items',
          description: 'Owner-assigned tasks to execute the chosen recovery path',
          dataSourceIds: ['project-tasks'],
          layout: { colSpan: 12, order: 4 },
          isPinned: false,
          explanation: 'Actionable steps to resolve blockers and resume momentum.',
          intentModes: ['decide', 'execute'],
          config: {}
        }
      ]
    };
  }

  /**
   * General Workspace Fallback
   */
  static createGeneralWorkspace(goal, preferences = {}) {
    return {
      id: `ws-${Date.now()}`,
      title: 'Adaptive Workspace',
      goal: goal || 'General workspace goal',
      intentMode: 'explore',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      explanation: `Configured an adaptive workspace tailored to your objective: "${goal}". Loaded relevant business overview, task planning, and insight verification tools.`,
      userPreferences: {
        density: preferences.density || 'comfortable',
        themeAccent: 'indigo',
        defaultIntentMode: 'explore',
      },
      activeFilters: {},
      missingInfo: [
        {
          id: 'info-gen-1',
          label: 'Primary Success Metric',
          description: 'Define numerical or milestone criteria for completion',
          value: '',
          required: true,
          resolved: false,
        }
      ],
      widgets: [
        {
          id: 'w-overview',
          type: 'ProjectOverview',
          title: 'Goal Overview & Scope',
          description: 'Core objectives and parameters',
          dataSourceIds: ['project-overview'],
          layout: { colSpan: 12, order: 1 },
          isPinned: true,
          config: {}
        },
        {
          id: 'w-tasks',
          type: 'TaskList',
          title: 'Action Items & Deliverables',
          description: 'Prioritized task list with progress tracking',
          dataSourceIds: ['project-tasks'],
          layout: { colSpan: 7, order: 2 },
          isPinned: false,
          config: {}
        },
        {
          id: 'w-insights',
          type: 'InsightList',
          title: 'Self-Proving Insights',
          description: 'Verified data and supporting calculations',
          dataSourceIds: ['project-tasks'],
          layout: { colSpan: 5, order: 3 },
          isPinned: false,
          config: {}
        }
      ]
    };
  }

  /**
   * Adapt an existing workspace based on follow-up user instruction.
   * Produces a state patch and human explanation.
   */
  static adaptWorkspace(currentWorkspace, instruction) {
    const text = (instruction || '').toLowerCase().trim();
    const updated = structuredClone(currentWorkspace);
    updated.version = (updated.version || 1) + 1;
    updated.updatedAt = new Date().toISOString();

    let changeSummary = '';
    let simulationTrigger = null;
    let evidenceTrigger = null;

    // Step 2: "Make this a 30-minute meeting and focus on technical feasibility."
    if (
      (text.includes('30') || text.includes('thirty')) &&
      (text.includes('minute') || text.includes('min') || text.includes('technical') || text.includes('agenda'))
    ) {
      const agendaWidget = updated.widgets.find(w => w.type === 'Agenda');
      if (agendaWidget) {
        agendaWidget.title = 'Kickoff Meeting Agenda (30 mins — Technical Focus)';
        agendaWidget.config = {
          totalDuration: 30,
          focus: 'Technical Feasibility & Architecture',
          customItems: [
            { id: 'AG-1', title: 'Context & problem statement', duration: 3, speaker: 'Project Owner', category: 'alignment' },
            { id: 'AG-2', title: 'Technical architecture & API specs', duration: 12, speaker: 'Engineering Lead', category: 'technical' },
            { id: 'AG-3', title: 'Security & compliance gates', duration: 7, speaker: 'Engineering & QA', category: 'technical' },
            { id: 'AG-4', title: 'Resource & contractor feasibility', duration: 5, speaker: 'Engineering & Product', category: 'scope' },
            { id: 'AG-5', title: 'Technical decision sign-off & next steps', duration: 3, speaker: 'All Leads', category: 'action' }
          ]
        };
        agendaWidget.explanation = 'Durations condensed from 60 to exactly 30 minutes. Non-technical roadmap discussions removed; 63% of time reallocated specifically to Technical Architecture, Security Gates, and Feasibility.';
      }

      // Re-order widgets: place Agenda and Timeline at the very top
      updated.widgets.forEach(w => {
        if (w.type === 'Agenda') w.layout.order = 1;
        else if (w.type === 'Timeline') w.layout.order = 2;
        else if (w.type === 'ProjectOverview') w.layout.order = 3;
      });

      changeSummary = 'Redistributed meeting agenda to exactly 30 minutes, prioritized Technical Feasibility (12 mins) and Security Gates (7 mins), and shifted technical delivery widgets to the top of the canvas.';
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }

    // Step 3: "What happens if we delay the project launch by two weeks?"
    if (
      !text.includes('compare') &&
      !text.includes('why') &&
      text.includes('delay') &&
      (text.includes('two week') || text.includes('2 week') || text.includes('what happens') || (text.includes('launch') && !text.includes('scope')))
    ) {
      // Run deterministic simulation using baseline tasks
      const baselineTasks = approvedDataSources['project-tasks'].data;
      const simResult = SchedulingEngine.runSimulation(baselineTasks, 'delay_launch', { weeks: 2 });

      simulationTrigger = {
        openTimeMachine: true,
        simulation: simResult,
      };

      changeSummary = 'Simulated a 2-week launch delay. The deterministic scheduling engine calculated that the public launch milestone moves from Nov 20 to Dec 4 (+14 days), propagating through TASK-2 and TASK-4 on the critical path, with an estimated marketing reschedule cost of +$14,500.';
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }

    // Step 4: "Why do you think this delay affects the launch?"
    if (
      text.includes('why') &&
      (text.includes('think') || text.includes('affect') || text.includes('delay') || text.includes('calculation') || text.includes('proof'))
    ) {
      evidenceTrigger = {
        openEvidenceDrawer: true,
        insightId: 'INS-DELAY-1',
      };

      changeSummary = 'Opened Self-Proving Insights evidence drawer. Displayed explicit dependency chain (TASK-1 -> TASK-2 -> TASK-4 -> TASK-5 -> TASK-6), topological calculation formula, assumptions (zero overtime compression), and confirmed limitations.';
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }

    // Step 5: "Compare delaying the launch with reducing the project scope."
    if (
      text.includes('compare') ||
      (text.includes('scope') && text.includes('delay')) ||
      text.includes('decision') ||
      text.includes('alternative')
    ) {
      // Morph workspace into Decide mode and add DecisionComparison widget
      updated.intentMode = 'decide';
      const hasDecisionWidget = updated.widgets.some(w => w.type === 'DecisionComparison');
      if (!hasDecisionWidget) {
        updated.widgets.unshift({
          id: 'w-decision-compare',
          type: 'DecisionComparison',
          title: 'Strategic Decision Matrix: Delay vs. Scope Reduction',
          description: 'Calculated comparison of launch alternatives, costs, and risks',
          dataSourceIds: ['decision-options'],
          layout: { colSpan: 12, order: 0 },
          isPinned: true,
          explanation: 'Evaluates Option A (2-week delay), Option B (scope reduction deferring analytics), and Option C (secondary engineer).',
          intentModes: ['decide'],
          config: {}
        });
      }

      changeSummary = 'Morphed workspace into Decide mode and introduced the Decision Matrix comparing 2-Week Launch Delay against Scope Reduction and Contractor Addition.';
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }

    // Step 6: "Turn the recommended option into an action plan."
    if (
      text.includes('action plan') ||
      text.includes('turn') && text.includes('action') ||
      text.includes('execute') ||
      text.includes('recommended option')
    ) {
      // Morph workspace into Execute mode
      updated.intentMode = 'execute';

      // Ensure TaskList and GoalProgress are prominent
      const hasProgress = updated.widgets.some(w => w.type === 'GoalProgress');
      if (!hasProgress) {
        updated.widgets.unshift({
          id: 'w-goal-progress',
          type: 'GoalProgress',
          title: 'Action Plan Execution Tracker',
          description: 'Step-by-step implementation sequence for Option A: Managed Delay & Scope Lock',
          dataSourceIds: ['project-tasks'],
          layout: { colSpan: 12, order: 0 },
          isPinned: true,
          explanation: 'Converts chosen decision into an 8-step actionable workflow with owner sign-offs.',
          intentModes: ['execute'],
          config: {}
        });
      }

      // Re-order to prioritize TaskList
      updated.widgets.forEach(w => {
        if (w.type === 'TaskList') {
          w.layout.colSpan = 12;
          w.layout.order = 1;
        }
      });

      changeSummary = 'Switched workspace to Execute mode. Generated an interactive 8-step Action Plan execution tracker and prioritized owner-assigned tasks and deadlines.';
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }

    // Follow-up: "Make this more compact."
    if (text.includes('compact') || text.includes('denser') || text.includes('density')) {
      updated.userPreferences.density = 'compact';
      changeSummary = 'Adjusted workspace density preference to compact mode, tightening widget row heights and padding.';
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }

    // Follow-up: "Show the most important risks"
    if (text.includes('risk') || text.includes('blocker')) {
      const riskWidget = updated.widgets.find(w => w.type === 'RiskList' || w.type === 'BlockerList');
      if (riskWidget) {
        riskWidget.layout.colSpan = 12;
        riskWidget.layout.order = 0;
        riskWidget.isPinned = true;
      }
      changeSummary = 'Prioritized project risks widget at the top of the canvas and expanded width to full width.';
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }

    // Follow-up: "Remove the activity feed" or remove any widget
    if (text.includes('remove') || text.includes('hide')) {
      const targetName = text.replace(/remove|hide|the|widget/g, '').trim();
      const initialCount = updated.widgets.length;
      updated.widgets = updated.widgets.filter(w => 
        !w.title.toLowerCase().includes(targetName) &&
        !w.type.toLowerCase().includes(targetName)
      );
      const removedCount = initialCount - updated.widgets.length;
      changeSummary = removedCount > 0 ? `Removed requested widget matching "${targetName}".` : `Widget "${targetName}" was not found or already removed.`;
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }

    // Intent mode switching commands
    if (text === 'explore' || text.includes('switch to explore') || text.includes('help me understand')) {
      updated.intentMode = 'explore';
      changeSummary = 'Switched workspace to Explore mode, emphasizing data overviews, risks, and exploratory insights.';
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }
    if (text === 'decide' || text.includes('switch to decide') || text.includes('help me decide')) {
      updated.intentMode = 'decide';
      changeSummary = 'Switched workspace to Decide mode, emphasizing trade-off comparisons, criteria, and decision checklists.';
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }
    if (text === 'execute' || text.includes('switch to execute') || text.includes('action mode')) {
      updated.intentMode = 'execute';
      changeSummary = 'Switched workspace to Execute mode, emphasizing task lists, deadlines, and milestone progress tracking.';
      return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
    }

    // Generic follow-up
    changeSummary = `Processed follow-up instruction: "${instruction}". Updated workspace context and preserved all pinned components.`;
    return { updatedWorkspace: updated, changeSummary, simulationTrigger, evidenceTrigger };
  }
}
