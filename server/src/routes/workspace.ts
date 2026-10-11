import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { aiPlanner } from '../services/ai/aiPlanner';
import { UIPlan } from '../schemas/uiPlan';
import { prisma } from '../services/database/prisma';
import { PublicUser } from '../services/auth/auth';
import {
  isWorkspacePromptRelevant,
  WORKSPACE_PROMPT_SUGGESTIONS,
} from '../services/ai/promptRelevance';
import {
  DatabaseSchema,
  SCHEMA_DATA_SOURCES,
  WorkspaceDataSource,
} from '../services/data/datasetSchemaMapping';

const router = Router();

function buildNoDataPlan(prompt: string): UIPlan {
  return {
    id: `plan-no-data-${Date.now()}`,
    intent: 'custom_goal',
    intentLabel: 'Waiting for your data',
    title: 'Upload data to build your workspace',
    subtitle: 'This account has no uploaded datasets yet, so demo records are not shown.',
    prompt,
    entities: {},
    layout: 'focused-dashboard',
    components: [{
      id: 'no-uploaded-data',
      type: 'EmptyState',
      title: 'No data uploaded',
      dataSource: 'none',
      position: 1,
      colSpan: 4,
      explanation: 'Your workspace uses only data uploaded to your account.',
      config: { message: 'Upload a CSV or JSON dataset to use this prompt with your own records.' },
    }],
    dataSources: [],
    actions: [],
    explanations: {
      overallRationale: 'A workspace will be created from your own records after you upload a dataset.',
      selectedSources: [],
      confidence: 1,
    },
    clarificationRequired: false,
  };
}

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
    if (typeof prompt !== 'string' || prompt.trim().length === 0 || prompt.length > 1000) {
      return res.status(400).json({ error: 'Enter a prompt between 1 and 1000 characters.' });
    }
    const user = res.locals.authUser as PublicUser;
    const userDatasets = await getUserDatasets(user.id);
    if (!isWorkspacePromptRelevant(prompt, {
      hasWorkspaceContext: Boolean(previousPlan),
      datasetColumns: userDatasets.map(dataset => dataset.columns),
    })) {
      return res.status(422).json({
        error: 'That prompt doesn’t look related to your workspace. Ask about your clients, meetings, projects, tasks, product usage, support issues, or uploaded data.',
        suggestedPrompts: WORKSPACE_PROMPT_SUGGESTIONS,
      });
    }
    if (userDatasets.length === 0) {
      return res.json({
        plan: buildNoDataPlan(typeof prompt === 'string' ? prompt : ''),
        provider: 'deterministic',
      });
    }
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
    if (typeof prompt !== 'string' || prompt.trim().length === 0 || prompt.length > 1000) {
      return res.status(400).json({ error: 'Enter a prompt between 1 and 1000 characters.' });
    }
    if (!previousPlan) {
      return res.status(400).json({ error: 'previousPlan is required for refinement.' });
    }
    const userDatasets = await getUserDatasets(user.id);
    if (!isWorkspacePromptRelevant(prompt, {
      hasWorkspaceContext: true,
      datasetColumns: userDatasets.map(dataset => dataset.columns),
    })) {
      return res.status(422).json({
        error: 'That prompt doesn’t look related to your workspace. Ask about your clients, meetings, projects, tasks, product usage, support issues, or uploaded data.',
        suggestedPrompts: WORKSPACE_PROMPT_SUGGESTIONS,
      });
    }
    if (userDatasets.length === 0) {
      return res.json({
        plan: buildNoDataPlan(typeof prompt === 'string' ? prompt : ''),
        provider: 'deterministic',
      });
    }

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
