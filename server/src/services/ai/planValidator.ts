import { z } from 'zod';
import { ComponentTypeSchema, UIPlan, UIPlanSchema, ComponentSpec } from '../../schemas/uiPlan';
import { computeWorkspaceDiff } from '../workspace/diffEngine';
import { allowedConfigKeys, allowedFilterKeys, COMPONENT_CONTRACT } from './componentContract';

// Confirm both lists with your backend teammate.
export const INTENTS = [
  'general_overview', 'client_meeting_prep', 'product_usage_investigation',
  'overdue_tasks_triage', 'schedule_meeting', 'workspace_refinement',
  'custom_goal', 'clarification_required',
] as const;

export const DATA_SOURCES = [
  'clients', 'tasks', 'usage-metrics', 'projects', 'recommendations', 'activities',
  'meetings', 'communications', 'support-incidents', 'feature-adoption',
  'releases', 'availability', 'employees', 'user-data',
] as const;

const CONFIDENCE = { high: 0.9, medium: 0.7, low: 0.4 } as const;
const MEETING_BRIEF_COMPONENTS = new Set([
  'ClientProfileCard',
  'MeetingAgendaPanel',
  'MeetingNotesPanel',
  'OpenIssuesList',
  'CommunicationTimeline',
]);
const MEETING_CONTEXT_SOURCES: Record<string, string> = {
  ClientProfileCard: 'clients',
  MeetingAgendaPanel: 'meetings',
  MeetingNotesPanel: 'communications',
  OpenIssuesList: 'support-incidents',
  CommunicationTimeline: 'communications',
};
const MEETING_CONTEXT_COMPONENT_TYPES = new Set([
  ...Object.keys(MEETING_CONTEXT_SOURCES),
  'MeetingConfirmationCard',
]);

function isNewMeetingRequest(prompt: string): boolean {
  return (
    (/\b(schedule|shecdule|sched|book|set up|arrange|create)\b/i.test(prompt) &&
      /\b(meeting|call|calendar event)\b/i.test(prompt)) ||
    /\bprepare\s+(?:(?:a|the)\s+)?(?:new\s+)?meeting\b/i.test(prompt) ||
    /schedule\s+meeting/i.test(prompt) ||
    /shecdule\s+meeting/i.test(prompt)
  );
}

const DraftComponent = z.object({
  retainId: z.string().optional(),
  type: ComponentTypeSchema,
  title: z.string().min(1).max(120),
  dataSource: z.enum(DATA_SOURCES),
  colSpan: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).default(2),
  explanation: z.string().min(1).max(300),
  filters: z.record(z.any()).default({}),
  config: z.record(z.any()).default({}),
});

export const PlanDraftSchema = z.object({
  intent: z.enum(INTENTS),
  intentLabel: z.string().min(1),
  title: z.string().min(1).max(140),
  subtitle: z.string().max(240).default(''),
  entities: z.record(z.any()).default({}),
  layout: z.enum(['grid-standard', 'two-column', 'focused-dashboard', 'split-workspace']).default('grid-standard'),
  components: z.array(DraftComponent).min(1).max(10),
  rationale: z.string().min(1).max(500),
  confidence: z.enum(['high', 'medium', 'low']),
  suggestedPrompts: z.array(z.object({ label: z.string().min(1), prompt: z.string().min(1) })).max(3).default([]),
  clarification: z.object({
    entityKey: z.string(),
    question: z.string().min(1),
    options: z.array(z.object({ id: z.string(), label: z.string(), description: z.string().optional() })).min(2).max(4),
  }).optional(),
});
export type PlanDraft = z.infer<typeof PlanDraftSchema>;

export interface ValidationContext {
  prompt: string;
  previousPlan?: UIPlan | null;
  pinnedComponentIds?: string[];
  userDatasetIds?: string[];
  userDataSources?: string[];
}
export type PlanResult =
  | { ok: true; plan: UIPlan }
  | { ok: false; stage: 'schema' | 'semantic'; issues: string[] };

/** Known config value aliases → canonical value */
const CONFIG_ALIASES: Record<string, Record<string, string>> = {
  filterStatus: {
    unresolved: 'unresolved',
    open: 'unresolved',
    investigating: 'unresolved',
  },
  filterPriority: {
    high: 'Critical,High',
    'high,critical': 'Critical,High',
    'critical,high': 'Critical,High',
    critical: 'Critical',
  },
  trend: {
    positive: 'up',
    negative: 'down',
    flat: 'neutral',
    stable: 'neutral',
  },
};

function normalizeConfigValue(key: string, value: unknown): unknown {
  const aliases = CONFIG_ALIASES[key];
  if (aliases && typeof value === 'string') {
    const lower = value.toLowerCase();
    if (aliases[lower] !== undefined) return aliases[lower];
  }
  return value;
}

function semanticIssues(
  d: PlanDraft,
  prevById: Map<string, ComponentSpec>,
  prompt: string,
  userDatasetIds: string[] = [],
  userDataSources: string[] = []
): string[] {
  const issues: string[] = [];
  const retained = d.components.map(c => c.retainId).filter((x): x is string => !!x);
  for (const id of retained) {
    if (!prevById.has(id)) issues.push(`retainId "${id}" does not exist in the current workspace`);
  }
  if (new Set(retained).size !== retained.length) issues.push('retainId used more than once');

  d.components.forEach((c, i) => {
    if (c.type === 'MetricCard' && ('value' in c.config || 'change' in c.config)) {
      issues.push(`components.${i}: MetricCard numbers must come from data tools; remove config.value/change`);
    }
    if (c.type === 'UserDatasetTable') {
      if (c.dataSource !== 'user-data') {
        issues.push(`components.${i}: UserDatasetTable must use the user-data source`);
      }
      if (
        typeof c.config.datasetId !== 'string' ||
        !userDatasetIds.includes(c.config.datasetId)
      ) {
        issues.push(`components.${i}: datasetId must match one of the signed-in user's uploaded datasets`);
      }
    } else if (c.dataSource === 'user-data') {
      issues.push(`components.${i}: user-data is only supported by UserDatasetTable`);
    } else if (userDatasetIds.length > 0 && !userDataSources.includes(c.dataSource)) {
      issues.push(`components.${i}: ${c.dataSource} is not present in this user's uploaded data`);
    }
  });

  if (userDatasetIds.length > 0) {
    if (
      userDataSources.length === 0 &&
      (d.components.length !== 1 || d.components[0].type !== 'UserDatasetTable')
    ) {
      issues.push('when uploaded data has no recognized schema category, use exactly one UserDatasetTable');
    }
  }

  const schedulesMeeting = isNewMeetingRequest(prompt);
  if (
    (d.intent === 'schedule_meeting' || schedulesMeeting) &&
    !d.components.some(component => component.type === 'MeetingScheduler')
  ) {
    issues.push('meeting scheduling plans must include MeetingScheduler, which contains the attendee picker');
  }
  if (d.intent === 'schedule_meeting' || schedulesMeeting) {
    for (const [type, source] of Object.entries(MEETING_CONTEXT_SOURCES)) {
      if (
        userDatasetIds.length > 0 &&
        userDataSources.length > 0 &&
        !userDataSources.includes(source)
      ) {
        continue;
      }
      if (!d.components.some(component =>
        component.type === type && component.dataSource === source
      )) {
        issues.push(`meeting scheduling plans must include ${type} from ${source} as previous-meeting context`);
      }
    }
  }

  // Task 3: reject duplicate type|dataSource (model should retainId and change filters/config instead)
  const seen = new Set<string>();
  d.components.forEach((c, i) => {
    const key = `${c.type}|${c.dataSource}`;
    if (seen.has(key)) {
      issues.push(`components.${i}: duplicate ${c.type} on ${c.dataSource}; use retainId with changed filters/config instead of adding a second one`);
    }
    seen.add(key);
  });

  const isClarify = d.intent === 'clarification_required';
  if (isClarify !== !!d.clarification) {
    issues.push('clarification must be present if and only if intent is clarification_required');
  }
  if (isClarify && !(d.components.length === 1 && d.components[0].type === 'WorkspaceExplanationPanel')) {
    issues.push('a clarification plan must contain exactly one WorkspaceExplanationPanel');
  }
  if (d.confidence === 'low' && !isClarify) {
    issues.push('low confidence requires a clarification question instead of a guessed workspace');
  }
  return issues;
}

function freshId(type: string, dataSource: string, used: Set<string>): string {
  const slug = (value: string) => value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const base = `ai-${slug(type)}-${slug(dataSource)}`;
  let candidate = base;
  let suffix = 2;
  while (used.has(candidate)) candidate = `${base}-${suffix++}`;
  return candidate;
}

/**
 * Strip config/filter keys not recognized by the frontend React component.
 * Normalize known aliases.
 */
function sanitizeConfig(type: string, rawConfig: Record<string, any>): Record<string, any> {
  const allowed = allowedConfigKeys(type);
  if (allowed.size === 0) return {};
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(rawConfig)) {
    if (allowed.has(k)) {
      out[k] = normalizeConfigValue(k, v);
    }
  }
  return out;
}

function sanitizeFilters(type: string, rawFilters: Record<string, any>): Record<string, any> {
  const allowed = allowedFilterKeys(type);
  if (allowed.size === 0) return {};
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(rawFilters)) {
    if (allowed.has(k)) out[k] = v;
  }
  return out;
}

export function buildPlanFromDraft(raw: unknown, ctx: ValidationContext): PlanResult {
  const parsed = PlanDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, stage: 'schema', issues: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`) };
  }
  const d = parsed.data;
  const prev = ctx.previousPlan ?? null;
  const prevById = new Map((prev?.components ?? []).map(c => [c.id, c] as [string, ComponentSpec]));

  const issues = semanticIssues(d, prevById, ctx.prompt, ctx.userDatasetIds, ctx.userDataSources);
  if (issues.length) return { ok: false, stage: 'semantic', issues };

  const pinned = new Set(ctx.pinnedComponentIds ?? []);
  const used = new Set<string>();
  const components: ComponentSpec[] = d.components.map((c, i) => {
    const { retainId, ...spec } = c;
    const id = retainId ?? freshId(c.type, c.dataSource, used);
    used.add(id);
    return {
      ...spec,
      id,
      position: i + 1,
      pinned: pinned.has(id),
      config: sanitizeConfig(c.type, c.config),
      filters: sanitizeFilters(c.type, c.filters),
    };
  });

  // Pinned components survive, matched by ID (not by type).
  const startsNewMeeting = d.intent === 'schedule_meeting' || isNewMeetingRequest(ctx.prompt);
  if (!ctx.userDatasetIds?.length) {
    for (const id of pinned) {
      const old = prevById.get(id);
      if (
        old &&
        !used.has(id) &&
        !(startsNewMeeting && MEETING_CONTEXT_COMPONENT_TYPES.has(old.type))
      ) {
        components.push({ ...old, pinned: true, position: components.length + 1 });
        used.add(id);
      }
    }
  }

  // Ensure MeetingScheduler is the FIRST component for meeting scheduling
  const schedulerIndex = components.findIndex(c =>
    c.type === 'MeetingScheduler' || c.type === 'MeetingConfirmationCard' || c.type === 'DatePicker'
  );
  if (schedulerIndex > 0) {
    const [scheduler] = components.splice(schedulerIndex, 1);
    scheduler.colSpan = 4;
    components.unshift(scheduler);
  } else if (schedulerIndex === 0) {
    components[0].colSpan = 4;
  } else if (schedulerIndex === -1 && startsNewMeeting) {
    const id = freshId('MeetingScheduler', 'meetings', used);
    used.add(id);
    components.unshift({
      id,
      type: 'MeetingScheduler',
      title: 'Schedule a Meeting',
      dataSource: 'meetings',
      position: 1,
      colSpan: 4,
      explanation: 'Set the meeting date, start time, duration, and invite attendees.',
      pinned: false,
      config: {
        defaultDuration: '45',
        preselectedIds: ['emp-1', 'emp-2']
      },
      filters: {},
    });
  }

  components.forEach((c, idx) => {
    c.position = idx + 1;
  });

  const sources = Array.from(new Set(components.map(c => c.dataSource)));
  const plan: UIPlan = {
    id: `plan-ai-${Date.now()}`,
    intent: d.intent,
    intentLabel: d.intentLabel,
    title: d.title,
    subtitle: d.subtitle,
    prompt: ctx.prompt,
    entities: d.entities,
    layout: d.layout,
    components,
    dataSources: sources,
    filters: {},
    actions: d.suggestedPrompts.map((s, i) => ({
      id: `act-ai-${i + 1}`,
      label: s.label,
      variant: (i === 0 ? 'primary' : 'secondary') as 'primary' | 'secondary',
      actionType: 'run_prompt',
      payload: { prompt: s.prompt },
    })),
    explanations: { overallRationale: d.rationale, selectedSources: sources, confidence: CONFIDENCE[d.confidence] },
    clarificationRequired: !!d.clarification,
    clarificationQuestion: d.clarification,
    contextReused: prev ? { previousIntent: prev.intent } : {},
  };
  plan.changeSummary = computeWorkspaceDiff(prev, plan);

  return { ok: true, plan: UIPlanSchema.parse(plan) }; // final safety net for the frontend contract
}
