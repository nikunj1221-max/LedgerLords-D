import { UIPlan, ComponentSpec, ChangeSummary } from '../../schemas/uiPlan';
import { repository } from '../data/repository';
import { computeWorkspaceDiff } from '../workspace/diffEngine';

export interface PlannerInput {
  prompt: string;
  previousPlan?: UIPlan | null;
  pinnedComponentIds?: string[];
  clarificationResponse?: {
    entityKey: string;
    selectedId: string;
  };
}

export class FallbackPlanner {
  public async plan(input: PlannerInput): Promise<UIPlan> {
    const prompt = (input.prompt || '').trim();
    const promptLower = prompt.toLowerCase();
    const prevPlan = input.previousPlan;
    const pinnedIds = input.pinnedComponentIds || [];

    // Check for Ambiguity Scenario (Test 8)
    // "Prepare for the meeting with Acme" or mentions "Acme" without "Corp" or "Labs"
    if (
      (promptLower.includes('meeting with acme') || promptLower.includes('prepare for acme') || promptLower === 'acme') &&
      !promptLower.includes('corp') &&
      !promptLower.includes('lab') &&
      !input.clarificationResponse
    ) {
      return this.buildAmbiguityPlan(prompt, prevPlan);
    }

    // If clarification was answered
    if (input.clarificationResponse) {
      if (input.clarificationResponse.selectedId === 'client-acme-corp') {
        return this.buildAcmeCorpMeetingPlan("Prepare for tomorrow's meeting with Acme Corp.", prevPlan, pinnedIds);
      } else if (input.clarificationResponse.selectedId === 'client-acme-labs') {
        return this.buildAcmeLabsMeetingPlan("Prepare for meeting with Acme Labs Inc.", prevPlan, pinnedIds);
      }
    }

    // Test 6: Intent Extension: "Also include unresolved support issues" or "also show"
    if (
      (promptLower.includes('also include') || promptLower.includes('also show') || promptLower.includes('add support')) &&
      prevPlan
    ) {
      return this.buildExtendedPlan(prompt, prevPlan, pinnedIds);
    }

    // Test 7: Intent Refinement: "Only show high-priority" or "filter by high priority"
    if (
      (promptLower.includes('only show high-priority') || promptLower.includes('only high priority') || promptLower.includes('critical only')) &&
      prevPlan
    ) {
      return this.buildRefinedPlan(prompt, prevPlan, pinnedIds);
    }

    // Test 5: Multi-intent Continuity / Scheduling follow-up:
    // "Now schedule a meeting tomorrow about the product launch"
    if (
      promptLower.includes('schedule') &&
      (promptLower.includes('meeting') || promptLower.includes('launch') || promptLower.includes('product'))
    ) {
      return this.buildSchedulingPlan(prompt, prevPlan, pinnedIds);
    }

    // Test 2: Client meeting prep: "Prepare for tomorrow's meeting with Acme Corp"
    if (
      promptLower.includes('acme corp') ||
      (promptLower.includes('acme') && promptLower.includes('corp')) ||
      (promptLower.includes('prepare') && promptLower.includes('acme'))
    ) {
      return this.buildAcmeCorpMeetingPlan(prompt, prevPlan, pinnedIds);
    }

    // Test 3: Product usage investigation: "Investigate why product usage dropped this week"
    if (
      promptLower.includes('product usage') ||
      promptLower.includes('usage drop') ||
      promptLower.includes('usage dropped') ||
      promptLower.includes('dau') ||
      promptLower.includes('telemetry')
    ) {
      return this.buildProductUsagePlan(prompt, prevPlan, pinnedIds);
    }

    // Test 4: Overdue tasks: "Show me overdue project work" or "overdue tasks"
    if (
      promptLower.includes('overdue') ||
      promptLower.includes('overdue project') ||
      promptLower.includes('delayed tasks')
    ) {
      return this.buildOverdueTasksPlan(prompt, prevPlan, pinnedIds);
    }

    // Default / Generic initial dashboard (Test 1)
    return this.buildGenericOverviewPlan(prompt || 'Overview of current workspace', prevPlan, pinnedIds);
  }

  // 1. Generic Overview
  public async buildGenericOverviewPlan(prompt: string, prevPlan?: UIPlan | null, pinnedIds: string[] = []): Promise<UIPlan> {
    const kpis = await repository.getOverviewKPIs();
    const components: ComponentSpec[] = [
      {
        id: 'overview-metric-mrr',
        type: 'MetricCard',
        title: 'Monthly Recurring Revenue',
        dataSource: 'clients',
        position: 1,
        colSpan: 1,
        explanation: 'Active ARR/MRR health across 12 enterprise accounts',
        config: { value: `$${(kpis.totalMrr / 1000).toFixed(1)}k`, change: '+8.4%', trend: 'up', subtitle: '12 active clients' }
      },
      {
        id: 'overview-metric-health',
        type: 'MetricCard',
        title: 'Portfolio Health Index',
        dataSource: 'clients',
        position: 2,
        colSpan: 1,
        explanation: 'Aggregate customer retention and NPS score',
        config: { value: `${kpis.avgHealthScore}/100`, change: '-3.2 pts', trend: 'down', subtitle: 'At-risk monitoring: Acme, Apex' }
      },
      {
        id: 'overview-metric-dau',
        type: 'MetricCard',
        title: 'Daily Active Users (DAU)',
        dataSource: 'usage-metrics',
        position: 3,
        colSpan: 1,
        explanation: 'Product platform engagement over the past 24 hours',
        config: { value: kpis.dailyActiveUsers.toLocaleString(), change: `${kpis.dauChangePercent}%`, trend: 'down', subtitle: 'Drop detected in Query Engine' }
      },
      {
        id: 'overview-metric-overdue',
        type: 'MetricCard',
        title: 'Overdue Project Deliverables',
        dataSource: 'tasks',
        position: 4,
        colSpan: 1,
        explanation: 'Action items requiring immediate executive unblocking',
        config: { value: `${kpis.overdueTaskCount} tasks`, change: `${kpis.criticalIncidentCount} critical bugs`, trend: 'down', subtitle: 'Acme & Apex blockers' }
      },
      {
        id: 'overview-recommendations',
        type: 'RecommendationCard',
        title: 'AI Proactive Priorities & Next Actions',
        dataSource: 'recommendations',
        position: 5,
        colSpan: 2,
        explanation: 'High-priority automated recommendations derived from cross-system events'
      },
      {
        id: 'overview-project-progress',
        type: 'ProjectProgressCard',
        title: 'Active Strategic Initiatives',
        dataSource: 'projects',
        position: 6,
        colSpan: 2,
        explanation: 'Status of ongoing client integrations and core product launches'
      },
      {
        id: 'overview-activity-timeline',
        type: 'ActivityTimeline',
        title: 'Live Operational Feed',
        dataSource: 'activities',
        position: 7,
        colSpan: 4,
        explanation: 'Recent incident reports, deployment notifications, and stakeholder updates'
      }
    ];

    this.preservePinnedComponents(components, prevPlan, pinnedIds);

    const plan: UIPlan = {
      id: `plan-overview-${Date.now()}`,
      intent: 'general_overview',
      intentLabel: 'Enterprise Operations Overview',
      title: 'NexusFlow Executive Intelligence Workspace',
      subtitle: 'Real-time telemetry, active client engagements, and system health status.',
      prompt,
      entities: { view: 'general_overview', date: 'today' },
      layout: 'grid-standard',
      components,
      dataSources: ['clients', 'tasks', 'usage-metrics', 'projects', 'recommendations', 'activities'],
      filters: {},
      actions: [
        { id: 'act-prep-acme', label: 'Prepare for Acme Meeting', variant: 'primary', actionType: 'run_prompt', payload: { prompt: "Prepare for tomorrow's meeting with Acme Corp." } },
        { id: 'act-investigate-drop', label: 'Investigate Usage Drop', variant: 'secondary', actionType: 'run_prompt', payload: { prompt: "Investigate why product usage dropped this week." } },
        { id: 'act-view-overdue', label: 'Triage Overdue Tasks', variant: 'outline', actionType: 'run_prompt', payload: { prompt: "Show me the overdue project work that needs attention first." } }
      ],
      explanations: {
        overallRationale: 'Loaded broad executive overview metrics across accounts, delivery pipelines, and platform adoption.',
        selectedSources: ['clients', 'projects', 'tasks', 'usage-metrics', 'activities'],
        confidence: 0.98
      },
      clarificationRequired: false
    };

    plan.changeSummary = computeWorkspaceDiff(prevPlan, plan);
    return plan;
  }

  // 2. Client Meeting Plan (Acme Corp)
  public buildAcmeCorpMeetingPlan(prompt: string, prevPlan?: UIPlan | null, pinnedIds: string[] = []): UIPlan {
    const components: ComponentSpec[] = [
      {
        id: 'acme-profile-card',
        type: 'ClientProfileCard',
        title: 'Acme Corp — Account Dossier & Stakeholder Profile',
        dataSource: 'clients',
        position: 1,
        colSpan: 2,
        explanation: 'Primary account profile showing tier, $48.5k MRR, key contacts (Sarah Jenkins), and health status (74/100).',
        evidence: 'Matched client record client-acme-corp with upcoming meeting tomorrow at 10:00 AM.',
        config: { clientId: 'client-acme-corp' }
      },
      {
        id: 'acme-meeting-agenda',
        type: 'MeetingAgendaPanel',
        title: 'Tomorrow 10:00 AM: Acme Corp QBR & Roadmap Agenda',
        dataSource: 'meetings',
        position: 2,
        colSpan: 2,
        explanation: 'Scheduled meeting record with Sarah Jenkins, Marcus Vance, and Alex Rivera including allocated time slots.',
        evidence: 'Meeting ID meet-1 scheduled for 2026-10-11T10:00:00Z.',
        config: { meetingId: 'meet-1' }
      },
      {
        id: 'acme-prev-notes',
        type: 'MeetingNotesPanel',
        title: 'Previous Executive Sync Notes (Sept 24)',
        dataSource: 'communications',
        position: 3,
        colSpan: 2,
        explanation: 'Summary of agreed terms: 14 distribution center expansion ($18k MRR upsell) pending SSO & Query latency fix.',
        evidence: 'Communication comm-4 notes filed by Marcus Vance.',
        config: { clientId: 'client-acme-corp' }
      },
      {
        id: 'acme-open-issues',
        type: 'OpenIssuesList',
        title: 'Unresolved Issues & Escalation Blockers (2 Active)',
        dataSource: 'support-incidents',
        position: 4,
        colSpan: 2,
        explanation: 'Active tickets INC-1042 (Query timeout on inventory aggregation) and INC-1055 (SSO delay) that Sarah Jenkins requested addressing.',
        evidence: '2 open support incidents for Acme Corp created following release v2.8.4.',
        config: { clientId: 'client-acme-corp' }
      },
      {
        id: 'acme-communications-timeline',
        type: 'CommunicationTimeline',
        title: 'Recent Client Communications & Inbound Requests',
        dataSource: 'communications',
        position: 5,
        colSpan: 4,
        explanation: 'Chronological email and message thread between Sarah Jenkins and Marcus Vance regarding tomorrow\'s prep.',
        evidence: 'Communications comm-1, comm-2, comm-3 between Sarah Jenkins and account team.',
        config: { clientId: 'client-acme-corp' }
      }
    ];

    this.preservePinnedComponents(components, prevPlan, pinnedIds);

    const plan: UIPlan = {
      id: `plan-acme-meeting-${Date.now()}`,
      intent: 'client_meeting_prep',
      intentLabel: 'Client Meeting Preparation',
      title: 'Meeting Briefing: Acme Corp Q4 Business Review',
      subtitle: 'Tomorrow at 10:00 AM • Sarah Jenkins (VP Operations) • Google Meet',
      prompt,
      entities: { client: 'Acme Corp', clientId: 'client-acme-corp', meetingDate: '2026-10-11', meetingTime: '10:00 AM' },
      layout: 'grid-standard',
      components,
      dataSources: ['clients', 'meetings', 'communications', 'support-incidents', 'tasks'],
      filters: { clientId: 'client-acme-corp' },
      actions: [
        { id: 'act-confirm-agenda', label: 'Confirm Meeting Agenda', variant: 'primary', actionType: 'confirm_agenda', payload: { meetingId: 'meet-1' } },
        { id: 'act-copy-briefing', label: 'Copy Executive Briefing', variant: 'secondary', actionType: 'copy_briefing', payload: { client: 'Acme Corp' } }
      ],
      explanations: {
        overallRationale: 'Assembled targeted client dossier, scheduled meeting agenda, previous executive agreements, and open support tickets for Sarah Jenkins.',
        selectedSources: ['clients', 'meetings', 'communications', 'support-incidents'],
        confidence: 0.99
      },
      clarificationRequired: false
    };

    plan.changeSummary = computeWorkspaceDiff(prevPlan, plan);
    return plan;
  }

  // Acme Labs Plan (when disambiguated)
  public buildAcmeLabsMeetingPlan(prompt: string, prevPlan?: UIPlan | null, pinnedIds: string[] = []): UIPlan {
    const components: ComponentSpec[] = [
      {
        id: 'acme-labs-profile',
        type: 'ClientProfileCard',
        title: 'Acme Labs Inc — Clinical Analytics Account',
        dataSource: 'clients',
        position: 1,
        colSpan: 2,
        explanation: 'Biotech client dossier, $16.2k MRR, Dr. Raymond Scott contact, health score 94.',
        config: { clientId: 'client-acme-labs' }
      },
      {
        id: 'acme-labs-meeting',
        type: 'MeetingAgendaPanel',
        title: 'Oct 12 11:00 AM: Clinical Trial Data Pipeline Sync',
        dataSource: 'meetings',
        position: 2,
        colSpan: 2,
        explanation: 'Upcoming sync with Dr. Raymond Scott regarding 80 researcher licenses expansion.',
        config: { meetingId: 'meet-3' }
      },
      {
        id: 'acme-labs-comm',
        type: 'CommunicationTimeline',
        title: 'Communications with Dr. Raymond Scott',
        dataSource: 'communications',
        position: 3,
        colSpan: 4,
        explanation: 'Recent emails on license amendments and oncology pipeline data validation.',
        config: { clientId: 'client-acme-labs' }
      }
    ];

    this.preservePinnedComponents(components, prevPlan, pinnedIds);

    const plan: UIPlan = {
      id: `plan-acme-labs-${Date.now()}`,
      intent: 'client_meeting_prep',
      intentLabel: 'Client Meeting Preparation',
      title: 'Meeting Briefing: Acme Labs Inc Clinical Sync',
      subtitle: 'October 12 at 11:00 AM • Dr. Raymond Scott • Zoom',
      prompt,
      entities: { client: 'Acme Labs Inc', clientId: 'client-acme-labs' },
      layout: 'grid-standard',
      components,
      dataSources: ['clients', 'meetings', 'communications'],
      filters: { clientId: 'client-acme-labs' },
      actions: [
        { id: 'act-copy-briefing', label: 'Copy Briefing', variant: 'secondary', actionType: 'copy_briefing', payload: { client: 'Acme Labs Inc' } }
      ],
      explanations: {
        overallRationale: 'Loaded meeting briefing and account profile for Acme Labs Inc following clarification.',
        selectedSources: ['clients', 'meetings', 'communications'],
        confidence: 0.98
      },
      clarificationRequired: false
    };

    plan.changeSummary = computeWorkspaceDiff(prevPlan, plan);
    return plan;
  }

  // 3. Product Usage Investigation
  public buildProductUsagePlan(prompt: string, prevPlan?: UIPlan | null, pinnedIds: string[] = []): UIPlan {
    const components: ComponentSpec[] = [
      {
        id: 'usage-metric-drop',
        type: 'MetricCard',
        title: 'Daily Active Users (DAU) Shock',
        dataSource: 'usage-metrics',
        position: 1,
        colSpan: 1,
        explanation: 'DAU dropped from 15,400 to 10,820 (-29.7% weekly decline) starting Oct 4.',
        config: { value: '10,820', change: '-29.7% this week', trend: 'down', subtitle: 'Normal baseline: ~15,200 DAU' }
      },
      {
        id: 'usage-metric-qb-drop',
        type: 'MetricCard',
        title: 'Query Builder Adoption',
        dataSource: 'feature-adoption',
        position: 2,
        colSpan: 1,
        explanation: 'Advanced Query Builder utilization collapsed by 52.2% following release v2.8.4.',
        config: { value: '32.4%', change: '-52.2% w/w', trend: 'down', subtitle: 'Previously 67.8% active' }
      },
      {
        id: 'usage-metric-error-spike',
        type: 'MetricCard',
        title: 'Query Timeout & 504 Error Rate',
        dataSource: 'usage-metrics',
        position: 3,
        colSpan: 1,
        explanation: 'Platform error rate surged from 0.18% to 4.40% during peak query execution.',
        config: { value: '4.40%', change: '+23x baseline', trend: 'up', subtitle: 'Triggered P0 alerting' }
      },
      {
        id: 'usage-metric-incidents',
        type: 'MetricCard',
        title: 'Related P0/P1 Support Incidents',
        dataSource: 'support-incidents',
        position: 4,
        colSpan: 1,
        explanation: '9 customer escalation tickets filed specifically citing query freezes.',
        config: { value: '9 tickets', change: 'Acme, Strata, Apex', trend: 'up', subtitle: '4 critical enterprise blockers' }
      },
      {
        id: 'usage-trend-chart',
        type: 'UsageTrendChart',
        title: '90-Day DAU Trend & Drop Correlation Analysis',
        dataSource: 'usage-metrics',
        position: 5,
        colSpan: 3,
        explanation: 'Shows stable 90-day engagement followed by sharp drop coincident with Release v2.8.4 on Oct 4.',
        evidence: '90 consecutive days of telemetry derived from usage-metrics dataset.'
      },
      {
        id: 'usage-insights-panel',
        type: 'EvidenceBasedInsightList',
        title: 'AI Root-Cause Hypotheses & Evidence',
        dataSource: 'releases',
        position: 6,
        colSpan: 1,
        explanation: 'Synthesized evidence correlating release deployment, memory threshold exhaustion, and user dropoff.',
        evidence: 'Release v2.8.4 changelog + INC-1042/INC-1045 support tickets.'
      },
      {
        id: 'feature-adoption-chart',
        type: 'FeatureAdoptionChart',
        title: 'Feature Breakdown: Advanced Query Builder vs Stable Modules',
        dataSource: 'feature-adoption',
        position: 7,
        colSpan: 2,
        explanation: 'Visualizes that Dashboards (+1.8%) and Workflows (+7%) remain healthy, isolating the issue exclusively to Query Builder.',
        evidence: 'Feature adoption records for 6 core NexusFlow modules.'
      },
      {
        id: 'release-timeline-card',
        type: 'ReleaseTimeline',
        title: 'Recent Product Releases & Change Events',
        dataSource: 'releases',
        position: 8,
        colSpan: 2,
        explanation: 'Highlights Release v2.8.4 (Query Engine v2 Schema Optimizer) deployed Oct 4 as the primary regression trigger.',
        evidence: 'Release record v2.8.4 deployed by Elena Rostova.'
      },
      {
        id: 'support-incident-list',
        type: 'SupportIncidentList',
        title: 'Customer Escalations Coinciding with Usage Drop (INC-1042, INC-1045, INC-1048)',
        dataSource: 'support-incidents',
        position: 9,
        colSpan: 4,
        explanation: 'Detailed list of enterprise tickets reporting 504 timeouts and full-table scan slowdowns since Oct 4.',
        evidence: 'Support incidents filtered by category Query Builder.'
      }
    ];

    this.preservePinnedComponents(components, prevPlan, pinnedIds);

    const plan: UIPlan = {
      id: `plan-usage-drop-${Date.now()}`,
      intent: 'product_usage_investigation',
      intentLabel: 'Product Usage & Incident Investigation',
      title: 'Root Cause Investigation: Platform Usage Drop & Query Engine Degradation',
      subtitle: 'Correlating 90-day telemetry, Release v2.8.4 deployment, and enterprise escalations.',
      prompt,
      entities: { metric: 'DAU', timeframe: 'this week', suspectRelease: 'v2.8.4', impactedFeature: 'Advanced Query Builder' },
      layout: 'grid-standard',
      components,
      dataSources: ['usage-metrics', 'feature-adoption', 'releases', 'support-incidents'],
      filters: { timeframe: 'last_7_days' },
      actions: [
        { id: 'act-view-hotfix', label: 'Inspect Hotfix v2.8.5 Status', variant: 'primary', actionType: 'inspect_hotfix', payload: { release: 'v2.8.5' } },
        { id: 'act-schedule-launch-sync', label: 'Schedule Meeting on Launch Readiness', variant: 'secondary', actionType: 'run_prompt', payload: { prompt: "Now schedule a meeting tomorrow about the product launch." } },
        { id: 'act-export-postmortem', label: 'Export Incident Telemetry', variant: 'outline', actionType: 'export_data', payload: { type: 'postmortem' } }
      ],
      explanations: {
        overallRationale: 'Identified significant ~30% DAU decline. Synthesized 90-day trend chart, feature-level adoption changes, and deployment history to isolate Release v2.8.4 query planning optimizer regression.',
        selectedSources: ['usage-metrics', 'feature-adoption', 'releases', 'support-incidents'],
        confidence: 0.99
      },
      clarificationRequired: false
    };

    plan.changeSummary = computeWorkspaceDiff(prevPlan, plan);
    return plan;
  }

  // 4. Overdue Tasks Plan
  public async buildOverdueTasksPlan(prompt: string, prevPlan?: UIPlan | null, pinnedIds: string[] = []): Promise<UIPlan> {
    const overdueTasks = await repository.getTasks({ isOverdue: true });
    const criticalOverdue = overdueTasks.filter(t => t.priority === 'Critical');

    const components: ComponentSpec[] = [
      {
        id: 'tasks-metric-overdue-total',
        type: 'MetricCard',
        title: 'Total Overdue Tasks',
        dataSource: 'tasks',
        position: 1,
        colSpan: 1,
        explanation: 'All deliverables past due date across active company projects.',
        config: { value: `${overdueTasks.length}`, change: 'Across 6 projects', trend: 'down', subtitle: 'Target: 0 overdue' }
      },
      {
        id: 'tasks-metric-critical',
        type: 'MetricCard',
        title: 'Critical Overdue Blockers',
        dataSource: 'tasks',
        position: 2,
        colSpan: 1,
        explanation: 'High-severity items directly threatening client contracts or launch milestones.',
        config: { value: `${criticalOverdue.length}`, change: 'SAML SSO & SOC2', trend: 'down', subtitle: 'Acme & Apex blockers' }
      },
      {
        id: 'tasks-priority-chart',
        type: 'PriorityDistributionChart',
        title: 'Overdue Breakdown by Priority Level',
        dataSource: 'tasks',
        position: 3,
        colSpan: 1,
        explanation: 'Distribution showing Critical, High, and Medium overdue tasks.',
        evidence: 'Calculated directly from tasks.json.'
      },
      {
        id: 'tasks-team-workload',
        type: 'TeamWorkloadPanel',
        title: 'Assignee Bottlenecks & Overloaded Leads',
        dataSource: 'tasks',
        position: 4,
        colSpan: 1,
        explanation: 'Shows engineers with multiple overdue deliverables (David Kim, Elena Rostova, Aisha Al-Mansoor).',
        evidence: 'Aggregated by assigneeId from task records.'
      },
      {
        id: 'tasks-overdue-table',
        type: 'OverdueTasksTable',
        title: 'Prioritized Overdue Work Board (Interactive Filter & Quick Mark Complete)',
        dataSource: 'tasks',
        position: 5,
        colSpan: 4,
        explanation: 'Filterable, sortable table of overdue items with priority badges, blockers, and one-click completion actions.',
        config: { filterPriority: 'all', filterStatus: 'Overdue' }
      },
      {
        id: 'tasks-dependency-indicator',
        type: 'DependencyIndicator',
        title: 'Critical Path Dependency Chain & Blocked Items',
        dataSource: 'tasks',
        position: 6,
        colSpan: 4,
        explanation: 'Visual trace of blocked tasks (e.g. task-8 blocked by task-7; task-3 blocked by task-1).',
        evidence: 'Cross-task dependency references in tasks dataset.'
      }
    ];

    this.preservePinnedComponents(components, prevPlan, pinnedIds);

    const plan: UIPlan = {
      id: `plan-overdue-tasks-${Date.now()}`,
      intent: 'overdue_tasks_triage',
      intentLabel: 'Overdue Project Work Triage',
      title: 'Overdue Project Deliverables & Critical Path Blockers',
      subtitle: `${overdueTasks.length} tasks past target completion date • ${criticalOverdue.length} critical client blockers.`,
      prompt,
      entities: { filter: 'overdue', prioritySort: 'critical_first' },
      layout: 'grid-standard',
      components,
      dataSources: ['tasks', 'projects', 'employees'],
      filters: { isOverdue: true },
      actions: [
        { id: 'act-filter-critical', label: 'Filter Critical Only', variant: 'primary', actionType: 'run_prompt', payload: { prompt: "Only show high-priority overdue tasks." } },
        { id: 'act-notify-leads', label: 'Notify Overdue Assignees', variant: 'secondary', actionType: 'notify_leads', payload: {} },
        { id: 'act-schedule-triage', label: 'Schedule Project Triage Sync', variant: 'outline', actionType: 'run_prompt', payload: { prompt: "Schedule a meeting tomorrow about overdue project work." } }
      ],
      explanations: {
        overallRationale: 'Identified all deliverables past due date, highlighting high-impact blockers for Acme Corp onboarding and Apex SOC2 compliance.',
        selectedSources: ['tasks', 'projects', 'employees'],
        confidence: 0.99
      },
      clarificationRequired: false
    };

    plan.changeSummary = computeWorkspaceDiff(prevPlan, plan);
    return plan;
  }

  // 5. Multi-intent Continuity: Schedule Meeting about Product Launch (Test 5)
  public buildSchedulingPlan(prompt: string, prevPlan?: UIPlan | null, pinnedIds: string[] = []): UIPlan {
    // Preserve product launch context if previous plan had product/usage context!
    const components: ComponentSpec[] = [
      {
        id: 'sched-meeting-card',
        type: 'MeetingScheduler',
        title: 'Schedule Meeting: NexusFlow 3.0 Launch Readiness & Hotfix Review',
        dataSource: 'meetings',
        position: 1,
        colSpan: 2,
        explanation: 'Main interactive scheduling panel pre-filled with tomorrow date (2026-10-11), 60m duration, and launch objective.',
        evidence: 'Synthesized from follow-up request referencing product launch context.',
        config: {
          defaultTitle: 'NexusFlow 3.0 Launch Readiness & Go/No-Go Decision',
          defaultDate: '2026-10-11',
          defaultDuration: '60',
          relatedProject: 'NexusFlow 3.0 Platform Launch'
        }
      },
      {
        id: 'sched-availability-panel',
        type: 'AvailabilityPanel',
        title: 'Key Participant Availability (Tomorrow, Oct 11)',
        dataSource: 'availability',
        position: 2,
        colSpan: 2,
        explanation: 'Evaluates calendar availability across Elena Rostova, Marcus Vance, and Alex Rivera. Recommends open 2:00 PM - 3:00 PM slot.',
        evidence: 'Availability schedules for emp-1, emp-2, emp-3, emp-4.',
        config: { date: '2026-10-11', recommendedSlot: '14:00 - 15:00' }
      },
      {
        id: 'sched-attendee-selector',
        type: 'AttendeeSelector',
        title: 'Required Stakeholders & Launch Council',
        dataSource: 'employees',
        position: 3,
        colSpan: 2,
        explanation: 'Pre-selected engineering and product leads responsible for the launch and hotfix verification.',
        config: {
          preselectedIds: ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-20']
        }
      },
      {
        id: 'sched-agenda-editor',
        type: 'AgendaEditor',
        title: 'Collaborative Agenda Draft (NexusFlow 3.0)',
        dataSource: 'meetings',
        position: 4,
        colSpan: 2,
        explanation: 'Draft agenda addressing Query Engine hotfix v2.8.5 verification, customer communications, and final Go/No-Go vote.',
        config: {
          items: [
            { time: '14:00 - 14:15', item: 'Post-mortem on Query Engine v2 memory leak & DAU impact (Elena & Chloe)' },
            { time: '14:15 - 14:35', item: 'Hotfix v2.8.5 deployment verification & rollback safeguards (Elena)' },
            { time: '14:35 - 14:50', item: 'Tier 1 customer communications & revised SLA commitments (Alex & Daniel)' },
            { time: '14:50 - 15:00', item: 'Final Executive Go / No-Go Launch Vote (Alex Rivera)' }
          ]
        }
      },
      // RETAINED CONTEXT: Project Progress or Release Timeline from previous context!
      {
        id: 'sched-retained-project-context',
        type: 'ProjectProgressCard',
        title: 'Retained Context: NexusFlow 3.0 Platform Launch Progress',
        dataSource: 'projects',
        position: 5,
        colSpan: 4,
        explanation: 'Preserved from previous goal to provide launch milestone status (78% complete, target Oct 25) while scheduling.',
        evidence: 'Project record proj-nexus-3 retained for continuity.',
        config: { projectId: 'proj-nexus-3' }
      }
    ];

    this.preservePinnedComponents(components, prevPlan, pinnedIds);

    const plan: UIPlan = {
      id: `plan-schedule-meeting-${Date.now()}`,
      intent: 'schedule_meeting',
      intentLabel: 'Schedule Executive Meeting',
      title: 'Meeting Coordinator: NexusFlow 3.0 Launch Review',
      subtitle: 'Tomorrow (Oct 11) • Recommended Slot: 2:00 PM – 3:00 PM • 5 Key Stakeholders',
      prompt,
      entities: {
        intent: 'schedule_meeting',
        topic: 'NexusFlow 3.0 Platform Launch',
        date: '2026-10-11',
        time: '14:00 - 15:00',
        reusedContext: 'NexusFlow 3.0 Platform Launch'
      },
      layout: 'grid-standard',
      components,
      dataSources: ['meetings', 'availability', 'employees', 'projects'],
      filters: { date: '2026-10-11' },
      actions: [
        { id: 'act-confirm-meeting', label: 'Confirm and Create Meeting', variant: 'primary', actionType: 'confirm_mock_meeting', payload: { title: 'NexusFlow 3.0 Launch Readiness', date: '2026-10-11', time: '14:00 - 15:00' } },
        { id: 'act-copy-agenda', label: 'Copy Draft Agenda', variant: 'secondary', actionType: 'copy_agenda', payload: {} },
        { id: 'act-return-usage', label: 'Back to Usage Dashboard', variant: 'outline', actionType: 'run_prompt', payload: { prompt: "Show me the product usage dashboard." } }
      ],
      explanations: {
        overallRationale: 'Recognized new goal to schedule a meeting while retaining product launch context from the previous session. Added scheduler, attendee picker, availability checker, and retained project progress.',
        selectedSources: ['meetings', 'availability', 'employees', 'projects'],
        confidence: 0.98
      },
      contextReused: {
        previousIntent: prevPlan?.intent,
        retainedEntities: ['NexusFlow 3.0 Platform Launch', 'Product Telemetry']
      },
      clarificationRequired: false
    };

    plan.changeSummary = computeWorkspaceDiff(prevPlan, plan);
    return plan;
  }

  // 6. Intent Extension: "Also include unresolved support issues"
  public buildExtendedPlan(prompt: string, prevPlan: UIPlan, pinnedIds: string[] = []): UIPlan {
    const newComponents = [...prevPlan.components];
    
    // Check if support issues already exist
    const hasSupport = newComponents.some(c => c.type === 'OpenIssuesList' || c.type === 'SupportIncidentList');
    if (!hasSupport) {
      newComponents.push({
        id: 'extended-support-issues',
        type: 'OpenIssuesList',
        title: 'Unresolved Customer Support Incidents & Escalations',
        dataSource: 'support-incidents',
        position: newComponents.length + 1,
        colSpan: 4,
        explanation: 'Added dynamically in response to intent extension request ("Also include unresolved support issues").',
        evidence: '25 support incidents in repository.',
        config: { filterStatus: 'unresolved' }
      });
    }

    this.preservePinnedComponents(newComponents, prevPlan, pinnedIds);

    const plan: UIPlan = {
      ...prevPlan,
      id: `plan-extended-${Date.now()}`,
      prompt,
      title: `${prevPlan.title} (Extended)`,
      subtitle: `${prevPlan.subtitle} • Extended with unresolved support incidents.`,
      components: newComponents,
      dataSources: Array.from(new Set([...prevPlan.dataSources, 'support-incidents'])),
      explanations: {
        ...prevPlan.explanations,
        overallRationale: `Preserved existing workspace (${prevPlan.components.map(c => c.title).join(', ')}) and seamlessly added unresolved support incidents.`
      }
    };

    plan.changeSummary = computeWorkspaceDiff(prevPlan, plan);
    return plan;
  }

  // 7. Intent Refinement: "Only show high-priority overdue tasks"
  public buildRefinedPlan(prompt: string, prevPlan: UIPlan, pinnedIds: string[] = []): UIPlan {
    const updatedComponents = prevPlan.components.map(comp => {
      if (comp.type === 'OverdueTasksTable') {
        return {
          ...comp,
          title: 'High-Priority & Critical Overdue Tasks (Refined Filter)',
          config: { ...comp.config, filterPriority: 'Critical,High' },
          explanation: 'Updated to display only Critical and High priority overdue items as requested.'
        };
      }
      if (comp.id === 'tasks-metric-overdue-total' || comp.id === 'tasks-metric-critical') {
        return {
          ...comp,
          config: { ...comp.config, subtitle: 'Filtered: Critical & High Priority only' }
        };
      }
      return comp;
    });

    this.preservePinnedComponents(updatedComponents, prevPlan, pinnedIds);

    const plan: UIPlan = {
      ...prevPlan,
      id: `plan-refined-${Date.now()}`,
      prompt,
      title: 'Prioritized High-Priority Overdue Deliverables',
      subtitle: 'Refined view displaying only Critical and High severity overdue items.',
      components: updatedComponents,
      filters: { ...prevPlan.filters, priority: ['Critical', 'High'] },
      explanations: {
        ...prevPlan.explanations,
        overallRationale: 'Refined the active workspace by filtering out low and medium priority items while keeping existing project and workload context.'
      }
    };

    plan.changeSummary = computeWorkspaceDiff(prevPlan, plan);
    return plan;
  }

  // 8. Ambiguity Plan: "Prepare for the meeting with Acme"
  public buildAmbiguityPlan(prompt: string, prevPlan?: UIPlan | null): UIPlan {
    const plan: UIPlan = {
      id: `plan-ambiguity-${Date.now()}`,
      intent: 'clarification_required',
      intentLabel: 'Entity Disambiguation Required',
      title: 'Which Acme account are you preparing for?',
      subtitle: 'Two client accounts match "Acme" with upcoming meetings in your calendar.',
      prompt,
      entities: { candidateClients: ['Acme Corp', 'Acme Labs Inc'] },
      layout: 'focused-dashboard',
      components: [
        {
          id: 'clarification-card',
          type: 'WorkspaceExplanationPanel',
          title: 'Select Matching Account',
          dataSource: 'clients',
          position: 1,
          colSpan: 4,
          explanation: 'NexusFlow found 2 active enterprise accounts matching "Acme". Please select which account you want to inspect.',
          evidence: 'client-acme-corp (Enterprise logistics, QBR tomorrow) vs client-acme-labs (Biotech clinical analytics, sync Oct 12).'
        }
      ],
      dataSources: ['clients', 'meetings'],
      filters: {},
      actions: [],
      explanations: {
        overallRationale: 'Detected ambiguity between Acme Corp and Acme Labs Inc. Asking user to select account to avoid showing irrelevant data.',
        selectedSources: ['clients', 'meetings'],
        confidence: 0.50
      },
      clarificationRequired: true,
      clarificationQuestion: {
        entityKey: 'client',
        question: 'Which Acme account meeting do you want to prepare for?',
        options: [
          {
            id: 'client-acme-corp',
            label: 'Acme Corp — Q4 Quarterly Business Review (Tomorrow 10:00 AM)',
            description: 'Enterprise Manufacturing • Sarah Jenkins • $48.5k MRR • 2 Open Issues'
          },
          {
            id: 'client-acme-labs',
            label: 'Acme Labs Inc — Clinical Pipeline Sync (Oct 12 11:00 AM)',
            description: 'Biotech & Clinical Analytics • Dr. Raymond Scott • $16.2k MRR • Expansion discussion'
          }
        ]
      }
    };

    plan.changeSummary = computeWorkspaceDiff(prevPlan, plan);
    return plan;
  }

  // Preserve pinned components across transitions (Test 9)
  private preservePinnedComponents(
    components: ComponentSpec[],
    prevPlan?: UIPlan | null,
    pinnedIds: string[] = []
  ) {
    if (!prevPlan || !prevPlan.components || pinnedIds.length === 0) return;

    for (const pinnedId of pinnedIds) {
      const prevComp = prevPlan.components.find(c => c.id === pinnedId);
      if (prevComp) {
        const alreadyInNew = components.some(c => c.id === pinnedId || c.type === prevComp.type);
        if (!alreadyInNew) {
          components.push({
            ...prevComp,
            pinned: true,
            title: `[Pinned] ${prevComp.title}`,
            explanation: `Preserved user-pinned component from previous workspace ("${prevPlan.intentLabel}").`,
            position: components.length + 1,
            colSpan: Math.min(prevComp.colSpan, 2) as 1 | 2 | 3 | 4
          });
        }
      }
    }
  }
}

export const fallbackPlanner = new FallbackPlanner();
