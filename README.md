# Intent-to-Interface — Adaptive AI Workspace

An adaptive, goal-driven business workspace that dynamically reshapes its layout, components, data connections, and action surfaces around the user's current intent in natural language.

Built for **NexusFlow**, an enterprise intelligence platform.

---

## 🌟 Key Architecture & Capabilities

### 1. Intent Classification & Multi-Intent Continuity
- **Natural Language Command Bar**: Users enter high-level goals or follow-ups.
- **Contextual Continuity**: Distinguishes between completely new goals, related follow-ups (e.g. pivoting from product usage investigation to scheduling a launch meeting), extensions (*"Also include unresolved support issues"*), and refinements (*"Only show high-priority overdue tasks"*).
- **Entity & Context Preservation**: Retains relevant entities, project milestones, dates, and active attendees without wiping unrelated context.

### 2. Explainable Adaptation & Workspace Diffing
- **Real-Time Change Summarizer**: After every goal transition, computes the exact set of **Added**, **Updated**, **Retained**, and **De-prioritized** components with a concise reason.
- **Why this workspace? Panel**: An expandable inspection tray showing the detected intent, extracted entities, connected data sources, and component selection rationale.
- **Component-Level Insights**: Every card provides a rationale badge explaining why it was selected, supported by verifiable data evidence.

### 3. Dynamic Component Registry
- Over 30 approved, accessible UI primitives categorized into:
  - **General**: `MetricCard`, `ActivityTimeline`, `RecommendationCard`, `WorkspaceExplanationPanel`, `WorkspaceChangeSummary`.
  - **Client & Comm**: `ClientProfileCard`, `MeetingAgendaPanel`, `MeetingNotesPanel`, `OpenIssuesList`, `CommunicationTimeline`.
  - **Analytics**: `UsageTrendChart` (90-day Recharts AreaChart with drop correlation), `FeatureAdoptionChart`, `ReleaseTimeline`, `SupportIncidentList`, `EvidenceBasedInsightList`.
  - **Projects & Tasks**: `OverdueTasksTable` (sortable, filterable with 1-click completion), `PriorityDistributionChart`, `ProjectProgressCard`, `TeamWorkloadPanel`, `DependencyIndicator`.
  - **Scheduling**: `MeetingScheduler`, `AvailabilityPanel` (multi-participant schedule matrix), `AttendeeSelector`, `AgendaEditor`, `MeetingConfirmationCard`.
- **Security Guarantee**: Renders strictly approved components via registry. Never executes model-generated JS or arbitrary HTML.

### 4. Interactive Ambiguity Disambiguation
- When an entity is ambiguous (e.g., *"Prepare for the meeting with Acme"* matches both **Acme Corp** and **Acme Labs Inc**), the system triggers an interactive Disambiguation Modal with rich details so the user can select the intended client before assembling the workspace.

### 5. Deterministic Fallback & Pluggable AI Engine
- Includes an LLM planner service (`services/ai/aiPlanner.ts`) with schema validation via **Zod**.
- Automatically and gracefully falls back to a deterministic planner (`services/ai/fallbackPlanner.ts`) whenever `AI_API_KEY` is missing or the remote service encounters network failures. The application is completely functional out of the box with zero external dependencies.

### 6. Realistic Interconnected Datasets
Stored in `server/data/`:
- **12 Client Accounts** (including Acme Corp, Acme Labs Inc, Strata Cloud, Apex Financial)
- **50 Communication Records** (inbound/outbound emails, Slack syncs, sentiment tags)
- **20 Meetings** (historical and upcoming QBRs with time blocks and agendas)
- **90 Days of Telemetry Data** (revealing a steep 30% drop coincident with Release v2.8.4)
- **6 Feature Adoption Metrics** (isolating a 52% collapse in Query Builder)
- **15 Product Releases** (including Release v2.8.4 deployed by Elena Rostova)
- **25 Support Incidents** (P0 timeouts, memory exhaustion, SSO sync delays)
- **8 Strategic Projects** (NexusFlow 3.0 Platform Launch, Acme Distribution Onboarding)
- **60 Project Tasks** (overdue, critical blockers, dependencies)
- **20 Employees** (roles, departments, avatars, contact emails)
- **15 Availability Records** (calendar matrices across attendees)
- **20 Business Activity Logs** & **15 Actionable Recommendations**

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 1. Install & Run
Both client and server can be launched simultaneously from the project root:

```bash
cd adaptive-ai-workspace

# Install server dependencies
cd server
npm install
npm run dev # Starts API at http://localhost:4000

# In a separate terminal, install client dependencies
cd ../client
npm install
npm run dev # Starts Vite UI at http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

### Personal data uploads

After signing up (or signing in to an account that has not completed setup), upload a CSV with a header row or a JSON array of objects, or skip to the prompt workspace. Uploads are stored as private JSONB datasets associated with the signed-in user; they do not replace the shared demo datasets.

On upload, the server groups rows by `source_file` when present and asks the configured AI provider to map each group to an existing business schema (such as `Client`, `Meeting`, or `UsageMetric`). The classifier receives at most two sample rows per group, with up to 30 non-empty fields per row and string values truncated to 120 characters. If no AI key is configured or classification fails, deterministic file-name and field-name mapping is used; unrecognized data remains available in the raw dataset table.

When a schema is recognized, prompts such as product-usage investigation, client meeting preparation, and task review use the matching existing dashboard components. Their `/api/data/*` requests return only records from the signed-in user's uploads mapped to that schema; they do not read or mix in the shared demo rows. Accounts with no uploads receive an empty-data workspace and zero-valued overview metrics rather than demo content. Workspace planning receives dataset names, columns, counts, and recognized categories, but not record contents. All upload and data APIs remain authenticated and account-scoped.

Use `server/data/all-demo-data-upload.json` to upload one combined JSON array containing all 356 records from the 13 business-data JSON files in `server/data/`. Each record includes `source_file` so you can tell which file it came from. Signed-in users can reopen the upload screen with the **Upload data** button in the app header.

Sample row values may contain personal or confidential information. If configured, those bounded samples are transmitted to the AI provider (for example, Groq) solely to classify each group. The complete dataset is stored in the user's private JSONB dataset and is not sent to the AI planner when generating the dashboard.

### Google Calendar meeting scheduling

The meeting scheduler creates events in one server-configured Google Calendar and sends invitations only to addresses in `MEETING_ALLOWED_ATTENDEES`. The list must contain one to three valid addresses. If an allowlisted address is not in the signed-in user's employee dataset, the scheduler still presents it as a configured invitee; employee records matching allowlisted addresses are also displayed. The server validates every selected address against its own allowlist. The event includes the configured email and popup reminder for the demo calendar. Invitees receive the Google Calendar invitation and their own calendar reminder behavior depends on their Google account settings.

To enable this integration:

1. Enable the Google Calendar API in a Google Cloud project and configure an OAuth consent screen. For development, use External / Testing when invitees are outside your Workspace and add the demo calendar account as a test user.
2. Create an OAuth client of type **Web application**. For the one-time OAuth Playground flow, add `https://developers.google.com/oauthplayground` to **Authorized redirect URIs**. No JavaScript origin is needed for the server-only integration.
3. In OAuth Playground settings, enable **Use your own OAuth credentials**, enter the OAuth client ID and secret, and authorize the demo account with `https://www.googleapis.com/auth/calendar.events`. Exchange the authorization code for a refresh token.
4. Add the variables listed in `server/.env.example` to the existing `server/.env` (preserve its database and AI settings) and set the client ID, client secret, refresh token, calendar ID (usually `primary`), timezone, reminder minutes, and the one-to-three invitee email addresses. Keep these values private; do not put them in client-side `VITE_` variables or commit `server/.env`.
5. Ensure the signed-in account has uploaded employee records with matching email addresses, select attendees in the meeting scheduler, and create a test event.

Events are created on the configured demo account's calendar, not on the account of the person using the website. Google sends invitations to allowlisted attendees. An invitee's event visibility and reminder delivery may depend on their calendar settings and whether they accept invitations. OAuth apps left in Testing can have refresh tokens expire after seven days; reauthorize the demo account if calendar access stops working.

Before using the upload feature against Supabase, apply the Prisma schema:

```bash
npm run db:generate --workspace=server
npm run db:push --workspace=server
```

Authenticated dataset endpoints are `GET /api/user-data` (list the signed-in user's datasets), `GET /api/user-data/:datasetId` (retrieve one dataset), and `POST /api/user-data` (save a CSV or JSON dataset). `POST /api/user-data/complete` records that the user skipped setup. Dataset IDs are always scoped to the current user.

---

## 🎯 Verification of All 10 Acceptance Tests

| Test | User Request | Expected System Response | Status |
|---|---|---|---|
| **Test 1: Initial State** | Load Application | Generic overview with portfolio MRR ($485k), average health score, 90-day DAU, overdue deliverable count, proactive AI recommendations, project progress, and live operational activity feed. | ✅ Verified |
| **Test 2: Client Meeting** | *"Prepare for tomorrow's meeting with Acme Corp."* | Client dossier for Acme Corp ($48.5k MRR, Sarah Jenkins contact), scheduled agenda for 10:00 AM QBR, Sept 24 previous meeting notes, active support issues (INC-1042 query timeout & INC-1055 SSO delay), and recent communication timeline. | ✅ Verified |
| **Test 3: Product Usage** | *"Investigate why product usage dropped this week."* | 90-day interactive area chart showing stable baseline followed by sharp 32% drop on Oct 4; feature adoption chart isolating the 52% collapse of Advanced Query Builder; Release v2.8.4 timeline card; related P0 customer support tickets; and synthesized evidence-based root-cause hypotheses. | ✅ Verified |
| **Test 4: Overdue Tasks** | *"Show me the overdue project work that needs attention first."* | Overdue task metrics; priority distribution pie chart; interactive sortable & filterable overdue tasks table with inline **Mark Done** button; team workload distribution; and dependency indicator tracing blocked deliverables. | ✅ Verified |
| **Test 5: Multi-Intent Continuity** | *"Now schedule a meeting tomorrow about the product launch."* (after Test 3) | Primary goal switches to meeting scheduling while retaining NexusFlow 3.0 launch context. Assembles MeetingScheduler (tomorrow Oct 11), AttendeeSelector, AvailabilityPanel (recommending 2:00 PM slot), AgendaEditor, and retained project progress. Confirming meeting executes mock meeting creation and displays confirmation card. | ✅ Verified |
| **Test 6: Intent Extension** | *"Also include unresolved support issues."* | Preserves the existing workspace cards and smoothly appends the `OpenIssuesList` component without re-initializing or wiping other data. | ✅ Verified |
| **Test 7: Intent Refinement** | *"Only show high-priority overdue tasks."* | Refines active task view to display exclusively Critical and High priority tasks, updating the table and counts. | ✅ Verified |
| **Test 8: Ambiguity Check** | *"Prepare for the meeting with Acme."* | Detects ambiguity between **Acme Corp** (tomorrow 10:00 AM QBR) and **Acme Labs Inc** (Oct 12 clinical sync). Triggers the interactive Disambiguation Modal for user selection. | ✅ Verified |
| **Test 9: Component Pinning** | Pin any card (e.g., Usage Trend Chart) & change goals | Pinned component persists into the next workspace composition with a `[Pinned]` badge and clear rationale. | ✅ Verified |
| **Test 10: Failure Recovery** | Run with no API key or simulated LLM error | Gracefully falls back to the deterministic planner, preserving all schema contracts, datasets, and interactivity. | ✅ Verified |

---

## 🎨 Visual Design System

- **Palette**: Sophisticated dark charcoal foundation (`#0c0a14`, `#13111e`, `#1b182a`), complemented by **electric violet** (`#8b5cf6`) for AI surfaces, **vibrant coral** (`#ff6363`) for alerts/regressions, **warm amber** (`#f59e0b`) for urgency, and **teal/mint** (`#14b8a6`, `#10b981`) for health and confirmations.
- **Typography**: Clean, readable sans-serif typography with generous contrast and accessible focus states.
- **Layout Transitions**: Powered by Framer Motion for smooth, restrained layout reorganizations without jarring visual jumps.
