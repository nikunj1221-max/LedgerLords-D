import { z } from 'zod';

export const IntentModeSchema = z.enum(['explore', 'decide', 'execute']);

export const WidgetLayoutSchema = z.object({
  colSpan: z.number().min(1).max(12).default(6),
  rowSpan: z.number().optional(),
  order: z.number().default(0),
});

export const InsightTypeSchema = z.enum([
  'observed_fact',
  'calculated_result',
  'hypothesis',
  'recommendation',
  'unknown'
]);

export const EvidenceSchema = z.object({
  insightId: z.string(),
  statement: z.string(),
  type: InsightTypeSchema,
  sourceDataset: z.string(),
  relevantValues: z.record(z.any()).default({}),
  calculationSteps: z.array(z.string()).default([]),
  formula: z.string().optional(),
  assumptions: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  lastUpdated: z.string().optional(),
  validationRequirement: z.string().optional(),
  recommendationCriteria: z.string().optional(),
});

export const WidgetSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string().optional(),
  config: z.record(z.any()).default({}),
  dataSourceIds: z.array(z.string()).default([]),
  layout: WidgetLayoutSchema.default({ colSpan: 6, order: 0 }),
  isPinned: z.boolean().default(false),
  explanation: z.string().optional(),
  intentModes: z.array(IntentModeSchema).optional(),
});

export const MissingInfoItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  value: z.string().default(''),
  required: z.boolean().default(false),
  resolved: z.boolean().default(false),
});

export const WorkspacePlanSchema = z.object({
  id: z.string(),
  title: z.string(),
  goal: z.string(),
  intentMode: IntentModeSchema.default('explore'),
  widgets: z.array(WidgetSchema),
  missingInfo: z.array(MissingInfoItemSchema).default([]),
  activeFilters: z.record(z.any()).default({}),
  userPreferences: z.object({
    density: z.enum(['compact', 'comfortable']).default('comfortable'),
    themeAccent: z.string().default('indigo'),
    defaultIntentMode: IntentModeSchema.default('explore'),
  }).default({
    density: 'comfortable',
    themeAccent: 'indigo',
    defaultIntentMode: 'explore',
  }),
  explanation: z.string().default(''),
  version: z.number().default(1),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const FollowUpRequestSchema = z.object({
  instruction: z.string().min(1),
  currentWorkspace: WorkspacePlanSchema,
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).default([]),
});

export const SimulationRequestSchema = z.object({
  scenarioType: z.enum(['delay_launch', 'reassign_task', 'reduce_scope', 'add_resource', 'custom']),
  params: z.record(z.any()),
  baselineTasks: z.array(z.any()).optional(),
  baselineMilestones: z.array(z.any()).optional(),
});
