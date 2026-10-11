import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../services/database/prisma';
import { importUserDataset } from '../services/data/userDatasetImport';
import { PublicUser } from '../services/auth/auth';
import { aiPlanner } from '../services/ai/aiPlanner';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const user = res.locals.authUser as PublicUser;
  try {
    const datasets = await prisma.userDataset.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        format: true,
        recordCount: true,
        createdAt: true,
        data: true,
      },
    });
    res.json({
      datasets: datasets.map(({ data, ...dataset }) => {
        const storedData = data as Prisma.JsonObject;
        return {
          ...dataset,
          columns: Array.isArray(storedData.columns)
            ? storedData.columns.filter((column): column is string => typeof column === 'string')
            : [],
          interpretation: storedData.interpretation ?? null,
        };
      }),
    });
  } catch (error) {
    console.error('Failed to list user datasets:', error);
    res.status(503).json({ error: 'Could not retrieve your uploaded data right now.' });
  }
});

router.get('/:datasetId', async (req: Request, res: Response) => {
  const user = res.locals.authUser as PublicUser;
  try {
    const dataset = await prisma.userDataset.findFirst({
      where: { id: req.params.datasetId, userId: user.id },
    });
    if (!dataset) {
      res.status(404).json({ error: 'Dataset not found.' });
      return;
    }
    res.json({
      id: dataset.id,
      name: dataset.name,
      format: dataset.format,
      recordCount: dataset.recordCount,
      createdAt: dataset.createdAt,
      data: dataset.data,
    });
  } catch (error) {
    console.error('Failed to retrieve user dataset:', error);
    res.status(503).json({ error: 'Could not retrieve this dataset right now.' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const user = res.locals.authUser as PublicUser;
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const format = req.body?.format;
  if (!name || name.length > 255) {
    res.status(400).json({ error: 'A file name of at most 255 characters is required.' });
    return;
  }

  let imported: ReturnType<typeof importUserDataset>;
  try {
    imported = importUserDataset(format, req.body?.content);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : 'The selected file could not be read.',
    });
    return;
  }

  try {
    const interpretation = await aiPlanner.interpretDataset(imported.records);
    const [dataset] = await prisma.$transaction([
      prisma.userDataset.create({
        data: {
          userId: user.id,
          name,
          format,
          recordCount: imported.records.length,
          data: JSON.parse(JSON.stringify({
            columns: imported.columns,
            records: imported.records,
            interpretation,
          })) as Prisma.InputJsonValue,
        },
        select: {
          id: true,
          name: true,
          format: true,
          recordCount: true,
          createdAt: true,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { onboardingComplete: true },
        select: { id: true },
      }),
    ]);
    res.status(201).json({ dataset, interpretation, onboardingComplete: true });
  } catch (error) {
    console.error('Failed to save user dataset:', error);
    res.status(503).json({ error: 'Could not save your uploaded data right now. Please try again.' });
  }
});

router.post('/complete', async (_req: Request, res: Response) => {
  const user = res.locals.authUser as PublicUser;
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingComplete: true },
      select: { id: true },
    });
    res.json({ onboardingComplete: true });
  } catch (error) {
    console.error('Failed to complete user onboarding:', error);
    res.status(503).json({ error: 'Could not continue right now. Please try again.' });
  }
});

export default router;
