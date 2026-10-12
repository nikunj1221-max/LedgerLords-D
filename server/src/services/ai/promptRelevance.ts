const RELEVANT_TERMS = [
  'client', 'customer', 'account', 'company', 'crm', 'meeting', 'calendar', 'attendee',
  'project', 'task', 'overdue', 'deadline', 'employee', 'team', 'workload', 'dependency',
  'product', 'usage', 'adoption', 'release', 'telemetry', 'metric', 'analytics', 'trend',
  'incident', 'support', 'ticket', 'issue', 'communication', 'activity', 'recommendation',
  'revenue', 'sales', 'pipeline', 'report', 'dashboard', 'business', 'dataset', 'upload',
  'record', 'spreadsheet', 'csv', 'json', 'data', 'acme', 'corp', 'inc', 'llc', 'ltd',
];

const CONTEXTUAL_FOLLOW_UP_TERMS = [
  'this', 'that', 'these', 'those', 'it', 'them', 'same', 'more', 'less', 'instead',
  'also', 'only', 'above', 'current', 'previous',
];

const IGNORED_DATASET_TERMS = new Set([
  'name', 'date', 'time', 'type', 'status', 'total', 'value', 'number', 'description',
  'notes', 'id', 'data', 'record', 'records',
]);

export const WORKSPACE_PROMPT_SUGGESTIONS = [
  { label: 'Prepare a new meeting', prompt: 'Prepare a new meeting with selected attendees.' },
  { label: 'Investigate product usage', prompt: 'Investigate why product usage dropped this week.' },
  { label: 'Review overdue work', prompt: 'Show me the overdue project work that needs attention first.' },
];

function hasTerm(prompt: string, terms: string[]): boolean {
  return terms.some(term => new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(prompt));
}

export function isWorkspacePromptRelevant(
  prompt: string,
  options: {
    hasWorkspaceContext?: boolean;
    datasetColumns?: string[][];
  } = {},
): boolean {
  const normalizedPrompt = prompt.trim();
  if (!normalizedPrompt) return false;
  if (hasTerm(normalizedPrompt, RELEVANT_TERMS)) return true;

  const datasetTerms = (options.datasetColumns ?? [])
    .flatMap(columns => columns)
    .flatMap(column => column.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter(term => term.length >= 4 && !IGNORED_DATASET_TERMS.has(term));
  if (hasTerm(normalizedPrompt, datasetTerms)) return true;

  return Boolean(options.hasWorkspaceContext && hasTerm(normalizedPrompt, CONTEXTUAL_FOLLOW_UP_TERMS));
}
