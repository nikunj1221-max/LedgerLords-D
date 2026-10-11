import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UIPlanSchema } from '../../schemas/uiPlan';
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

test('explicit meeting scheduling shows the scheduler with its integrated attendee picker', async () => {
  const plan = await fallbackPlanner.plan({ prompt: 'Prepare a new meeting with selected attendees.' });

  assert.equal(plan.intent, 'schedule_meeting');
  assert.ok(plan.components.some(component => component.type === 'MeetingScheduler'));
  assert.deepEqual(plan.components[0].config, undefined);
  assert.deepEqual(
    plan.components.slice(1).map(component => component.type),
    ['ClientProfileCard', 'MeetingAgendaPanel', 'MeetingNotesPanel', 'OpenIssuesList', 'CommunicationTimeline']
  );
});

test('new meeting context only includes sources present in uploaded data', async () => {
  const plan = await fallbackPlanner.plan({
    prompt: 'Prepare a new meeting with selected attendees.',
    userDatasets: [{
      id: 'private-dataset-1',
      name: 'client-data.csv',
      recordCount: 3,
      columns: [],
      sources: ['clients', 'meetings'],
    }],
  });

  assert.deepEqual(
    plan.components.map(component => component.type),
    ['MeetingScheduler', 'ClientProfileCard', 'MeetingAgendaPanel']
  );
});

test('new meeting plans do not retain a pinned agenda with old attendees', async () => {
  const previousPlan = UIPlanSchema.parse({
    id: 'previous-plan',
    intent: 'client_meeting_prep',
    intentLabel: 'Meeting brief',
    title: 'Old meeting brief',
    subtitle: '',
    prompt: 'Prepare for the existing meeting.',
    components: [{
      id: 'old-meeting-agenda',
      type: 'MeetingAgendaPanel',
      title: 'Old agenda',
      dataSource: 'meetings',
      explanation: 'An existing meeting agenda.',
      config: { meetingId: 'meet-1' },
      pinned: true,
    }],
    dataSources: ['meetings'],
    explanations: { overallRationale: 'Old briefing.', selectedSources: ['meetings'] },
  });
  const plan = await fallbackPlanner.plan({
    prompt: 'Prepare a new meeting with selected attendees.',
    previousPlan,
    pinnedComponentIds: ['old-meeting-agenda'],
  });

  assert.deepEqual(
    plan.components.map(component => component.type),
    ['MeetingScheduler', 'ClientProfileCard', 'MeetingAgendaPanel', 'MeetingNotesPanel', 'OpenIssuesList', 'CommunicationTimeline']
  );
  assert.equal(plan.components.some(component => component.id === 'old-meeting-agenda'), false);
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
