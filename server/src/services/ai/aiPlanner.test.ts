import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ComponentTypeSchema } from '../../schemas/uiPlan';
import { AIPlannerService, PostFn } from './aiPlanner';
import { buildSystemPrompt } from './plannerPrompt';

delete process.env.AI_CACHE_FILE;

const draft = (over: Record<string, unknown> = {}) => JSON.stringify({
  intent: 'overdue_tasks_triage', intentLabel: 'Overdue triage', title: 'Overdue work', subtitle: '',
  components: [{ type: 'OverdueTasksTable', title: 'Overdue tasks', dataSource: 'tasks', colSpan: 4, explanation: 'Lists late work.' }],
  rationale: 'User asked for overdue work', confidence: 'high', ...over,
});
const fake = (...replies: Array<string | Error>) => {
  const calls: any[] = [];
  const post: PostFn = async (_u, body) => {
    calls.push(JSON.parse(JSON.stringify(body)));
    const next = replies.shift();
    if (next instanceof Error) throw next;
    return { data: { choices: [{ message: { content: next } }] } };
  };
  return { post, calls };
};
const make = (post: PostFn, extra = {}) => new AIPlannerService({ apiKey: 'test-key', post, ...extra });
const input = { prompt: 'show me overdue work' };

test('no key -> deterministic, no HTTP', async () => {
  const f = fake();
  const r = await new AIPlannerService({ apiKey: '', post: f.post }).generatePlan(input);
  assert.equal(r.provider, 'deterministic'); assert.equal(f.calls.length, 0);
});
test('forceFallback skips the LLM', async () => {
  const f = fake(draft());
  const r = await make(f.post, { forceFallback: true }).generatePlan(input);
  assert.equal(r.provider, 'deterministic'); assert.equal(f.calls.length, 0);
});
test('valid LLM draft -> llm plan with generated ids', async () => {
  const f = fake(draft());
  const r = await make(f.post).generatePlan(input);
  assert.equal(r.provider, 'llm'); assert.equal(r.attempts, 1);
  assert.match(r.plan.components[0].id, /^ai-/);
});
test('malformed JSON then valid -> repaired on attempt 2', async () => {
  const f = fake('not json at all', draft());
  const r = await make(f.post).generatePlan(input);
  assert.equal(r.provider, 'llm'); assert.equal(r.attempts, 2);
  assert.equal(f.calls[1].messages.length, 4);
});
test('invalid twice -> deterministic after exactly 2 calls', async () => {
  const bad = draft({ components: [{ type: 'CrystalBall', title: 'x', dataSource: 'tasks', explanation: 'e' }] });
  const f = fake(bad, bad, draft());
  const r = await make(f.post).generatePlan(input);
  assert.equal(r.provider, 'deterministic'); assert.equal(f.calls.length, 2);
  assert.match(r.fallbackReason!, /validation failed/);
});
test('network error -> deterministic, no retry', async () => {
  const f = fake(new Error('ECONNRESET'), draft());
  const r = await make(f.post).generatePlan(input);
  assert.equal(r.provider, 'deterministic'); assert.equal(f.calls.length, 1);
});
test('new MetricCard is rejected by policy', async () => {
  const mc = draft({ components: [{ type: 'MetricCard', title: 'DAU', dataSource: 'usage-metrics', explanation: 'e' }] });
  const f = fake(mc, mc);
  const r = await make(f.post).generatePlan(input);
  assert.equal(r.provider, 'deterministic');
});
test('prompt documents every component type', () => {
  const p = buildSystemPrompt();
  for (const t of ComponentTypeSchema.options) {
    // Banned types appear in the "Never use" line
    assert.ok(p.includes(t), `prompt missing ${t}`);
  }
});
test('prompt anchors component selection and explanations to the requested workflow', () => {
  const p = buildSystemPrompt();
  assert.match(p, /"explanation" is user-facing relevance text/);
  assert.match(p, /For client meeting preparation, prioritize ClientProfileCard, MeetingAgendaPanel, and CommunicationTimeline/);
  assert.match(p, /For product-usage investigations, prioritize UsageTrendChart, FeatureAdoptionChart, ReleaseTimeline, and SupportIncidentList/);
  assert.match(p, /For overdue-work reviews, prioritize OverdueTasksTable, PriorityDistributionChart, TeamWorkloadPanel, and DependencyIndicator/);
});
const rate = (retryAfter: string) =>
  Object.assign(new Error('429'), { isAxiosError: true, response: { status: 429, headers: { 'retry-after': retryAfter } } });

test('429 then success -> retried once, still llm', async () => {
  const f = fake(rate('0.01'), draft());
  const r = await make(f.post).generatePlan(input);
  assert.equal(r.provider, 'llm'); assert.equal(f.calls.length, 2);
});
test('429 twice -> deterministic', async () => {
  const f = fake(rate('0.01'), rate('0.01'));
  const r = await make(f.post).generatePlan(input);
  assert.equal(r.provider, 'deterministic'); assert.equal(f.calls.length, 2);
});
test('429 with long retry-after -> deterministic without waiting', async () => {
  const f = fake(rate('30'), draft());
  const r = await make(f.post).generatePlan(input);
  assert.equal(r.provider, 'deterministic'); assert.equal(f.calls.length, 1);
});
test('identical request is served from cache with no second HTTP call', async () => {
  const f = fake(draft());
  const svc = make(f.post);
  await svc.generatePlan(input);
  const r2 = await svc.generatePlan(input);
  assert.equal(f.calls.length, 1); assert.equal(r2.cached, true);
});

// ---- Task 2: Groq json_validate_failed tests ----

test('salvage from failed_generation on 400', async () => {
  // Simulate Groq HTTP 400 with failed_generation containing valid JSON
  const err400 = Object.assign(new Error('400'), {
    isAxiosError: true,
    response: {
      status: 400,
      data: {
        error: {
          message: 'json_validate_failed',
          failed_generation: draft(),
        },
      },
    },
  });
  const f = fake(err400 as any);
  const r = await make(f.post).generatePlan(input);
  assert.equal(r.provider, 'llm');
  assert.equal(r.attempts, 1);
});

test('retry without JSON mode when failed_generation is empty on 400', async () => {
  const err400empty = Object.assign(new Error('400'), {
    isAxiosError: true,
    response: {
      status: 400,
      data: {
        error: {
          message: 'json_validate_failed',
          failed_generation: '',
        },
      },
    },
  });
  // First call throws 400 (empty text), retry without JSON mode returns valid draft
  const calls: any[] = [];
  const post: PostFn = async (_u, body) => {
    calls.push(JSON.parse(JSON.stringify(body)));
    if (calls.length === 1) throw err400empty;
    return { data: { choices: [{ message: { content: draft() } }] } };
  };
  const r = await make(post).generatePlan(input);
  assert.equal(r.provider, 'llm');
  // Second call should NOT have response_format
  assert.equal(calls[1].response_format, undefined);
});

test('JSON extracted from first { to last } in noisy output', async () => {
  // Model returns valid JSON buried in commentary
  const noisy = `Here is the plan:\n${draft()}\nEnd of plan.`;
  const f = fake(noisy);
  const r = await make(f.post).generatePlan(input);
  assert.equal(r.provider, 'llm');
});