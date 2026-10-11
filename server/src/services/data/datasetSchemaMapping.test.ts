import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createFieldMappingInterpretation,
  selectRecordsForSchema,
} from './datasetSchemaMapping';

test('maps known uploaded fixture groups to existing database schemas', () => {
  const interpretation = createFieldMappingInterpretation([
    { source_file: 'clients.json', id: 'client-1', name: 'Example' },
    { source_file: 'usage-metrics.json', date: '2026-01-01', dailyActiveUsers: 20 },
  ]);

  assert.equal(interpretation.groups['clients.json'].schema, 'Client');
  assert.equal(interpretation.groups['usage-metrics.json'].schema, 'UsageMetric');
});

test('serves only rows classified to the requested schema and omits flattened null fields', () => {
  const records = [
    { source_file: 'clients.json', id: 'client-1', name: 'Example', dailyActiveUsers: null },
    { source_file: 'usage-metrics.json', date: '2026-01-01', dailyActiveUsers: 20, name: null },
  ];
  const interpretation = createFieldMappingInterpretation(records);
  const selected = selectRecordsForSchema(records, 'Client', interpretation);

  assert.deepEqual(selected, [{ source_file: 'clients.json', id: 'client-1', name: 'Example' }]);
});
