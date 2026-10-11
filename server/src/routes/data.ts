import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { repository } from '../services/data/repository';
import { prisma } from '../services/database/prisma';
import { PublicUser } from '../services/auth/auth';
import {
  DATA_SOURCE_SCHEMAS,
  DatasetInterpretation,
  selectRecordsForSchema,
  WorkspaceDataSource,
} from '../services/data/datasetSchemaMapping';

const router = Router();

async function getAccountRecords(userId: string, source: WorkspaceDataSource) {
  const datasets = await prisma.userDataset.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { data: true },
  });
  const schema = DATA_SOURCE_SCHEMAS[source];
  if (!schema) return { hasUploads: datasets.length > 0, records: [] as Record<string, any>[] };

  const records: Record<string, any>[] = [];
  for (const dataset of datasets) {
    const data = dataset.data as Prisma.JsonObject;
    const rows = Array.isArray(data.records)
      ? data.records.filter((row): row is Record<string, any> =>
        !!row && typeof row === 'object' && !Array.isArray(row))
      : [];
    const interpretation = data.interpretation as DatasetInterpretation | undefined;
    records.push(...selectRecordsForSchema(rows, schema, interpretation));
  }
  return { hasUploads: datasets.length > 0, records };
}

function filterAccountRecords(
  records: Record<string, any>[],
  source: WorkspaceDataSource,
  query: Record<string, string | undefined>
) {
  let filtered = records;
  const { clientId, priority, status, date, days, isOverdue } = query;
  if (clientId) {
    filtered = filtered.filter(record => !record.clientId || record.clientId === clientId);
  }
  if (priority) {
    const priorities = priority.split(',').map(value => value.trim().toLowerCase());
    filtered = filtered.filter(record => priorities.includes(String(record.priority ?? '').toLowerCase()));
  }
  if (status) {
    const statuses = status.toLowerCase() === 'unresolved'
      ? ['open', 'unresolved', 'investigating', 'in progress']
      : status.split(',').map(value => value.trim().toLowerCase());
    filtered = filtered.filter(record => statuses.includes(String(record.status ?? '').toLowerCase()));
  }
  if (date && (source === 'meetings' || source === 'availability')) {
    filtered = filtered.filter(record => String(record.date ?? record.startTime ?? '').startsWith(date));
  }
  if (days && source === 'usage-metrics') {
    const limit = Number.parseInt(days, 10);
    if (Number.isFinite(limit) && limit > 0) {
      filtered = filtered.slice(-limit);
    }
  }
  if (isOverdue === 'true' && source === 'tasks') {
    const today = new Date().toISOString().slice(0, 10);
    filtered = filtered.filter(record =>
      record.dueDate && String(record.dueDate).slice(0, 10) < today &&
      !['done', 'completed', 'closed'].includes(String(record.status ?? '').toLowerCase())
    );
  }
  return filtered;
}

// GET /api/data/kpis/overview
router.get('/kpis/overview', async (req: Request, res: Response) => {
  try {
    const kpis = await repository.getOverviewKPIs();
    res.json(kpis);
  } catch (err: any) {
    console.error('Error computing overview KPIs from Supabase:', err);
    res.status(500).json({ error: 'Failed to compute KPIs', details: err.message });
  }
});

// GET /api/data/:source
router.get('/:source', async (req: Request, res: Response) => {
  const { source } = req.params;
  const query = req.query as Record<string, string>;
  const { clientId, priority, status, date, days, isOverdue } = query;

  try {
    const sourceSchema = DATA_SOURCE_SCHEMAS[source as WorkspaceDataSource];
    if (sourceSchema) {
      const user = res.locals.authUser as PublicUser;
      const accountData = await getAccountRecords(user.id, source as WorkspaceDataSource);
      if (accountData.hasUploads) {
        const records = filterAccountRecords(accountData.records, source as WorkspaceDataSource, {
          clientId, priority, status, date, days, isOverdue,
        });
        if (source === 'clients' && clientId) {
          return res.json(records.find(record => record.id === clientId) ?? records[0] ?? null);
        }
        return res.json(records);
      }
    }

    switch (source) {
      case 'clients': {
        if (clientId) {
          const client = await repository.getClientById(clientId);
          return res.json(client || null);
        }
        return res.json(await repository.getClients());
      }
      case 'communications': {
        return res.json(await repository.getCommunications(clientId));
      }
      case 'meetings': {
        return res.json(await repository.getMeetings(clientId, date));
      }
      case 'usage-metrics': {
        const numDays = days ? parseInt(days, 10) : 90;
        return res.json(await repository.getUsageMetrics(numDays));
      }
      case 'feature-adoption': {
        return res.json(await repository.getFeatureAdoption());
      }
      case 'releases': {
        return res.json(await repository.getReleases());
      }
      case 'support-incidents': {
        return res.json(await repository.getSupportIncidents(clientId, priority, status));
      }
      case 'projects': {
        return res.json(await repository.getProjects(clientId));
      }
      case 'tasks': {
        return res.json(await repository.getTasks({
          priority,
          status,
          isOverdue: isOverdue === 'true'
        }));
      }
      case 'employees': {
        return res.json(await repository.getEmployees());
      }
      case 'availability': {
        return res.json(await repository.getAvailability(date));
      }
      case 'activities': {
        return res.json(await repository.getActivities());
      }
      case 'recommendations': {
        return res.json(await repository.getRecommendations());
      }
      default:
        return res.status(404).json({ error: `Unknown data source: ${source}` });
    }
  } catch (error: any) {
    console.error(`Error fetching data for ${source} from Supabase:`, error);
    res.status(500).json({ error: `Failed to retrieve data for ${source}`, details: error.message });
  }
});

export default router;
