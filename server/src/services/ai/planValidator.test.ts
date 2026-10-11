import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UIPlanSchema } from '../../schemas/uiPlan';
import { buildPlanFromDraft } from './planValidator';

const spec = (id: string, type: string, dataSource: string) =>
  ({ id, type, title: id, dataSource, explanation: 'e' });
const prev = UIPlanSchema.parse({
  id: 'p0', intent: 'general_overview', intentLabel: 'x', title: 't', subtitle: 's', prompt: 'p',
  components: [spec('metric-1', 'MetricCard', 'clients'), spec('tasks-1', 'OverdueTasksTable', 'tasks')],
  dataSources: ['clients', 'tasks'], explanations: { overallRationale: 'r', selectedSources: [] },
});
const draft = (over: Record<string, unknown> = {}) => ({
  intent: 'overdue_tasks_triage', intentLabel: 'Overdue triage', title: 'Overdue', subtitle: '',
  components: [{ type: 'OverdueTasksTable', title: 'Overdue', dataSource: 'tasks', explanation: 'Shows late work' }],
  rationale: 'User asked for overdue work', confidence: 'high', ...over,
});
const ctx = { prompt: 'show overdue', previousPlan: prev };

test('valid draft becomes a valid UIPlan', () => {
  const r = buildPlanFromDraft(draft(), ctx);
  assert.ok(r.ok);
  if (r.ok) { UIPlanSchema.parse(r.plan); assert.equal(r.plan.components[0].position, 1); assert.deepEqual(r.plan.dataSources, ['tasks']); }
});
test('unknown component type rejected', () => {
  const r = buildPlanFromDraft(draft({ components: [{ type: 'CrystalBall', title: 'x', dataSource: 'tasks', explanation: 'e' }] }), ctx);
  assert.ok(!r.ok && r.stage === 'schema');
});
test('unknown data source rejected', () => {
  const r = buildPlanFromDraft(draft({ components: [{ type: 'DataTable', title: 'x', dataSource: 'payroll', explanation: 'e' }] }), ctx);
  assert.ok(!r.ok);
});
test('retainId must exist in current workspace', () => {
  const r = buildPlanFromDraft(draft({ components: [{ retainId: 'ghost', type: 'DataTable', title: 'x', dataSource: 'tasks', explanation: 'e' }] }), ctx);
  assert.ok(!r.ok && r.stage === 'semantic');
});
test('pinned component survives even if same type is present', () => {
  const d = draft({ components: [{ type: 'MetricCard', title: 'New', dataSource: 'tasks', explanation: 'e' }] });
  const r = buildPlanFromDraft(d, { ...ctx, pinnedComponentIds: ['metric-1'] });
  assert.ok(r.ok);
  if (r.ok) assert.ok(r.plan.components.some(c => c.id === 'metric-1' && c.pinned));
});
test('model-supplied MetricCard numbers rejected', () => {
  const d = draft({ components: [{ type: 'MetricCard', title: 'DAU', dataSource: 'usage-metrics', explanation: 'e', config: { value: '10,820' } }] });
  assert.ok(!buildPlanFromDraft(d, ctx).ok);
});
test('low confidence must clarify, not guess', () => {
  assert.ok(!buildPlanFromDraft(draft({ confidence: 'low' }), ctx).ok);
});
test('valid clarification plan', () => {
  const d = draft({
    intent: 'clarification_required', confidence: 'low',
    components: [{ type: 'WorkspaceExplanationPanel', title: 'Pick one', dataSource: 'clients', explanation: 'Two matches' }],
    clarification: { entityKey: 'client', question: 'Which Acme?', options: [{ id: 'a', label: 'Acme Corp' }, { id: 'b', label: 'Acme Labs' }] },
  });
  const r = buildPlanFromDraft(d, ctx);
  assert.ok(r.ok && r.plan.clarificationRequired);
});
test('model cannot create state-changing actions', () => {
  const d = draft({ actions: [{ id: 'x', label: 'Confirm', actionType: 'confirm_mock_meeting' }], suggestedPrompts: [{ label: 'Next', prompt: 'show usage' }] });
  const r = buildPlanFromDraft(d, ctx);
  assert.ok(r.ok);
  if (r.ok) assert.ok(r.plan.actions!.every(a => a.actionType === 'run_prompt'));
});

// ---- Task 3: duplicate type|dataSource rejection ----
test('duplicate type|dataSource rejected', () => {
  const d = draft({
    components: [
      { type: 'OverdueTasksTable', title: 'Table A', dataSource: 'tasks', explanation: 'e' },
      { type: 'OverdueTasksTable', title: 'Table B', dataSource: 'tasks', explanation: 'e' },
    ],
  });
  const r = buildPlanFromDraft(d, ctx);
  assert.ok(!r.ok);
  if (!r.ok) assert.ok(r.issues.some(i => i.includes('duplicate')));
});
test('same type different dataSource is allowed', () => {
  const d = draft({
    components: [
      { type: 'DataTable', title: 'Table A', dataSource: 'tasks', explanation: 'e' },
      { type: 'DataTable', title: 'Table B', dataSource: 'clients', explanation: 'e' },
    ],
  });
  const r = buildPlanFromDraft(d, ctx);
  assert.ok(r.ok);
});

// ---- Task 4: config stripping and alias normalization ----
test('unknown config keys are stripped', () => {
  const d = draft({
    components: [{ type: 'OverdueTasksTable', title: 'Tasks', dataSource: 'tasks', explanation: 'e', config: { filterPriority: 'all', bogusKey: 'xyz' } }],
  });
  const r = buildPlanFromDraft(d, ctx);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.plan.components[0].config?.filterPriority, 'all');
    assert.equal(r.plan.components[0].config?.bogusKey, undefined);
  }
});
test('config alias normalized (filterPriority "high" -> "Critical,High")', () => {
  const d = draft({
    components: [{ type: 'OverdueTasksTable', title: 'Tasks', dataSource: 'tasks', explanation: 'e', config: { filterPriority: 'high' } }],
  });
  const r = buildPlanFromDraft(d, ctx);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.plan.components[0].config?.filterPriority, 'Critical,High');
});