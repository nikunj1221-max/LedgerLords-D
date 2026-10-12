/**
 * Component Contract — single source of truth.
 *
 * For each ComponentType, this file records:
 *   - which dataSources are valid
 *   - which config keys the React component actually reads (and allowed values if constrained)
 *   - which filter keys the React component reads
 *   - whether it needs a resolved entity id (clientId, meetingId, projectId)
 *   - a one-line "when to use" hint for the system prompt
 *
 * Keep this in sync with the client React components.
 * The LLM prompt's GUIDE section is generated from this file.
 */

export interface ComponentContractEntry {
  dataSources: readonly string[];
  configKeys: Record<string, string>;       // key → description / allowed values
  filterKeys: Record<string, string>;       // key → description / allowed values
  requiresEntityId?: 'clientId' | 'meetingId' | 'projectId';
  usage: string;                            // one-line hint for the system prompt
}

export const COMPONENT_CONTRACT: Record<string, ComponentContractEntry> = {
  // ─── General ────────────────────────────────────────────────
  MetricCard: {
    dataSources: ['clients', 'tasks', 'usage-metrics', 'support-incidents', 'feature-adoption'],
    configKeys: {
      value: 'display value string',
      change: 'change text e.g. "+8%"',
      trend: '"up" | "down" | "neutral"',
      subtitle: 'subtitle text',
    },
    filterKeys: {},
    usage: 'BANNED for LLM — numbers come from data layer; only the fallback planner creates these',
  },
  TrendIndicator: {
    dataSources: ['usage-metrics'],
    configKeys: { value: 'string', change: 'string', trend: '"up"|"down"|"neutral"', subtitle: 'string' },
    filterKeys: {},
    usage: 'BANNED for LLM — alias of MetricCard',
  },
  ActivityTimeline: {
    dataSources: ['activities'],
    configKeys: {},
    filterKeys: {},
    usage: 'recent events across systems',
  },
  RecommendationCard: {
    dataSources: ['recommendations'],
    configKeys: {},
    filterKeys: {},
    usage: 'prioritized suggested next actions',
  },
  InsightPanel: {
    dataSources: ['recommendations'],
    configKeys: {},
    filterKeys: {},
    usage: 'short written summary of findings (renders as EvidenceBasedInsightList)',
  },
  FilterBar: {
    dataSources: ['clients', 'tasks', 'usage-metrics', 'projects', 'recommendations', 'activities', 'meetings', 'communications', 'support-incidents', 'feature-adoption', 'releases', 'availability', 'employees'],
    configKeys: {},
    filterKeys: {},
    usage: 'only if the user asks to filter',
  },
  SearchPanel: {
    dataSources: ['clients', 'tasks', 'usage-metrics', 'projects', 'recommendations', 'activities', 'meetings', 'communications', 'support-incidents', 'feature-adoption', 'releases', 'availability', 'employees'],
    configKeys: {},
    filterKeys: {},
    usage: 'only if the user wants to look something up',
  },
  DataTable: {
    dataSources: ['clients', 'tasks', 'usage-metrics', 'projects', 'recommendations', 'activities', 'meetings', 'communications', 'support-incidents', 'feature-adoption', 'releases', 'availability', 'employees'],
    configKeys: {},
    filterKeys: {},
    usage: 'generic table when nothing else fits (renders as OverdueTasksTable)',
  },
  EmptyState: {
    dataSources: ['clients', 'tasks', 'usage-metrics', 'projects', 'recommendations', 'activities', 'meetings', 'communications', 'support-incidents', 'feature-adoption', 'releases', 'availability', 'employees'],
    configKeys: {},
    filterKeys: {},
    usage: 'only if nothing relevant exists',
  },
  LoadingState: {
    dataSources: [],
    configKeys: {},
    filterKeys: {},
    usage: 'BANNED for LLM — internal use only',
  },
  WorkspaceExplanationPanel: {
    dataSources: ['clients'],
    configKeys: {},
    filterKeys: {},
    usage: 'ONLY inside a clarification plan',
  },
  IntentHistorySwitcher: {
    dataSources: [],
    configKeys: {},
    filterKeys: {},
    usage: 'BANNED for LLM — internal use only',
  },
  WorkspaceChangeSummary: {
    dataSources: [],
    configKeys: {},
    filterKeys: {},
    usage: 'BANNED for LLM — internal use only',
  },
  UserDatasetTable: {
    dataSources: ['user-data'],
    configKeys: { datasetId: 'id of one of the signed-in user datasets' },
    filterKeys: {},
    usage: 'view and search records from a dataset uploaded by the signed-in user',
  },

  // ─── Client & Comm ────────────────────────────────────────
  ClientProfileCard: {
    dataSources: ['clients'],
    configKeys: { clientId: 'known client id' },
    filterKeys: {},
    requiresEntityId: 'clientId',
    usage: 'overview of one client account',
  },
  ClientHealthCard: {
    dataSources: ['clients'],
    configKeys: { clientId: 'known client id' },
    filterKeys: {},
    requiresEntityId: 'clientId',
    usage: 'health/retention signals for one client (renders as ClientProfileCard)',
  },
  CommunicationTimeline: {
    dataSources: ['communications'],
    configKeys: { clientId: 'known client id' },
    filterKeys: {},
    requiresEntityId: 'clientId',
    usage: 'recent emails/messages with a client',
  },
  OpenIssuesList: {
    dataSources: ['support-incidents'],
    configKeys: {
      clientId: 'known client id',
      filterStatus: '"unresolved" — maps to Investigating status',
    },
    filterKeys: {},
    requiresEntityId: 'clientId',
    usage: 'unresolved issues for a client or topic',
  },
  MeetingNotesPanel: {
    dataSources: ['communications'],
    configKeys: { clientId: 'known client id' },
    filterKeys: {},
    requiresEntityId: 'clientId',
    usage: 'notes from a previous meeting',
  },
  MeetingAgendaPanel: {
    dataSources: ['meetings'],
    configKeys: { meetingId: 'known meeting id' },
    filterKeys: {},
    requiresEntityId: 'meetingId',
    usage: 'agenda of an existing meeting',
  },

  // ─── Analytics ────────────────────────────────────────────
  UsageTrendChart: {
    dataSources: ['usage-metrics'],
    configKeys: {},
    filterKeys: {},
    usage: 'usage/DAU trend over time, drops, spikes',
  },
  FeatureAdoptionChart: {
    dataSources: ['feature-adoption'],
    configKeys: {},
    filterKeys: {},
    usage: 'which features gained or lost usage',
  },
  PeriodComparisonCard: {
    dataSources: ['usage-metrics'],
    configKeys: {},
    filterKeys: {},
    usage: 'this period vs previous period (renders as UsageTrendChart)',
  },
  ReleaseTimeline: {
    dataSources: ['releases'],
    configKeys: {},
    filterKeys: {},
    usage: 'recent releases/deploys, "what changed"',
  },
  SupportIncidentList: {
    dataSources: ['support-incidents'],
    configKeys: {},
    filterKeys: {},
    usage: 'support incidents, escalations, bugs (full list with search)',
  },
  EvidenceBasedInsightList: {
    dataSources: ['releases'],
    configKeys: {},
    filterKeys: {},
    usage: 'hypotheses linking evidence to a cause',
  },

  // ─── Projects & Tasks ────────────────────────────────────
  ProjectProgressCard: {
    dataSources: ['projects'],
    configKeys: { projectId: 'known project id' },
    filterKeys: {},
    requiresEntityId: 'projectId',
    usage: 'status of a project or initiative',
  },
  OverdueTasksTable: {
    dataSources: ['tasks'],
    configKeys: {
      filterPriority: '"all" | "Critical,High" — filters displayed tasks',
      filterStatus: '"Overdue" — default filter',
    },
    filterKeys: {},
    usage: 'overdue or late tasks',
  },
  PriorityDistributionChart: {
    dataSources: ['tasks'],
    configKeys: {},
    filterKeys: {},
    usage: 'tasks broken down by priority',
  },
  TeamWorkloadPanel: {
    dataSources: ['tasks'],
    configKeys: {},
    filterKeys: {},
    usage: 'who is overloaded or a bottleneck',
  },
  TaskDetailDrawer: {
    dataSources: ['tasks'],
    configKeys: {},
    filterKeys: {},
    usage: 'details of one task, only if asked (renders as OverdueTasksTable)',
  },
  DependencyIndicator: {
    dataSources: ['tasks'],
    configKeys: {},
    filterKeys: {},
    usage: 'blocked tasks and dependency chains',
  },

  // ─── Scheduling ────────────────────────────────────────────
  MeetingScheduler: {
    dataSources: ['meetings'],
    configKeys: {
      defaultTitle: 'pre-filled meeting title string',
      defaultDate: 'ISO date YYYY-MM-DD',
      defaultDuration: 'minutes as string e.g. "60"',
      relatedProject: 'project name string',
    },
    filterKeys: {},
    usage: 'create/schedule a meeting',
  },
  DatePicker: {
    dataSources: ['availability'],
    configKeys: {},
    filterKeys: {},
    usage: 'choose a date (renders as MeetingScheduler)',
  },
  TimeSlotSelector: {
    dataSources: ['availability'],
    configKeys: {},
    filterKeys: {},
    usage: 'choose a time slot (renders as AvailabilityPanel)',
  },
  AttendeeSelector: {
    dataSources: ['employees'],
    configKeys: {},
    filterKeys: {},
    usage: 'choose attendees',
  },
  AvailabilityPanel: {
    dataSources: ['availability'],
    configKeys: {
      date: 'ISO date YYYY-MM-DD',
      recommendedSlot: 'time range e.g. "14:00 - 15:00"',
    },
    filterKeys: {},
    usage: 'who is free when',
  },
  AgendaEditor: {
    dataSources: ['meetings'],
    configKeys: {
      items: 'array of {time: string, item: string}',
    },
    filterKeys: {},
    usage: 'draft or edit a meeting agenda',
  },
  MeetingConfirmationCard: {
    dataSources: ['meetings'],
    configKeys: {},
    filterKeys: {},
    usage: 'confirmation step after scheduling (renders as MeetingScheduler)',
  },
};

/** Types the LLM is never allowed to create fresh (they carry model-invented numbers). */
export const BANNED_NEW_TYPES = new Set(['MetricCard', 'TrendIndicator', 'LoadingState', 'IntentHistorySwitcher', 'WorkspaceChangeSummary']);

/** All allowed config key names, for stripping unknown keys. */
export function allowedConfigKeys(type: string): Set<string> {
  const entry = COMPONENT_CONTRACT[type];
  return entry ? new Set(Object.keys(entry.configKeys)) : new Set();
}

/** All allowed filter key names. */
export function allowedFilterKeys(type: string): Set<string> {
  const entry = COMPONENT_CONTRACT[type];
  return entry ? new Set(Object.keys(entry.filterKeys)) : new Set();
}

/** Which entity-id key (if any) a component needs in config. */
export function requiredEntityId(type: string): string | undefined {
  return COMPONENT_CONTRACT[type]?.requiresEntityId;
}

/**
 * Build the GUIDE section of the system prompt from the contract.
 * Keeps the format: `- Type | dataSource: ... | config: ... | use: ...`
 */
export function buildGuideFromContract(): string {
  return Object.entries(COMPONENT_CONTRACT)
    .filter(([, v]) => !v.usage.startsWith('BANNED'))
    .map(([type, v]) => {
      const ds = v.dataSources.length ? v.dataSources.join(', ') : '-';
      const cfg = Object.keys(v.configKeys).length
        ? Object.keys(v.configKeys).join(', ')
        : '-';
      return `- ${type} | dataSource: ${ds} | config: ${cfg} | use: ${v.usage}`;
    })
    .join('\n');
}
