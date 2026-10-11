import React from 'react';
import { ComponentType, ComponentSpec } from '../types/workspace';

// General
import { MetricCard } from './general/MetricCard';
import { ActivityTimeline } from './general/ActivityTimeline';
import { RecommendationCard } from './general/RecommendationCard';
import { WorkspaceExplanationPanel } from './general/WorkspaceExplanationPanel';
import { WorkspaceChangeSummary } from './general/WorkspaceChangeSummary';

// Client & Comm
import { ClientProfileCard } from './clients/ClientProfileCard';
import { MeetingAgendaPanel } from './clients/MeetingAgendaPanel';
import { MeetingNotesPanel } from './clients/MeetingNotesPanel';
import { OpenIssuesList } from './clients/OpenIssuesList';
import { CommunicationTimeline } from './clients/CommunicationTimeline';

// Analytics
import { UsageTrendChart } from './analytics/UsageTrendChart';
import { FeatureAdoptionChart } from './analytics/FeatureAdoptionChart';
import { ReleaseTimeline } from './analytics/ReleaseTimeline';
import { SupportIncidentList } from './analytics/SupportIncidentList';
import { EvidenceBasedInsightList } from './analytics/EvidenceBasedInsightList';

// Projects & Tasks
import { OverdueTasksTable } from './projects/OverdueTasksTable';
import { PriorityDistributionChart } from './projects/PriorityDistributionChart';
import { ProjectProgressCard } from './projects/ProjectProgressCard';
import { TeamWorkloadPanel } from './projects/TeamWorkloadPanel';
import { DependencyIndicator } from './projects/DependencyIndicator';

// Scheduling
import { MeetingScheduler } from './scheduling/MeetingScheduler';
import { AvailabilityPanel } from './scheduling/AvailabilityPanel';
import { AttendeeSelector } from './scheduling/AttendeeSelector';
import { AgendaEditor } from './scheduling/AgendaEditor';
import { UserDatasetTable } from './general/UserDatasetTable';

// Registry Map
export const COMPONENT_REGISTRY: Record<ComponentType, React.FC<{ spec: ComponentSpec }>> = {
  // General
  MetricCard,
  TrendIndicator: MetricCard,
  ActivityTimeline,
  RecommendationCard,
  InsightPanel: EvidenceBasedInsightList,
  FilterBar: () => <div className="text-xs text-gray-400">Filter Bar</div>,
  SearchPanel: () => <div className="text-xs text-gray-400">Search Panel</div>,
  DataTable: OverdueTasksTable,
  EmptyState: ({ spec }) => (
    <div className="py-10 text-center text-sm text-[var(--text-secondary)]">
      {spec.config?.message || 'No data available'}
    </div>
  ),
  LoadingState: () => <div className="text-xs text-gray-400 animate-pulse">Loading component...</div>,
  WorkspaceExplanationPanel,
  IntentHistorySwitcher: () => null,
  WorkspaceChangeSummary,
  UserDatasetTable,

  // Client & Comm
  ClientProfileCard,
  ClientHealthCard: ClientProfileCard,
  CommunicationTimeline,
  OpenIssuesList,
  MeetingNotesPanel,
  MeetingAgendaPanel,

  // Analytics
  UsageTrendChart,
  FeatureAdoptionChart,
  PeriodComparisonCard: UsageTrendChart,
  ReleaseTimeline,
  SupportIncidentList,
  EvidenceBasedInsightList,

  // Projects & Tasks
  ProjectProgressCard,
  OverdueTasksTable,
  PriorityDistributionChart,
  TeamWorkloadPanel,
  TaskDetailDrawer: OverdueTasksTable,
  DependencyIndicator,

  // Scheduling
  MeetingScheduler,
  DatePicker: MeetingScheduler,
  TimeSlotSelector: AvailabilityPanel,
  AttendeeSelector,
  AvailabilityPanel,
  AgendaEditor,
  MeetingConfirmationCard: MeetingScheduler,
};

export function getComponentForType(type: ComponentType): React.FC<{ spec: ComponentSpec }> {
  const comp = COMPONENT_REGISTRY[type];
  if (!comp) {
    console.warn(`Unrecognized component type: ${type}; falling back to default view.`);
    return MetricCard;
  }
  return comp;
}
