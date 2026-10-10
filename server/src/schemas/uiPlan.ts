import { z } from 'zod';

export const ComponentTypeSchema = z.enum([
  // General
  'MetricCard',
  'TrendIndicator',
  'ActivityTimeline',
  'RecommendationCard',
  'InsightPanel',
  'FilterBar',
  'SearchPanel',
  'DataTable',
  'EmptyState',
  'LoadingState',
  'WorkspaceExplanationPanel',
  'IntentHistorySwitcher',
  'WorkspaceChangeSummary',
  // Client & Comm
  'ClientProfileCard',
  'ClientHealthCard',
  'CommunicationTimeline',
  'OpenIssuesList',
  'MeetingNotesPanel',
  'MeetingAgendaPanel',
  // Analytics
  'UsageTrendChart',
  'FeatureAdoptionChart',
  'PeriodComparisonCard',
  'ReleaseTimeline',
  'SupportIncidentList',
  'EvidenceBasedInsightList',
  // Projects & Tasks
  'ProjectProgressCard',
  'OverdueTasksTable',
  'PriorityDistributionChart',
  'TeamWorkloadPanel',
  'TaskDetailDrawer',
  'DependencyIndicator',
  // Scheduling
  'MeetingScheduler',
  'DatePicker',
  'TimeSlotSelector',
  'AttendeeSelector',
  'AvailabilityPanel',
  'AgendaEditor',
  'MeetingConfirmationCard'
]);

export interface ComponentSpec {
  id: string;
  type: z.infer<typeof ComponentTypeSchema>;
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

export const ComponentSpecSchema = z.object({
  id: z.string(),
  type: ComponentTypeSchema,
  title: z.string(),
  dataSource: z.string(),
  position: z.number().default(0),
  colSpan: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(2),
  explanation: z.string(),
  evidence: z.string().optional(),
  pinned: z.boolean().optional().default(false),
  filters: z.record(z.any()).optional().default({}),
  config: z.record(z.any()).optional().default({})
});

export interface ChangeSummary {
  added: string[];
  updated: string[];
  retained: string[];
  removed: string[];
  reason: string;
}

export const ChangeSummarySchema = z.object({
  added: z.array(z.string()).default([]),
  updated: z.array(z.string()).default([]),
  retained: z.array(z.string()).default([]),
  removed: z.array(z.string()).default([]),
  reason: z.string().default('Workspace reshaped to align with current goal')
});

export interface ClarificationQuestion {
  entityKey: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
}

export const ClarificationQuestionSchema = z.object({
  entityKey: z.string(),
  question: z.string(),
  options: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional()
  }))
});

export interface ActionItem {
  id: string;
  label: string;
  variant: 'default' | 'primary' | 'secondary' | 'danger' | 'outline';
  actionType: string;
  payload?: Record<string, any>;
}

export const ActionItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  variant: z.enum(['default', 'primary', 'secondary', 'danger', 'outline']).default('default'),
  actionType: z.string(),
  payload: z.record(z.any()).optional().default({})
});

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

export const UIPlanSchema = z.object({
  id: z.string(),
  intent: z.string(),
  intentLabel: z.string(),
  title: z.string(),
  subtitle: z.string(),
  prompt: z.string(),
  entities: z.record(z.any()).default({}),
  layout: z.enum(['grid-standard', 'two-column', 'focused-dashboard', 'split-workspace']).default('grid-standard'),
  components: z.array(ComponentSpecSchema),
  dataSources: z.array(z.string()),
  filters: z.record(z.any()).optional().default({}),
  actions: z.array(ActionItemSchema).optional().default([]),
  explanations: z.object({
    overallRationale: z.string(),
    selectedSources: z.array(z.string()),
    confidence: z.number().min(0).max(1).default(0.95)
  }),
  clarificationRequired: z.boolean().default(false),
  clarificationQuestion: ClarificationQuestionSchema.optional(),
  contextReused: z.record(z.any()).optional().default({}),
  changeSummary: ChangeSummarySchema.optional()
});
