import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fallbackPlanner } from './fallbackPlanner';

test('uses raw table when an upload has not been classified', async () => {
  const plan = await fallbackPlanner.plan({
    prompt: 'Show me client information',
    userDatasets: [{
      id: 'private-dataset-1',
      name: 'sample-user-dataset.csv',
      recordCount: 5,
      columns: ['client_name', 'industry', 'mrr'],
    }],
  });

  assert.equal(plan.components.length, 1);
  assert.equal(plan.components[0].type, 'UserDatasetTable');
  assert.equal(plan.components[0].dataSource, 'user-data');
  assert.deepEqual(plan.components[0].config, { datasetId: 'private-dataset-1' });
  assert.equal(plan.dataSources.includes('clients'), false);
});

test('uses the usage investigation components backed by classified user data', async () => {
  const plan = await fallbackPlanner.plan({
    prompt: 'Investigate why product usage dropped this week.',
    userDatasets: [{
      id: 'private-dataset-1',
      name: 'all-demo-data-upload.json',
      recordCount: 356,
      columns: ['source_file', 'dailyActiveUsers'],
      sources: ['usage-metrics', 'feature-adoption', 'releases', 'support-incidents'],
    }],
  });

  assert.deepEqual(
    plan.components.map(component => component.type),
    ['UsageTrendChart', 'FeatureAdoptionChart', 'ReleaseTimeline', 'SupportIncidentList']
  );
  assert.deepEqual(plan.dataSources, ['usage-metrics', 'feature-adoption', 'releases', 'support-incidents']);
});

test('uses client and meeting components backed by classified user data', async () => {
  const plan = await fallbackPlanner.plan({
    prompt: 'Prepare a client meeting brief.',
    userDatasets: [{
      id: 'private-dataset-1',
      name: 'all-demo-data-upload.json',
      recordCount: 356,
      columns: [],
      sources: ['clients', 'meetings', 'communications', 'support-incidents'],
    }],
  });

  assert.deepEqual(
    plan.components.map(component => component.type),
    ['ClientProfileCard', 'MeetingAgendaPanel', 'CommunicationTimeline', 'MeetingNotesPanel', 'OpenIssuesList']
  );
  assert.ok(plan.components.every(component => component.dataSource !== 'user-data'));
});
