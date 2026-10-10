import { GoogleGenAI } from '@google/genai';
import { MockPlanner } from '../mockPlanner.js';

export class GeminiProvider {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.ai = this.apiKey ? new GoogleGenAI({ apiKey: this.apiKey }) : null;
  }

  async generatePlan(goal, preferences) {
    if (!this.ai) {
      return MockPlanner.generateWorkspace(goal, preferences);
    }

    try {
      const prompt = `You are the AI planner for an Adaptive AI Workspace.
User goal: "${goal}"
Available component types: ["ProjectOverview", "Agenda", "SummaryCards", "ChartWidget", "TaskList", "Timeline", "RiskList", "BlockerList", "InsightList", "DecisionComparison", "TeamMembers", "NotesPanel", "GoalProgress"]
Approved data sources: ["project-overview", "project-tasks", "meeting-agenda", "project-blockers", "sales-summary", "sales-history", "sales-by-region", "decision-options"]

Generate a valid JSON object matching this structure:
{
  "id": "ws-...",
  "title": "string",
  "goal": "${goal}",
  "intentMode": "explore",
  "widgets": [
    {
      "id": "w-...",
      "type": "ProjectOverview",
      "title": "string",
      "description": "string",
      "dataSourceIds": ["project-overview"],
      "layout": { "colSpan": 12, "order": 1 },
      "isPinned": false,
      "explanation": "string",
      "config": {}
    }
  ],
  "missingInfo": [],
  "explanation": "string"
}
Output raw JSON only.`;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text?.();
      if (!text) {
        return MockPlanner.generateWorkspace(goal, preferences);
      }
      const parsed = JSON.parse(text);
      return parsed;
    } catch (err) {
      console.warn('Gemini generation failed, falling back to MockPlanner:', err.message);
      return MockPlanner.generateWorkspace(goal, preferences);
    }
  }

  async adaptPlan(currentWorkspace, instruction) {
    // For reliable deterministic workflow, use MockPlanner's verified logic
    return MockPlanner.adaptWorkspace(currentWorkspace, instruction);
  }
}
