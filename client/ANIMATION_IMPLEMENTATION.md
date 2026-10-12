# Adaptive Workspace Animation Implementation

## Audit findings and root cause

This is an existing React + TypeScript + Vite application. Framer Motion was already installed; the workspace state and intent flow are managed by the existing Zustand stores and API routes. `App.tsx` renders the planner's `currentPlan.components` using each `spec.id` as the React key, inside a Framer Motion layout group. `ComponentWrapper` owns the per-card controls and rationale panel.

The main identity defect was in `server/src/services/ai/planValidator.ts`: when the model did not supply a valid `retainId`, `freshId()` generated a counter ID and deliberately skipped IDs from the previous plan. An otherwise unchanged component therefore received a different key on the next intent. React interpreted it as a new component, remounting it instead of preserving it for layout animation.

Two frontend details also weakened the motion: cards were gated by `whileInView` (so entry depended on viewport intersection), and `layoutDependency={currentPlan.id}` limited layout measurement to plan-ID changes instead of allowing Framer Motion to observe other layout updates. The app already had an existing request-ID guard in the workspace store to ignore stale responses; that protection was preserved.

## Changes

- `server/src/services/ai/planValidator.ts`: generated AI-plan IDs are now deterministic from component type and data source. Explicit, validated `retainId` values and pin behavior remain supported.
- `server/src/services/ai/planValidator.test.ts`: added a regression test that plans the same component/data-source pair in a different order and verifies stable IDs and updated positions.
- `client/src/App.tsx`: removed viewport-gated card visibility and the plan-only layout measurement gate; kept cards keyed by `spec.id`; added staggered enter/exit variants, `AnimatePresence` with `popLayout`, per-card position/size layout animation, and a position-only grid-container layout to prevent large overall height changes from scaling the entire grid. Reduced-motion preference is provided through `MotionConfig`.
- `client/src/animations/workspaceMotion.ts`: added grid staggering, gentle card entry/exit, content reveal, and a reduced-motion card variant, reusing the installed library.
- `client/src/components/common/ComponentWrapper.tsx`: added subtle card hover/press feedback, a height/opacity-animated rationale drawer, and a content reveal variant; interactions honor reduced motion.
- `client/src/components/common/CommandBar.tsx`: added small hover/press affordances to the submit and suggested-goal buttons while leaving prompt submission/loading logic unchanged.
- `client/src/vite-env.d.ts`: added the Vite client type reference required for CSS imports during TypeScript builds.

No new package was added. The existing user-intent planner, data routes, design system, and request-race guard were not replaced.

## Verification

- `npm run build` — **passed** for client and server. Vite reports the existing large-bundle advisory (>500 kB); it does not fail the build.
- All compiled backend suites (`find server/dist -name '*.test.js' -type f -print0 | xargs -0 node --test`) — **65 passed, 0 failed**.
- Live browser check — started the existing app against a throwaway loopback PostgreSQL database, created a disposable local account, uploaded the included fictional demo dataset, and submitted two different goals through the existing command UI and planner in deterministic-fallback mode. The UI rendered the real resulting task and product-usage workspaces. Browser-side frame sampling showed card opacity/transform and position/size changing during the plan transition; the rationale panel also expanded over successive frames. The configured remote database and external LLM were not used.
- No lint script is declared in the project package manifests.
- Reduced-motion support is implemented in code; a separate OS-level reduced-motion profile was not used in the browser check.

## Run and verify locally

1. Extract the project and install the lockfile dependencies from its root:
   ```bash
   npm ci
   ```
2. Configure `server/.env` using `server/.env.example` for your own environment. Do not copy credentials from another machine or the review environment.
3. Ensure PostgreSQL is running, then generate the Prisma client, apply the schema, and load the project's demo data:
   ```bash
   npm run db:setup --workspace=server
   ```
4. Start the existing frontend and backend from the project root:
   ```bash
   npm run dev
   ```
5. Sign in, upload the included `server/data/all-demo-data-upload.json` if the account has no data, then try different intents such as “Investigate why product usage dropped this week” and “Review overdue project work.” Existing cards with the same component type/data source should retain their IDs; inserted, removed, reordered, and resized cards should transition with the new layout.
6. Rebuild and run the test suites:
   ```bash
   npm run build
   find server/dist -name '*.test.js' -type f -print0 | xargs -0 node --test
   ```
