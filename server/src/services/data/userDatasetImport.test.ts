import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importUserDataset } from './userDatasetImport';

test('imports JSON arrays of records and infers columns', () => {
  assert.deepEqual(
    importUserDataset('json', '[{"name":"Ada","active":true},{"name":"Lin"}]'),
    {
      columns: ['name', 'active'],
      records: [{ name: 'Ada', active: true }, { name: 'Lin' }],
    }
  );
});

test('imports CSV with escaped quotes, commas, and newlines', () => {
  assert.deepEqual(
    importUserDataset('csv', 'name,note\r\nAda,"said ""hello"",\r\nthen left"'),
    {
      columns: ['name', 'note'],
      records: [{ name: 'Ada', note: 'said "hello",\r\nthen left' }],
    }
  );
});

test('rejects unsupported JSON shapes and mismatched CSV rows', () => {
  assert.throws(() => importUserDataset('json', '{"name":"Ada"}'), /array of objects/);
  assert.throws(() => importUserDataset('csv', 'name,email\nAda'), /same number of values/);
});
