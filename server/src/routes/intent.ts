import { Router, Request, Response } from 'express';
import { aiPlanner } from '../services/ai/aiPlanner';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { prompt, previousPlan, pinnedComponentIds, clarificationResponse } = req.body;
    if (!prompt && !clarificationResponse) {
      return res.status(400).json({ error: 'Prompt or clarificationResponse is required.' });
    }

    const result = await aiPlanner.generatePlan({
      prompt: prompt || '',
      previousPlan,
      pinnedComponentIds,
      clarificationResponse
    });

    res.json({
      intent: result.plan.intent,
      intentLabel: result.plan.intentLabel,
      entities: result.plan.entities,
      clarificationRequired: result.plan.clarificationRequired,
      clarificationQuestion: result.plan.clarificationQuestion,
      provider: result.provider
    });
  } catch (error: any) {
    console.error('Error in /api/intent:', error);
    res.status(500).json({ error: 'Failed to parse intent', details: error.message });
  }
});

export default router;
