export type ComponentType =
  // General
  | 'MetricCard'
  | 'TrendIndicator'
  | 'ActivityTimeline'
  | 'RecommendationCard'
  | 'InsightPanel'
  | 'FilterBar'
  | 'SearchPanel'
  | 'DataTable'
  | 'EmptyState'
  | 'LoadingState'
  | 'WorkspaceExplanationPanel'
  | 'IntentHistorySwitcher'
  | 'WorkspaceChangeSummary'
  // Client & Comm
  | 'ClientProfileCard'
  | 'ClientHealthCard'
  | 'CommunicationTimeline'
  | 'OpenIssuesList'
  | 'MeetingNotesPanel'
  | 'MeetingAgendaPanel'
  // Analytics
  | 'UsageTrendChart'
  | 'FeatureAdoptionChart'
  | 'PeriodComparisonCard'
  | 'ReleaseTimeline'
  | 'SupportIncidentList'
  | 'EvidenceBasedInsightList'
  // Projects & Tasks
  | 'ProjectProgressCard'
  | 'OverdueTasksTable'
  | 'PriorityDistributionChart'
  | 'TeamWorkloadPanel'
  | 'TaskDetailDrawer'
  | 'DependencyIndicator'
  // Scheduling
  | 'MeetingScheduler'
  | 'DatePicker'
  | 'TimeSlotSelector'
  | 'AttendeeSelector'
  | 'AvailabilityPanel'
  | 'AgendaEditor'
  | 'MeetingConfirmationCard';

export interface ComponentSpec {
  id: string;
  type: ComponentType;
  title: string;
  dataSource: string;
  position: number;
  colSpan: 1 | 2 | 3 | 4;
  explanation: string;
  evidence?: string;
  pinned?: boolean;
  filters?: Record<string, any>;
  config?: Record<string, any>;
}

export interface ChangeSummary {
  added: string[];
  updated: string[];
  retained: string[];
  removed: string[];
  reason: string;
}

export interface ClarificationQuestion {
  entityKey: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
}

export interface ActionItem {
  id: string;
  label: string;
  variant: 'default' | 'primary' | 'secondary' | 'danger' | 'outline';
  actionType: string;
  payload?: Record<string, any>;
}

export interface UIPlan {
  id: string;
  intent: string;
  intentLabel: string;
  title: string;
  subtitle: string;
  prompt: string;
  entities: Record<string, any>;
  layout: 'grid-standard' | 'two-column' | 'focused-dashboard' | 'split-workspace';
  components: ComponentSpec[];
  dataSources: string[];
  filters?: Record<string, any>;
  actions?: ActionItem[];
  explanations: {
    overallRationale: string;
    selectedSources: string[];
    confidence: number;
  };
  clarificationRequired: boolean;
  clarificationQuestion?: ClarificationQuestion;
  contextReused?: Record<string, any>;
  changeSummary?: ChangeSummary;
}

export interface HistoryItem {
  timestamp: string;
  prompt: string;
  intent: string;
  intentLabel: string;
  plan: UIPlan;
}
