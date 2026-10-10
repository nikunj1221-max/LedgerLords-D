# Adaptive AI Workspace

An intelligent, goal-driven workspace engine for HACKWAVE 3.0 (Problem Statement 4) that adapts to user goals in natural language. Built with React (JavaScript/JSX), Tailwind CSS, Node.js, Express, and Zod runtime validation.

---

## Three Signature Innovations

### 1. Workspace Time Machine
A deterministic, dependency-aware what-if simulation engine:
- Topological sort & cycle detection in task graphs (`server/simulation/engine.js`).
- Computes forward scheduling passes and delay propagation through downstream dependencies.
- Simulates launch delays (1–4 weeks), scope reduction (deferring non-critical modules), task reassignment, and contractor acceleration.
- Displays baseline vs. scenario comparisons, milestone shifts, cost impacts, affected tasks, explicit assumptions, and limitations.
- Baseline remains safe until explicitly applied by the user.

### 2. Intent Morphing
Transforms workspace structure and widgets according to user intent:
- **Explore**: Understand situation, high-level KPIs, trends, risks, and missing information.
- **Decide**: Compare trade-offs, decision option matrices, constraints, and scenario impacts.
- **Execute**: Prioritize action items, deadlines, owners, milestones, and goal progress tracking.
- Switches via UI segmented buttons or natural language commands (e.g., *"Turn this into an action plan"*).

### 3. Self-Proving Insights
Replaces vague AI text with transparent, verifiable evidence:
- Classifies statements into: **Observed Fact**, **Calculated Result**, **Hypothesis**, **Recommendation**, and **Unknown**.
- Interactive Evidence Drawer reveals source datasets, extracted record values, exact formulas, step-by-step math, assumptions, and validation requirements.

---

## Additional Innovations

- **Intent-to-Action Engine**: Converts strategic objectives into actionable 8-step execution workflows with progress tracking.
- **Workspace Time Travel**: Version history audit log tracking all adaptations, layout changes, and scenario commits with 1-click restoration, Undo, and Redo.
- **Cross-Widget Intelligence**: Interactive shared state where selecting regions on charts updates connected KPI cards and metric tables.
- **Workspace Memory**: Durable user preferences for layout density (comfortable vs. compact) and default intent modes.
- **Intelligent Clarification**: Missing information checklist allowing users to fill in unresolved parameters directly without blocking generation.

---

## Approved Component Registry

All UI widgets are rendered strictly through an approved component registry (`src/registry/components.jsx`):
- `ProjectOverview`: Objectives, budget, status, and success criteria.
- `Agenda`: Kickoff meeting duration breakdown with deterministic duration math.
- `SummaryCards`: KPI metrics with tabular numerals (`font-mono tabular-nums`).
- `ChartWidget`: Recharts timeseries and interactive regional bar charts.
- `TaskList`: Deliverables with status checkboxes, owners, due dates, and dependency tags.
- `Timeline`: Gantt schedule comparing baseline vs. simulated scenarios.
- `RiskList` & `BlockerList`: Risks categorized by severity, impact, and proof audit links.
- `InsightList`: AI-verified statements with transparent evidence links.
- `DecisionComparison`: Multi-option trade-off matrix with calculated cost and date impacts.
- `TeamMembers`: Recommended attendee roles and functional leads.
- `NotesPanel`: Core discussion prompts and questions.
- `GoalProgress`: Milestone execution tracker with completion percentages.

---

## Project Structure

```
adaptive-ai-workspace/
├── server/
│   ├── controllers/
│   │   └── workspaceController.js
│   ├── data/
│   │   ├── dataService.js
│   │   └── mockData.js
│   ├── routes/
│   │   └── api.js
│   ├── services/
│   │   ├── aiPlanner.js
│   │   ├── mockPlanner.js
│   │   └── providers/
│   │       ├── geminiProvider.js
│   │       └── groqProvider.js
│   ├── simulation/
│   │   └── engine.js
│   └── validators/
│       └── schemas.js
├── src/
│   ├── components/
│   │   ├── AICopilot.jsx
│   │   ├── AppShell.jsx
│   │   ├── ClarificationModal.jsx
│   │   ├── EvidenceDrawer.jsx
│   │   ├── GoalInput.jsx
│   │   ├── IntentModeSwitcher.jsx
│   │   ├── LoadingState.jsx
│   │   ├── PreferencesModal.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TimeMachinePanel.jsx
│   │   ├── TopBar.jsx
│   │   ├── WidgetContainer.jsx
│   │   ├── WorkspaceCanvas.jsx
│   │   └── WorkspaceHistory.jsx
│   ├── context/
│   │   └── WorkspaceContext.jsx
│   ├── registry/
│   │   └── components.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── tests/
│   └── workspace.test.js
├── index.html
├── metadata.json
├── package.json
├── server.js
├── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites
Node.js 18+

### Installation
```bash
npm install
```

### Environment Variables
Configure in `.env`:
```env
AI_PROVIDER=mock
PORT=3000
GEMINI_API_KEY=""
GROQ_API_KEY=""
```
*(The app runs 100% offline in mock mode with zero paid API keys required).*

### Running Development Server
```bash
npm run dev
```
Access at `http://localhost:3000`.

### Running Tests
```bash
npm test
```
All 16 Vitest unit and integration tests execute and pass.

### Production Build
```bash
npm run build
npm start
```
