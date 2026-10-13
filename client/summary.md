# Project Summary --- Adaptive AI Workspace

> **Purpose of this file:** Give a coding agent a reliable, concise
> handoff describing the project, its intended behavior, technical
> constraints, decisions already made, and the work that is known to be
> complete. Read this before changing the codebase.

## 1. Project at a glance

**Project name:** Adaptive AI Workspace\
 
**Problem statement:** *Intent-to-Interface: An Adaptive AI Workspace
That Reshapes Itself Around the User's Current Goal.*

The product is a web workspace that changes its layout and tools based
on what a user wants to accomplish. Instead of navigating a fixed
dashboard, the user describes a goal in natural language. The system
interprets the request, identifies relevant entities and constraints,
retrieves relevant data, builds a validated UI plan, and renders the
appropriate approved components. When the user changes or extends the
goal, the workspace adapts while preserving useful context.



1.  The user describes a goal in natural language.
2.  The system identifies the intent, entities, constraints, and
    relevant prior context.
3.  If an important detail is ambiguous, it asks a clarification
    question.
4.  It retrieves relevant records from the local demo data.
5.  It creates and validates a structured workspace plan.
6.  The frontend renders the plan using an approved component registry.
7.  The UI explains why its components and data are relevant.
8.  Follow-up requests refine, extend, or replace the current workspace,
    with a visible summary of the changes.

The experience should feel like an intelligent, adaptable
workspace---not a generic admin dashboard or a chatbot that only returns
text.

## 2. Main differentiator

The flagship differentiator is the **Hypothesis Arena** for
investigation-style tasks. For a question such as "Why did product usage
drop this week?", the system can present competing possible
explanations, check them against the available data, show evidence for
and against each explanation, and update the investigation as new
evidence is considered.

The system must distinguish **observed correlation from proven
causation**. It should communicate uncertainty, show evidence provenance
where possible, and never invent missing evidence. The workspace may
reorganize itself around unresolved questions.

This feature should be implemented to the degree feasible after the
end-to-end core flow is reliable; do not let it prevent the mandatory
scenarios from working.

## 3. Intended users and demo context

The prototype uses a fictional company called **NexusFlow** and one demo
user. It is intended to demonstrate how a knowledge worker can move
between client preparation, product analytics, project/task management,
and meeting scheduling without manually rebuilding dashboards.

The current requirements cover these workflows:

-   Prepare for a meeting with a client.
-   Investigate a product-usage drop.
-   Find overdue retaining context from an earlier
    workspace.
-   Extend or refine an existing workspace through natural-language
    follow-ups.

Do not assume the app is already connected to real company systems

## 4. Mandatory technology and architecture decisions

### Frontend

-   React with Vite.
-   The original master prompt specifies **TypeScript** for the
    frontend.
-   Tailwind CSS and shadcn/ui.
-   Lucide React icons.
-   Recharts for charts.
-   Framer Motion or Motion for transitions.
-   Zustand or React Context for workspace state.

### Backend

-   Node.js, Express, and TypeScript.
-   Zod for request and UI-plan validation.
-   Separate route, service, data/repository, schema, and AI layers.

### AI

-   Use an LLM API for intent interpretation, entity extraction,
    follow-up interpretation, UI planning, and explanations.
-   Prefer structured/schema-constrained JSON output where supported.
-   Keep the AI provider modular.
-   Keep API keys on the server; never expose secrets in frontend code.
-   The application must remain usable without an API key through a
    deterministic mock AI/planner and predefined routing.
-   AI must select only from approved components. It must **not**
    generate arbitrary JSX, HTML, or executable code for rendering.

### Data and persistence

-   **No external database in the current prototype.** Do not add
    MongoDB, PostgreSQL, Firebase, Supabase, or another database unless
    the project owner explicitly changes this requirement.
-   Store realistic, interconnected fictional data in local
    JSON/TypeScript files.
-   Use a reusable repository/service layer so a database can be
    introduced later without rewriting business logic.
-   Use localStorage only for appropriate non-sensitive
    preferences/session state.
-   No login or registration flow is required.

### Important stack note

A previous discussion mentioned preferring React over TypeScript. The
supplied master build prompt nevertheless explicitly requires React +
Vite + TypeScript. Treat the master prompt as the current source of
truth unless the project owner explicitly changes it. React is the UI
library; TypeScript is the language used with it.

## 5. UX and visual direction

The app should look like a polished, premium, colorful workspace---not a
generic white-and-blue SaaS template.

-   Deep charcoal or deep plum shell.
-   Warm off-white and muted lavender content surfaces.
-   Coral, electric violet, warm amber, teal, and mint accents.
-   Restrained gradients and clear visual hierarchy.
-   Compact/collapsible sidebar.
-   Top bar with workspace name, search, notifications, and avatar.
-   Natural-language command bar.
-   Responsive workspace canvas.
-   Workspace explanation panel.
-   Intent/workspace history switcher.
-   Smooth, purposeful transitions with reduced-motion support.
-   Responsive desktop, tablet, and mobile layouts.
-   Keyboard navigation, visible focus, sufficient contrast, and
    accessible controls.

The initial dashboard should be useful but general. It can show a
welcome message, current date, example prompts, business metrics, recent
activity, projects/tasks, and quick actions.

Suggested starter prompts:

-   "Prepare for tomorrow's meeting with Acme Corp."
-   "Investigate why product usage dropped this week."
-   "Show me overdue project work."
-   "Schedule a meeting tomorrow about the product launch."
-   "Review the product launch and prepare a meeting agenda."

## 6. Core behavior: intent and workspace adaptation

The system must recognize the difference between a new intent and a
follow-up to the current one.

-   **New intent:** Replace the primary workspace composition with one
    suited to the new goal.
-   **Related intent:** Reuse relevant entities and records from the
    existing context.
-   **Extension:** Add a requested area without discarding relevant
    current components.
-   **Refinement:** Update filters, date ranges, or other constraints
    without rebuilding everything unnecessarily.
-   **History restore:** Let users switch to and restore prior workspace
    states.
-   **Clarification:** Ask when an important ambiguity cannot be safely
    resolved.
-   **Context transparency:** Show which context was reused; do not
    silently assume important client, meeting, attendee, or date
    details.

### Mandatory multi-intent scenario

1.  User: "Show me the product usage dashboard."
2.  User: "Now schedule a meeting tomorrow about the product launch."

Expected behavior:

-   Recognize scheduling as the new primary intent.
-   Reuse the relevant product-launch context if the demo data supports
    it.
-   Interpret "tomorrow" relative to the current date.
-   Prioritize the meeting scheduler and de-emphasize analytics.
-   Provide date/time, attendees, duration, availability, launch
    context, and an editable agenda draft.
-   Allow the user to edit selections and confirm a mock meeting.
-   Record the created meeting in local application state.
-   **Do not claim an actual calendar invite was sent.**

Additional required follow-ups:

-   "Also show unresolved customer issues." --- extend the workspace.
-   "Only show high-priority issues." --- refine the relevant
    data/filter.
-   "Compare it with last month." --- update the applicable date
    range/comparison.
-   "Include previous notes." --- reuse relevant available context.
-   "Keep the chart and remove support." --- respect component
    preferences when compatible with the task.

## 7. Fictional demo data requirements

Use realistic, interconnected data with consistent IDs and meaningful
timestamps, statuses, ownership, priorities, and relationships.

  Dataset                               Target quantity
  ----------------------------------- -----------------
  Client accounts                                    12
  Communications (emails/messages)                   50
  Historical/upcoming meetings                       20
  Product usage history                         90 days
  Product features/adoption metrics         6+ features
  Product releases/change events                     15
  Support incidents/customer issues                  25
  Projects                                            8
  Tasks                                              60
  Employees/participants                             20
  Availability/schedule records                      15
  Recent activities                                  20
  Recommendations/follow-up items                    15

Specific data characteristics:

-   At least one feature should show a usage drop in the latest week.
-   Releases and support issues should include events around the
    affected period so the investigation can test possible
    relationships. These are clues, not proof of causation.
-   Include multiple overdue and blocked tasks.
-   Include clients with unresolved issues.
-   Include upcoming product-launch planning meetings.
-   Derive KPI values from source records wherever practical.
-   Make retrieval and calculations deterministic.
-   Handle missing and empty datasets gracefully.
-   Never fabricate records or metrics to fill gaps.

Keep datasets in separate files. The proposed organization includes
files such as `clients.json`, `communications.json`, `meetings.json`,
`usage-metrics.json`, `feature-adoption.json`, `releases.json`,
`support-incidents.json`, `projects.json`, `tasks.json`,
`employees.json`, `availability.json`, and `activities.json`.

## 8. Approved component library

Build reusable, styled components. The planner can choose and arrange
these components, but cannot invent component types at runtime.

### General

-   `MetricCard`
-   `TrendIndicator`
-   `ActivityTimeline`
-   `RecommendationCard`
-   `InsightPanel`
-   `FilterBar`
-   `SearchPanel`
-   `DataTable`
-   `EmptyState`
-   `LoadingState`
-   `ClarificationDialog`
-   `ActionButton`
-   `WorkspaceExplanationPanel`
-   `IntentHistorySwitcher`
-   `WorkspaceChangeSummary`

### Clients and communications

-   `ClientProfileCard`
-   `ClientHealthCard`
-   `CommunicationTimeline`
-   `OpenIssuesList`
-   `MeetingNotesPanel`
-   `MeetingAgendaPanel`

### Analytics and investigation

-   `UsageTrendChart`
-   `FeatureAdoptionChart`
-   `PeriodComparisonCard`
-   `ReleaseTimeline`
-   `SupportIncidentList`
-   `EvidenceBasedInsightList`
-   Hypothesis Arena / competing-hypothesis view, where feasible

### Projects and tasks

-   `ProjectProgressCard`
-   `OverdueTasksTable`
-   `PriorityDistributionChart`
-   `TeamWorkloadPanel`
-   `TaskDetailDrawer`
-   `DependencyIndicator`

### Scheduling

-   `MeetingScheduler`
-   `DatePicker`
-   `TimeSlotSelector`
-   `AttendeeSelector`
-   `AvailabilityPanel`
-   `AgendaEditor`
-   `MeetingConfirmationCard`

Use Recharts for applicable visualizations and keep component
appearance, spacing, empty states, and interactions consistent.

## 9. Structured UI planning and safe rendering

The AI or fallback planner should return a structured plan, validated
before rendering. The plan should contain fields such as:

-   `intent`, `intentLabel`
-   `title`, `subtitle`
-   `entities`
-   `layout`
-   `components`
-   `dataSources`
-   `filters`
-   `actions`
-   `explanations`
-   `clarificationRequired`, `clarificationQuestion`
-   `contextReused`
-   `changeSummary`

Each component specification should include a unique ID, approved
component type, title, data reference, ordering/layout position,
size/span, reason for inclusion, and optional filters/configuration.

Use Zod to validate the plan and request payloads. The renderer must
resolve component types only through the known registry. The
deterministic fallback planner must produce the same plan shape as the
AI planner.

## 10. Explainability and change summaries

Every workspace transition should explain, in user-friendly language:

-   What intent was detected.
-   Which entities and constraints were recognized.
-   Which context was reused.
-   Why each major component was included.
-   Which data sources support the displayed information.
-   What changed compared with the previous workspace.

The change summary must be computed from the actual old and new
plans---not invented by the model. Accurately report components that
were added, updated, retained, removed, or had filters/data changed. If
the plan did not change, do not claim that it did.

## 11. Functional interactions

Where applicable, users should be able to:

-   Open client details.
-   Filter and sort tasks.
-   Change date ranges.
-   Inspect a support incident.
-   Edit a meeting agenda.
-   Select attendees and available time slots.
-   Mark a task complete.
-   Create a mock meeting in local application state.
-   Copy a briefing.
-   Pin, hide, or reorder workspace components.
-   Restore previous workspace states.

These interactions should be real within the prototype, not decorative
buttons. Do not claim external actions (sending emails, calendar
invites, or modifying real systems) occurred.

## 12. API and code organization

Suggested endpoints (consolidate where sensible):

-   `POST /api/intent`
-   `POST /api/workspace/generate`
-   `POST /api/workspace/refine`
-   `GET /api/data/:source`
-   `POST /api/actions/:actionId`
-   `GET /api/health`

Suggested project layout:

``` text
adaptive-ai-workspace/
  client/
    src/
      components/
        common/
        workspace/
        charts/
        clients/
        analytics/
        projects/
        scheduling/
      features/
        intent/
        workspace/
        history/
      hooks/
      lib/
      store/
      types/
      App.tsx
      main.tsx
  server/
    src/
      routes/
      services/
        ai/
        intent/
        workspace/
        data/
        actions/
      schemas/
      prompts/
      utils/
      app.ts
      server.ts
    data/
      clients.json
      communications.json
      meetings.json
      usage-metrics.json
      feature-adoption.json
      releases.json
      support-incidents.json
      projects.json
      tasks.json
      employees.json
      availability.json
      activities.json
  README.md
  .env.example
```

This is a suggested organization, not proof that these files already
exist. Inspect the repository and follow its established conventions
where reasonable.

## 13. Required demo scenarios and acceptance checks

1.  **Initial dashboard:** Loads without an API key or database.
2.  **Client meeting preparation:** "Prepare for tomorrow's meeting with
    Acme Corp." shows relevant client profile, communications, notes,
    issues, agenda, and actions.
3.  **Usage investigation:** "Investigate why product usage dropped this
    week." shows usage KPIs/charts, feature comparison, release
    timeline, incidents, and evidence-based observations.
4.  **Project prioritization:** "Show me the overdue project work that
    needs attention first." shows metrics, sortable/filterable tasks,
    priorities, owners, project context, and actions.
5.  **Multi-intent scheduling:** Product usage dashboard followed by
    scheduling a launch meeting tomorrow preserves appropriate context,
    shows availability, permits editing, and creates only a mock
    meeting.
6.  **Extension:** "Also include unresolved support issues" adds
    relevant content.
7.  **Refinement:** "Only show high-priority overdue tasks" updates
    filters and counts.
8.  **Ambiguity:** If multiple matching clients or meetings exist, ask
    the user to choose.
9.  **Pinned component:** Retain a pinned chart when relevant, or
    explain the conflict and offer an appropriate alternative.
10. **AI failure:** Fall back to deterministic planning without losing
    data or crashing.

Also verify loading, error, empty-data, keyboard-accessibility,
responsive-layout, and reduced-motion behavior.

## 14. What is already done vs. what is not yet verified

**Known to be completed at the planning/specification level:**

-   The project idea and problem statement have been defined.
-   The core intent-to-interface interaction loop has been specified.
-   Target demo context and primary workflows have been identified.
-   The multi-intent scheduling scenario and follow-up behavior have
    been defined.
-   The frontend/backend/AI technology direction has been specified.
-   The decision to use local fictional data and no external database
    for this prototype has been made.
-   A reusable component inventory and structured UI-plan contract have
    been outlined.
-   Explainability, context preservation, change summaries, fallback
    behavior, and mock-action constraints have been specified.
-   P0 requirements, P1 differentiators, acceptance scenarios, and a
    suggested repository structure have been documented.

**Not established by the project prompt alone:**

-   Whether the frontend has actually been implemented.
-   Whether backend endpoints exist or work.
-   Whether the local data files have been created and interconnected.
-   Whether an LLM provider is integrated.
-   Whether the fallback planner works.
-   Whether the dynamic component registry and schema validation are
    implemented.
-   Whether the mandatory demo scenarios pass.
-   Whether build, lint, accessibility, and interaction tests pass.
-   Whether the Hypothesis Arena is implemented.

Do **not** report these implementation items as completed until the
actual repository has been inspected and the relevant code/tests have
been verified. The prompt and requirements are substantially specified,
but the amount of code already written is unknown from this document
alone.

## 15. Instructions for the coding agent taking over

Before making changes:

1.  Inspect the existing repository, package files, README, source tree,
    data files, environment examples, and test/build scripts.
2.  Run the existing app and tests if possible. Record the actual state
    and any errors.
3.  Map existing implementation against the requirements above.
    Distinguish **implemented**, **partially implemented**, **missing**,
    and **broken**.
4.  Preserve working code and conventions; do not recreate the project
    from scratch unnecessarily.
5.  Implement the highest-priority gaps in end-to-end order: initial
    dashboard → intent parsing → retrieval → validated plan → dynamic
    rendering → follow-up adaptation → functional mock actions →
    explanations/change summary → polish.
6.  Keep the app useful without an LLM key and avoid external database
    dependencies.
7.  Do not add unrequested scope or claim external integrations that do
    not exist.
8.  Run build/tests and exercise the acceptance scenarios. Fix
    regressions before finishing.
9.  Update this file with the verified implementation status, tests run,
    known limitations, and next steps.

### Suggested completion report format

At the end of a work session, report:

-   **Implemented:** verified features and relevant files.
-   **Partially implemented:** what works and what remains.
-   **Not implemented:** remaining requirements.
-   **Verification:** commands/tests run and actual outcomes.
-   **Known limitations:** including AI-provider setup and mock-only
    actions.
-   **Next priorities:** the smallest useful next steps.

------------------------------------------------------------------------

**Source-of-truth rule:** This file records the intended project and the
progress that can be established from the project brief. The live
repository is the source of truth for implementation status. If code and
this document disagree, inspect and test the code, then update this file
rather than assuming either one is correct.
