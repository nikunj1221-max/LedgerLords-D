export const DATABASE_SCHEMAS = [
  'Client',
  'Communication',
  'Meeting',
  'UsageMetric',
  'FeatureAdoption',
  'Release',
  'SupportIncident',
  'Project',
  'Task',
  'Employee',
  'Availability',
  'Activity',
  'Recommendation',
  'Unclassified',
] as const;

export type DatabaseSchema = typeof DATABASE_SCHEMAS[number];
export type WorkspaceDataSource =
  | 'clients'
  | 'communications'
  | 'meetings'
  | 'usage-metrics'
  | 'feature-adoption'
  | 'releases'
  | 'support-incidents'
  | 'projects'
  | 'tasks'
  | 'employees'
  | 'availability'
  | 'activities'
  | 'recommendations';

export interface DatasetGroupMapping {
  schema: DatabaseSchema;
  confidence: number;
}

export interface DatasetInterpretation {
  provider: 'groq' | 'ai' | 'field-mapping';
  groups: Record<string, DatasetGroupMapping>;
}

export const SCHEMA_DATA_SOURCES: Partial<Record<DatabaseSchema, WorkspaceDataSource>> = {
  Client: 'clients',
  Communication: 'communications',
  Meeting: 'meetings',
  UsageMetric: 'usage-metrics',
  FeatureAdoption: 'feature-adoption',
  Release: 'releases',
  SupportIncident: 'support-incidents',
  Project: 'projects',
  Task: 'tasks',
  Employee: 'employees',
  Availability: 'availability',
  Activity: 'activities',
  Recommendation: 'recommendations',
};

export const DATA_SOURCE_SCHEMAS: Partial<Record<WorkspaceDataSource, DatabaseSchema>> =
  Object.fromEntries(
    Object.entries(SCHEMA_DATA_SOURCES).map(([schema, source]) => [source, schema])
  ) as Partial<Record<WorkspaceDataSource, DatabaseSchema>>;

export function getRecordGroup(record: Record<string, unknown>): string {
  const sourceFile = record.source_file;
  return typeof sourceFile === 'string' && sourceFile.trim()
    ? sourceFile.trim()
    : '__all__';
}

export function getDatasetGroups(records: Record<string, unknown>[]) {
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const record of records) {
    const group = getRecordGroup(record);
    const existing = groups.get(group) ?? [];
    existing.push(record);
    groups.set(group, existing);
  }
  return groups;
}

const FILE_SCHEMA_MAP: Record<string, DatabaseSchema> = {
  'activities.json': 'Activity',
  'availability.json': 'Availability',
  'clients.json': 'Client',
  'communications.json': 'Communication',
  'employees.json': 'Employee',
  'feature-adoption.json': 'FeatureAdoption',
  'meetings.json': 'Meeting',
  'projects.json': 'Project',
  'recommendations.json': 'Recommendation',
  'releases.json': 'Release',
  'support-incidents.json': 'SupportIncident',
  'tasks.json': 'Task',
  'usage-metrics.json': 'UsageMetric',
};

const FIELD_HINTS: Array<[DatabaseSchema, string[]]> = [
  ['UsageMetric', ['dailyactiveusers', 'totalsessions', 'avgSessionDurationMinutes'.toLowerCase()]],
  ['FeatureAdoption', ['adoptionratepercent', 'previousadoptionratepercent']],
  ['SupportIncident', ['ticketnumber', 'featureimpacted']],
  ['Communication', ['sentiment', 'recipient', 'preview', 'subject']],
  ['Availability', ['timeslots', 'employeeid', 'date']],
  ['Recommendation', ['suggestedaction', 'urgency', 'actionid']],
  ['Activity', ['entitytype', 'entityid', 'timestamp', 'actor']],
  ['Meeting', ['starttime', 'endtime', 'participants', 'agenda']],
  ['Project', ['progress', 'targetdate', 'leadengineername']],
  ['Task', ['hoursestimated', 'blockedby', 'duedate', 'assigneename']],
  ['Release', ['deployedat', 'affectedfeatures', 'changelog']],
  ['Employee', ['department', 'avatar', 'role']],
  ['Client', ['healthscore', 'primarycontact', 'contractrenewaldate', 'mrr']],
];

export function inferDatasetSchema(
  group: string,
  records: Record<string, unknown>[]
): DatabaseSchema {
  const filename = group.split(/[\\/]/).pop()?.toLowerCase();
  if (filename && FILE_SCHEMA_MAP[filename]) return FILE_SCHEMA_MAP[filename];

  const keys = new Set(records.flatMap(record => Object.keys(record)
    .filter(key => record[key] !== null && record[key] !== undefined)
    .map(key => key.replace(/[^a-z0-9]/gi, '').toLowerCase())));
  let bestSchema: DatabaseSchema = 'Unclassified';
  let bestScore = 0;
  for (const [schema, hints] of FIELD_HINTS) {
    const score = hints.filter(hint => keys.has(hint)).length;
    if (score > bestScore) {
      bestSchema = schema;
      bestScore = score;
    }
  }
  return bestScore >= 2 ? bestSchema : 'Unclassified';
}

export function createFieldMappingInterpretation(
  records: Record<string, unknown>[]
): DatasetInterpretation {
  const groups: DatasetInterpretation['groups'] = {};
  for (const [group, groupRecords] of getDatasetGroups(records)) {
    const schema = inferDatasetSchema(group, groupRecords);
    groups[group] = {
      schema,
      confidence: schema === 'Unclassified' ? 0 : 1,
    };
  }
  return { provider: 'field-mapping', groups };
}

export function selectRecordsForSchema(
  records: Record<string, unknown>[],
  schema: DatabaseSchema,
  interpretation?: DatasetInterpretation
): Record<string, unknown>[] {
  const mapping = interpretation ?? createFieldMappingInterpretation(records);
  return records
    .filter(record => mapping.groups[getRecordGroup(record)]?.schema === schema)
    .map(record => Object.fromEntries(
      Object.entries(record).filter(([, value]) => value !== null && value !== undefined)
    ));
}
