import { MockPlanner } from '../mockPlanner.js';

export class GroqProvider {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GROQ_API_KEY;
  }

  async generatePlan(goal, preferences) {
    if (!this.apiKey) {
      return MockPlanner.generateWorkspace(goal, preferences);
    }

    try {
      // Call Groq API via standard fetch
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You generate structured JSON workspace plans for Adaptive AI Workspace. Output pure JSON matching schema.'
            },
            {
              role: 'user',
              content: `Goal: ${goal}`
            }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!res.ok) {
        return MockPlanner.generateWorkspace(goal, preferences);
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      return JSON.parse(content);
    } catch (err) {
      console.warn('Groq provider error, falling back to MockPlanner:', err.message);
      return MockPlanner.generateWorkspace(goal, preferences);
    }
  }

  async adaptPlan(currentWorkspace, instruction) {
    return MockPlanner.adaptWorkspace(currentWorkspace, instruction);
  }
}
