// import 'dotenv/config';
// import { aiPlanner } from '../services/ai/aiPlanner';
// import { UIPlan } from '../schemas/uiPlan';

// function show(label: string, r: Awaited<ReturnType<typeof aiPlanner.generatePlan>>) {
//   const p: UIPlan = r.plan;
//   console.log(`\n=== ${label} ===`);
//   console.log(`provider=${r.provider} attempts=${r.attempts}${r.fallbackReason ? ` fallbackReason="${r.fallbackReason}"` : ''}`);
//   console.log(`intent=${p.intent} confidence=${p.explanations.confidence} clarify=${p.clarificationRequired}`);
//   console.log(`title: ${p.title}`);
//   p.components.forEach(c => console.log(`  - ${c.id} | ${c.type} | span ${c.colSpan} | ${c.dataSource}${c.pinned ? ' | PINNED' : ''}`));
//   if (p.clarificationQuestion) console.log(`  question: ${p.clarificationQuestion.question} -> ${p.clarificationQuestion.options.map(o => o.id).join(', ')}`);
//   const s = p.changeSummary;
//   if (s) console.log(`  diff: +${s.added.length} ~${s.updated.length} =${s.retained.length} -${s.removed.length}`);
// }

// async function main() {
//   const a = await aiPlanner.generatePlan({ prompt: 'Investigate why product usage dropped this week' });
//   show('1. fresh request', a);

//   const b = await aiPlanner.generatePlan({ prompt: 'Also include unresolved support issues', previousPlan: a.plan });
//   show('2. extend previous workspace', b);

//   const c = await aiPlanner.generatePlan({ prompt: 'Prepare for the meeting with Acme' });
//   show('3. ambiguous request', c);

//   const d = await aiPlanner.generatePlan({
//     prompt: 'Prepare for the meeting with Acme',
//     clarificationResponse: { entityKey: 'client', selectedId: 'client-acme-corp' },
//   });
//   show('4. clarification answered', d);

//   const pinId = a.plan.components[0].id;
//   const e = await aiPlanner.generatePlan({
//     prompt: 'Show me the overdue project work that needs attention first',
//     previousPlan: a.plan,
//     pinnedComponentIds: [pinId],
//   });
//   show(`5. pinned "${pinId}" must survive`, e);
// }

// main().catch(err => { console.error('smoke test crashed:', err.message); process.exit(1); });







import 'dotenv/config';
import { aiPlanner } from '../services/ai/aiPlanner';
import { UIPlan } from '../schemas/uiPlan';

const pause = () => new Promise(r => setTimeout(r, 4000));

function show(label: string, r: Awaited<ReturnType<typeof aiPlanner.generatePlan>>) {
  const p: UIPlan = r.plan;
  console.log(`\n=== ${label} ===`);
  console.log(`provider=${r.provider} attempts=${r.attempts}${r.fallbackReason ? ` fallbackReason="${r.fallbackReason}"` : ''}`);
  console.log(`intent=${p.intent} confidence=${p.explanations.confidence} clarify=${p.clarificationRequired}`);
  console.log(`title: ${p.title}`);
  p.components.forEach(c => console.log(`  - ${c.id} | ${c.type} | span ${c.colSpan} | ${c.dataSource}${c.pinned ? ' | PINNED' : ''}`));
  if (p.clarificationQuestion) console.log(`  question: ${p.clarificationQuestion.question} -> ${p.clarificationQuestion.options.map(o => o.id).join(', ')}`);
  const s = p.changeSummary;
  if (s) console.log(`  diff: +${s.added.length} ~${s.updated.length} =${s.retained.length} -${s.removed.length}`);
}

async function main() {
  const a = await aiPlanner.generatePlan({ prompt: 'Investigate why product usage dropped this week' });
  show('1. fresh request', a);

  await pause();
  const b = await aiPlanner.generatePlan({ prompt: 'Also include unresolved support issues', previousPlan: a.plan });
  show('2. extend previous workspace', b);

  await pause();
  const c = await aiPlanner.generatePlan({ prompt: 'Prepare for the meeting with Acme' });
  show('3. ambiguous request', c);

  await pause();
  const d = await aiPlanner.generatePlan({
    prompt: 'Prepare for the meeting with Acme',
    clarificationResponse: { entityKey: 'client', selectedId: 'client-acme-corp' },
  });
  show('4. clarification answered', d);

  await pause();
  const pinId = a.plan.components[0].id;
  const e = await aiPlanner.generatePlan({
    prompt: 'Show me the overdue project work that needs attention first',
    previousPlan: a.plan,
    pinnedComponentIds: [pinId],
  });
  show(`5. pinned "${pinId}" must survive`, e);

  // Novel prompts: do they generalize beyond my prompt's example?
  for (const [i, prompt] of [
    'Which customers are most at risk of churning?',
    'Who is overloaded on the team and what is blocking them?',
    "I'm presenting to the board tomorrow, what should I know?",
  ].entries()) {
    await pause();
    show(`${6 + i}. novel: "${prompt}"`, await aiPlanner.generatePlan({ prompt }));
  }
}

main().catch(err => { console.error('smoke test crashed:', err.message); process.exit(1); });