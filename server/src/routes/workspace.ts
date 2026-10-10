import { Router, Request, Response } from 'express';
import { aiPlanner } from '../services/ai/aiPlanner';

const router = Router();

// POST /api/workspace/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, previousPlan, pinnedComponentIds, clarificationResponse } = req.body;
    
    const result = await aiPlanner.generatePlan({
      prompt: prompt || '',
      previousPlan,
      pinnedComponentIds,
      clarificationResponse
    });

    res.json({
      plan: result.plan,
      provider: result.provider
    });
  } catch (error: any) {
    console.error('Error generating workspace plan:', error);
    res.status(500).json({ error: 'Failed to generate workspace plan', details: error.message });
  }
});

// POST /api/workspace/refine
router.post('/refine', async (req: Request, res: Response) => {
  try {
    const { prompt, previousPlan, pinnedComponentIds } = req.body;
    if (!previousPlan) {
      return res.status(400).json({ error: 'previousPlan is required for refinement.' });
    }

    const result = await aiPlanner.generatePlan({
      prompt: prompt || '',
      previousPlan,
      pinnedComponentIds
    });

    res.json({
      plan: result.plan,
      provider: result.provider
    });
  } catch (error: any) {
    console.error('Error refining workspace plan:', error);
    res.status(500).json({ error: 'Failed to refine workspace plan', details: error.message });
  }
});

export default router;
