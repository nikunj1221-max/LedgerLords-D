import { WorkspacePlanSchema } from '../validators/schemas.js';
import { MockPlanner } from './mockPlanner.js';
import { GeminiProvider } from './providers/geminiProvider.js';
import { GroqProvider } from './providers/groqProvider.js';

export class AIPlanner {
  static getProvider() {
    const providerName = (process.env.AI_PROVIDER || 'mock').toLowerCase();

    if (providerName === 'gemini' && process.env.GEMINI_API_KEY) {
      return new GeminiProvider(process.env.GEMINI_API_KEY);
    }

    if (providerName === 'groq' && process.env.GROQ_API_KEY) {
      return new GroqProvider(process.env.GROQ_API_KEY);
    }

    return {
      generatePlan: (goal, pref) => MockPlanner.generateWorkspace(goal, pref),
      adaptPlan: (ws, inst) => MockPlanner.adaptWorkspace(ws, inst),
    };
  }

  static async generate(goal, preferences = {}) {
    const provider = this.getProvider();
    let rawPlan;
    try {
      rawPlan = await provider.generatePlan(goal, preferences);
    } catch (e) {
      console.warn('Provider failed, using MockPlanner:', e.message);
      rawPlan = MockPlanner.generateWorkspace(goal, preferences);
    }

    // Validate with Zod
    const validation = WorkspacePlanSchema.safeParse(rawPlan);
    if (!validation.success) {
      console.warn('WorkspacePlan validation failed, falling back to verified mock plan:', validation.error.format());
      return MockPlanner.generateWorkspace(goal, preferences);
    }

    return validation.data;
  }

  static async adapt(currentWorkspace, instruction) {
    const provider = this.getProvider();
    const result = await provider.adaptPlan(currentWorkspace, instruction);

    // Validate the updated workspace
    const validation = WorkspacePlanSchema.safeParse(result.updatedWorkspace);
    if (!validation.success) {
      console.warn('Adaptation validation warning:', validation.error.format());
      return MockPlanner.adaptWorkspace(currentWorkspace, instruction);
    }

    return {
      ...result,
      updatedWorkspace: validation.data,
    };
  }
}
