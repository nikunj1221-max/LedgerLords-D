import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { aiPlanner } from '../services/ai/aiPlanner';
import { prisma } from '../services/database/prisma';
import { PublicUser } from '../services/auth/auth';
import {
  DatabaseSchema,
  SCHEMA_DATA_SOURCES,
  WorkspaceDataSource,
} from '../services/data/datasetSchemaMapping';

const router = Router();

async function getUserDatasets(userId: string) {
  const rows = await prisma.userDataset.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, recordCount: true, data: true },
  });
  return rows.map(row => {
    const data = row.data as Prisma.JsonObject;
    const columns = Array.isArray(data.columns)
      ? data.columns.filter((column): column is string => typeof column === 'string')
      : [];
    const interpretation = data.interpretation as Prisma.JsonObject | undefined;
    const groups = interpretation?.groups as Record<string, { schema?: string }> | undefined;
    const sources = Array.from(new Set(
      Object.values(groups ?? {}).flatMap(mapping => {
        const source = SCHEMA_DATA_SOURCES[mapping.schema as DatabaseSchema];
        return source ? [source] : [];
      })
    )) as WorkspaceDataSource[];
    return { id: row.id, name: row.name, recordCount: row.recordCount, columns, sources };
  });
}

// POST /api/workspace/generate
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, previousPlan, pinnedComponentIds, clarificationResponse } = req.body;
    const user = res.locals.authUser as PublicUser;
    const userDatasets = await getUserDatasets(user.id);
    const result = await aiPlanner.generatePlan({
      prompt: prompt || '',
      previousPlan,
      pinnedComponentIds,
      userDatasets,
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
    const user = res.locals.authUser as PublicUser;
    if (!previousPlan) {
      return res.status(400).json({ error: 'previousPlan is required for refinement.' });
    }
    const userDatasets = await getUserDatasets(user.id);

    const result = await aiPlanner.generatePlan({
      prompt: prompt || '',
      previousPlan,
      pinnedComponentIds,
      userDatasets,
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
