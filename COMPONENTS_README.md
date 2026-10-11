# SaarthAI Component and Project Guide

This guide describes the project as it exists in this checkout and is intended
to make future changes easier to locate. It distinguishes active code from
older alternate files and calls out where a behavior usually needs to be
changed end to end.

## Project at a glance

SaarthAI is an adaptive workspace prototype. A signed-in user uploads a CSV or
JSON dataset, enters a goal, and receives a workspace plan containing approved
UI components. The planner can use the configured Groq-compatible LLM; its
response is validated, with a deterministic planner available as a fallback.
The dashboard components request records from authenticated API endpoints.

The three primary user workflows are:

1. Prepare for a client meeting.
2. Investigate a drop in product usage.
3. Review overdue project work.

The business data shown is user-uploaded prototype data stored in Supabase via
Prisma. It is not a live integration with a customer's CRM, analytics platform,
or project-management system. The LLM helps interpret the goal and compose a
plan; it is not the source of truth for the records or metrics.

## Runtime and request flow

```text
User goal
  -> client/src/components/common/CommandBar.tsx
  -> client/src/store/workspaceStore.ts
  -> authenticated POST /api/workspace/generate
  -> server/src/routes/workspace.ts
  -> server/src/services/ai/aiPlanner.ts
       -> Groq-compatible provider, then plan validation
       -> deterministic fallback when needed
  -> client receives a UIPlan
  -> client/src/components/registry.tsx selects approved React components
  -> client/src/App.tsx renders each one inside ComponentWrapper
  -> component requests its data from authenticated /api/data routes
  -> server reads the signed-in user's uploaded records via Prisma
```

Follow-up prompts use the workspace store and planner flow too. Upload
classification is a separate flow: the upload route stores the dataset and its
interpretation; planning receives dataset metadata, not complete record
contents.

## Project structure

| Location | Responsibility |
| --- | --- |
| [`client/src/main.tsx`](./client/src/main.tsx) | React application entry point. |
| [`client/src/App.tsx`](./client/src/App.tsx) | Auth/session gate, upload screen switching, and main workspace composition. |
| [`client/src/store/authStore.ts`](./client/src/store/authStore.ts) | Session check, sign-in, sign-up, upload, onboarding completion, and sign-out state/actions. |
| [`client/src/store/workspaceStore.ts`](./client/src/store/workspaceStore.ts) | Prompt submission, plan/history state, loading and errors, pin/hide, undo/redo actions, theme, and notifications. |
| [`client/src/types/workspace.ts`](./client/src/types/workspace.ts) | Frontend `UIPlan`, `ComponentSpec`, action, history, and component-type contracts. |
| [`client/src/components/registry.tsx`](./client/src/components/registry.tsx) | Allowlist mapping planner component types to React components. Also contains aliases and simple placeholder entries. |
| [`client/src/components/common/`](./client/src/components/common/) | Header, command bar, sidebar, component wrapper, clarification modal, and notifications. |
| [`client/src/components/general/`](./client/src/components/general/) | Reusable metrics, activity/recommendation views, explanation/change-summary panels, and uploaded-data table. |
| [`client/src/components/clients/`](./client/src/components/clients/) | Client profile, communications, issues, meeting agenda, and meeting notes. |
| [`client/src/components/analytics/`](./client/src/components/analytics/) | Usage, feature adoption, release, incident, and evidence/insight views. |
| [`client/src/components/projects/`](./client/src/components/projects/) | Project progress, overdue tasks, priority, workload, and dependency views. |
| [`client/src/components/scheduling/`](./client/src/components/scheduling/) | Meeting scheduling, availability, attendee, and agenda-editor views. |
| [`client/src/components/auth/`](./client/src/components/auth/) | Sign-in/sign-up and CSV/JSON onboarding screens. |
| [`server/src/server.ts`](./server/src/server.ts), [`server/src/app.ts`](./server/src/app.ts) | Server startup and Express middleware/routes. |
| [`server/src/routes/`](./server/src/routes/) | HTTP endpoints for auth, workspace planning, data, user data, actions, health, and intent. |
| [`server/src/services/ai/`](./server/src/services/ai/) | Provider-backed planner, prompt, output validation, deterministic fallback, and tests. |
| [`server/src/services/data/`](./server/src/services/data/) | Dataset classification/import and account-scoped data repository logic. |
| [`server/src/services/auth/`](./server/src/services/auth/) | Password/session handling and authentication tests. |
| [`server/src/services/database/prisma.ts`](./server/src/services/database/prisma.ts) | Prisma client/database connection setup. |
| [`server/prisma/schema.prisma`](./server/prisma/schema.prisma), [`server/prisma/seed.ts`](./server/prisma/seed.ts) | Database schema and seed tooling. |
| [`summary.md`](./summary.md), [`final_report.md`](./final_report.md) | Project history/context and current implementation/validation report. |

### Active files and legacy alternates

The application imports [`client/src/App.tsx`](./client/src/App.tsx) and the
unsuffixed component files. `App2.tsx`, `Header2.tsx`, `AuthScreen2.tsx`, and
`DataOnboardingScreen2.tsx` are alternate/older files, not the active imports
for the main application. Check import references before editing or removing
any alternate file.

## UI component catalogue

The planner's supported component type is declared in both the frontend
workspace type and the backend plan schema. The registry maps those types to
the components below. Some registry types are aliases for an existing
component; a few are intentionally minimal placeholders or render nothing.
Therefore, a type appearing in the contract does not guarantee a distinct,
fully implemented UI.

### Common layout — `client/src/components/common/`

| Component | File | Role |
| --- | --- | --- |
| `Header` | [`Header.tsx`](./client/src/components/common/Header.tsx) | Main navigation, Settings menu/data-upload entry, theme control, account/sign-out actions, and workspace notifications/provider status. |
| `Sidebar` | [`Sidebar.tsx`](./client/src/components/common/Sidebar.tsx) | Workspace navigation, visible component sections, and in-memory previous-result restoration. |
| `CommandBar` | [`CommandBar.tsx`](./client/src/components/common/CommandBar.tsx) | Goal input and starter prompts for the required workflows. |
| `ComponentWrapper` | [`ComponentWrapper.tsx`](./client/src/components/common/ComponentWrapper.tsx) | Component title, rationale/evidence display, responsive layout span, pin, and hide actions. It is a presentation/lifecycle wrapper, not an authorization boundary. |
| `ClarificationModal` | [`ClarificationModal.tsx`](./client/src/components/common/ClarificationModal.tsx) | Displays planner clarification choices when a plan requires user disambiguation. |
| `NotificationToast` | [`NotificationToast.tsx`](./client/src/components/common/NotificationToast.tsx) | Displays transient workspace/action feedback. |

### General — `client/src/components/general/`

| Component | File | Role |
| --- | --- | --- |
| `MetricCard` | [`MetricCard.tsx`](./client/src/components/general/MetricCard.tsx) | Displays a metric and its configured label/context. |
| `ActivityTimeline` | [`ActivityTimeline.tsx`](./client/src/components/general/ActivityTimeline.tsx) | Shows activity records returned for the selected data source. |
| `RecommendationCard` | [`RecommendationCard.tsx`](./client/src/components/general/RecommendationCard.tsx) | Shows recommendation records and any supported action affordance. |
| `WorkspaceExplanationPanel` | [`WorkspaceExplanationPanel.tsx`](./client/src/components/general/WorkspaceExplanationPanel.tsx) | Displays plan-level rationale and workspace context. |
| `WorkspaceChangeSummary` | [`WorkspaceChangeSummary.tsx`](./client/src/components/general/WorkspaceChangeSummary.tsx) | Displays the planner's summary of changes between workspace plans. |
| `UserDatasetTable` | [`UserDatasetTable.tsx`](./client/src/components/general/UserDatasetTable.tsx) | Displays raw uploaded dataset records when a dataset is not mapped to a supported business category. |

### Client and communication — `client/src/components/clients/`

| Component | File | Role |
| --- | --- | --- |
| `ClientProfileCard` | [`ClientProfileCard.tsx`](./client/src/components/clients/ClientProfileCard.tsx) | Shows client/account profile and health-related fields from uploaded client records. |
| `CommunicationTimeline` | [`CommunicationTimeline.tsx`](./client/src/components/clients/CommunicationTimeline.tsx) | Shows communication records associated with the selected client/workspace. |
| `OpenIssuesList` | [`OpenIssuesList.tsx`](./client/src/components/clients/OpenIssuesList.tsx) | Shows support-incident records and their available status/priority fields. |
| `MeetingAgendaPanel` | [`MeetingAgendaPanel.tsx`](./client/src/components/clients/MeetingAgendaPanel.tsx) | Shows agenda information from meeting records. |
| `MeetingNotesPanel` | [`MeetingNotesPanel.tsx`](./client/src/components/clients/MeetingNotesPanel.tsx) | Displays meeting notes. Check its implementation before assuming notes are generated from uploaded records or persisted as edits. |

### Product analytics — `client/src/components/analytics/`

| Component | File | Role |
| --- | --- | --- |
| `UsageTrendChart` | [`UsageTrendChart.tsx`](./client/src/components/analytics/UsageTrendChart.tsx) | Visualizes usage-metric records for a product-usage investigation. |
| `FeatureAdoptionChart` | [`FeatureAdoptionChart.tsx`](./client/src/components/analytics/FeatureAdoptionChart.tsx) | Visualizes feature-adoption records. |
| `ReleaseTimeline` | [`ReleaseTimeline.tsx`](./client/src/components/analytics/ReleaseTimeline.tsx) | Shows release records for comparison with usage changes. |
| `SupportIncidentList` | [`SupportIncidentList.tsx`](./client/src/components/analytics/SupportIncidentList.tsx) | Shows incidents relevant to a usage investigation. |
| `EvidenceBasedInsightList` | [`EvidenceBasedInsightList.tsx`](./client/src/components/analytics/EvidenceBasedInsightList.tsx) | Renders insight content. Review its source to distinguish record-backed values from static/demo content before relying on it. |

### Projects and tasks — `client/src/components/projects/`

| Component | File | Role |
| --- | --- | --- |
| `ProjectProgressCard` | [`ProjectProgressCard.tsx`](./client/src/components/projects/ProjectProgressCard.tsx) | Shows project progress fields from uploaded project records. |
| `OverdueTasksTable` | [`OverdueTasksTable.tsx`](./client/src/components/projects/OverdueTasksTable.tsx) | Shows task records; the data route can filter overdue tasks. |
| `PriorityDistributionChart` | [`PriorityDistributionChart.tsx`](./client/src/components/projects/PriorityDistributionChart.tsx) | Summarizes task priority distribution. |
| `TeamWorkloadPanel` | [`TeamWorkloadPanel.tsx`](./client/src/components/projects/TeamWorkloadPanel.tsx) | Displays workload information from available task/employee data. |
| `DependencyIndicator` | [`DependencyIndicator.tsx`](./client/src/components/projects/DependencyIndicator.tsx) | Displays task dependency/blocker information when present in the uploaded records. |

### Scheduling — `client/src/components/scheduling/`

| Component | File | Role |
| --- | --- | --- |
| `MeetingScheduler` | [`MeetingScheduler.tsx`](./client/src/components/scheduling/MeetingScheduler.tsx) | Meeting scheduling UI. Verify the corresponding action route before treating a UI action as a real calendar integration. |
| `AvailabilityPanel` | [`AvailabilityPanel.tsx`](./client/src/components/scheduling/AvailabilityPanel.tsx) | Displays availability records when supplied by the account dataset. |
| `AttendeeSelector` | [`AttendeeSelector.tsx`](./client/src/components/scheduling/AttendeeSelector.tsx) | Displays/selects attendees from the supported data and component flow. |
| `AgendaEditor` | [`AgendaEditor.tsx`](./client/src/components/scheduling/AgendaEditor.tsx) | Agenda editing UI. Verify persistence behavior before assuming edits are saved. |

### Authentication — `client/src/components/auth/`

| Component | File | Role |
| --- | --- | --- |
| `AuthScreen` | [`AuthScreen.tsx`](./client/src/components/auth/AuthScreen.tsx) | Sign-in/sign-up UI and unavailable-server feedback. |
| `DataOnboardingScreen` | [`DataOnboardingScreen.tsx`](./client/src/components/auth/DataOnboardingScreen.tsx) | CSV/JSON upload and onboarding completion/skip flow. |

## Planner component contract and registry

To add a new planner-selectable component, update the matching contract at
each layer:

1. Add the type to [`client/src/types/workspace.ts`](./client/src/types/workspace.ts).
2. Add the same type to `ComponentTypeSchema` in
   [`server/src/schemas/uiPlan.ts`](./server/src/schemas/uiPlan.ts).
3. Implement/import the React component and register it in
   [`client/src/components/registry.tsx`](./client/src/components/registry.tsx).
4. If the deterministic planner should select it, add it to the relevant
   workflow in [`server/src/services/ai/fallbackPlanner.ts`](./server/src/services/ai/fallbackPlanner.ts).
5. If the LLM needs guidance to use it, update
   [`server/src/services/ai/plannerPrompt.ts`](./server/src/services/ai/plannerPrompt.ts)
   and, where applicable, [`server/src/services/ai/componentContract.ts`](./server/src/services/ai/componentContract.ts).
6. Ensure the component's `dataSource` has a supported route and account-scoped
   implementation under [`server/src/routes/data.ts`](./server/src/routes/data.ts).
   Update dataset schema mapping only when the component requires a new data
   category.
7. Add/update focused tests for the contract, fallback selection, data mapping,
   and component behavior as appropriate.

The registry is a rendering allowlist: planner output selects among known
component types. Do not render model-generated HTML, scripts, or arbitrary
code. Keep frontend and backend component type contracts in sync.

## Where to make common changes

| Requested change | Start here | Also check |
| --- | --- | --- |
| Change starter workflow wording/buttons | [`CommandBar.tsx`](./client/src/components/common/CommandBar.tsx) | [`fallbackPlanner.ts`](./server/src/services/ai/fallbackPlanner.ts), [`plannerPrompt.ts`](./server/src/services/ai/plannerPrompt.ts) |
| Change how goals become a plan | [`aiPlanner.ts`](./server/src/services/ai/aiPlanner.ts) | [`plannerPrompt.ts`](./server/src/services/ai/plannerPrompt.ts), [`planValidator.ts`](./server/src/services/ai/planValidator.ts), [`fallbackPlanner.ts`](./server/src/services/ai/fallbackPlanner.ts) |
| Change component selection/output constraints | [`componentContract.ts`](./server/src/services/ai/componentContract.ts) | [`uiPlan.ts`](./server/src/schemas/uiPlan.ts), [`client/src/types/workspace.ts`](./client/src/types/workspace.ts), [`registry.tsx`](./client/src/components/registry.tsx) |
| Change dashboard appearance or a chart/card | The corresponding file in [`client/src/components/`](./client/src/components/) | `registry.tsx`, API response shape, related styles |
| Change data shown by a dashboard component | Relevant component and [`server/src/routes/data.ts`](./server/src/routes/data.ts) | [`datasetSchemaMapping.ts`](./server/src/services/data/datasetSchemaMapping.ts), Prisma schema/repository as needed |
| Change CSV/JSON validation or interpretation | [`userDatasetImport.ts`](./server/src/services/data/userDatasetImport.ts) | [`datasetSchemaMapping.ts`](./server/src/services/data/datasetSchemaMapping.ts), [`userData.ts`](./server/src/routes/userData.ts), upload UI |
| Change upload menu/navigation | [`Header.tsx`](./client/src/components/common/Header.tsx) | [`App.tsx`](./client/src/App.tsx), [`DataOnboardingScreen.tsx`](./client/src/components/auth/DataOnboardingScreen.tsx), `authStore.ts` |
| Change login/session behavior | [`auth.ts`](./server/src/routes/auth.ts) | [`server/src/services/auth/`](./server/src/services/auth/), [`authStore.ts`](./client/src/store/authStore.ts), auth UI |
| Change workspace history/loading/pin/hide | [`workspaceStore.ts`](./client/src/store/workspaceStore.ts) | `App.tsx`, `Sidebar.tsx`, `ComponentWrapper.tsx` |
| Change API routes or authentication boundaries | [`app.ts`](./server/src/app.ts) | The selected route and auth middleware in `server/src/services/auth/` |
| Change database models or seed data | [`schema.prisma`](./server/prisma/schema.prisma) | [`seed.ts`](./server/prisma/seed.ts), repository and route tests |

## Data and behavior boundaries

- All application API routes under `/api` require authentication, except the
  auth endpoints and health route mounted before the auth middleware.
- Uploaded datasets are stored per signed-in user. Data routes select records
  belonging to that user and map recognized categories to the existing
  dashboard data sources.
- Accounts without uploaded datasets receive an empty-data plan; the planner
  route does not substitute shared demo records.
- Dataset interpretation can use bounded sample rows to classify data when an
  AI provider is configured. The normal workspace-planning request receives
  dataset metadata, not all uploaded row contents.
- Planner rationale is generated explanatory text, not independent proof that
  a business conclusion is true. Validate recommendations against the data.
- Some component or action content may be static, demonstrative, or mock.
  Confirm source data and whether an action persists before presenting it as a
  live integration.
- The previous-results history described by the UI is held in frontend memory;
  it is not a persistent audit/history store.

## Running and validating changes

The frontend and backend can be run separately from their respective folders:

```powershell
# Terminal 1
Set-Location "D:\team LL\client"
npm run dev

# Terminal 2
Set-Location "D:\team LL\server"
npm run dev
```

The frontend is served by Vite (typically `http://localhost:5173`) and the
backend API by Express (typically `http://localhost:4000`); local environment
configuration may affect these ports. The repository root also defines a
workspace `npm run dev` command that starts both.

After a UI change, run the client build from `client`; after a backend change,
run the server build from `server`. For planner, auth, dataset mapping, or
import behavior, run the related existing tests as well. Database-dependent
checks require the server environment and database to be configured. See
[`README.md`](./README.md) and [`final_report.md`](./final_report.md) for
setup details and the latest recorded validation.
