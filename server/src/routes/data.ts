import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../services/database/prisma';
import { repository } from '../services/data/repository';
import { PublicUser } from '../services/auth/auth';
import {
  DATA_SOURCE_SCHEMAS,
  DatasetInterpretation,
  selectRecordsForSchema,
  WorkspaceDataSource,
} from '../services/data/datasetSchemaMapping';

const router = Router();

const EMPTY_OVERVIEW_KPIS = {
  totalMrr: 0,
  avgHealthScore: 0,
  overdueTaskCount: 0,
  criticalIncidentCount: 0,
  dailyActiveUsers: 0,
  dauChangePercent: 0,
  upcomingMeetingCount: 0,
  activeClientCount: 0,
};

async function getAccountRecords(userId: string, source: WorkspaceDataSource) {
  const datasets = await prisma.userDataset.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { data: true },
  });
  const schema = DATA_SOURCE_SCHEMAS[source];
  if (!schema) return { records: [] as Record<string, any>[] };

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
  return { records };
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
    const user = res.locals.authUser as PublicUser;
    const [clients, tasks, incidents, usage, meetings] = await Promise.all([
      getAccountRecords(user.id, 'clients'),
      getAccountRecords(user.id, 'tasks'),
      getAccountRecords(user.id, 'support-incidents'),
      getAccountRecords(user.id, 'usage-metrics'),
      getAccountRecords(user.id, 'meetings'),
    ]);
    const clientRows = clients.records;
    const taskRows = tasks.records;
    const incidentRows = incidents.records;
    const usageRows = usage.records.sort((a, b) =>
      String(a.date ?? '').localeCompare(String(b.date ?? ''))
    );
    const meetingRows = meetings.records;
    const today = new Date().toISOString().slice(0, 10);
    const latestDau = Number(usageRows.at(-1)?.dailyActiveUsers) || 0;
    const previousDau = Number(usageRows.at(-2)?.dailyActiveUsers) || 0;

    res.json({
      ...EMPTY_OVERVIEW_KPIS,
      totalMrr: clientRows.reduce((sum, client) => sum + (Number(client.mrr) || 0), 0),
      avgHealthScore: clientRows.length
        ? Math.round(clientRows.reduce((sum, client) => sum + (Number(client.healthScore) || 0), 0) / clientRows.length)
        : 0,
      overdueTaskCount: taskRows.filter(task =>
        task.dueDate &&
        String(task.dueDate).slice(0, 10) < today &&
        !['done', 'completed', 'closed'].includes(String(task.status ?? '').toLowerCase())
      ).length,
      criticalIncidentCount: incidentRows.filter(incident =>
        String(incident.priority ?? '').toLowerCase() === 'critical' &&
        !['resolved', 'closed', 'done'].includes(String(incident.status ?? '').toLowerCase())
      ).length,
      dailyActiveUsers: latestDau,
      dauChangePercent: previousDau
        ? Number((((latestDau - previousDau) / previousDau) * 100).toFixed(1))
        : 0,
      upcomingMeetingCount: meetingRows.filter(meeting =>
        String(meeting.status ?? '').toLowerCase() === 'scheduled' &&
        String(meeting.startTime ?? '').slice(0, 10) >= today
      ).length,
      activeClientCount: clientRows.length,
    });
  } catch (err: any) {
    console.error('Error computing account overview KPIs:', err);
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
    if (!sourceSchema) {
      return res.status(404).json({ error: `Unknown data source: ${source}` });
    }

    const user = res.locals.authUser as PublicUser;
    const accountData = await getAccountRecords(user.id, source as WorkspaceDataSource);
    const ownedScheduledMeetings = source === 'meetings'
      ? (await repository.getMeetings()).filter(meeting => meeting.hostId === user.id)
      : [];
    const records = filterAccountRecords(
      [...accountData.records, ...ownedScheduledMeetings],
      source as WorkspaceDataSource,
      {
        clientId, priority, status, date, days, isOverdue,
      }
    );
    if (source === 'clients' && clientId) {
      return res.json(records.find(record => record.id === clientId) ?? null);
    }
    return res.json(records);
  } catch (error: any) {
    console.error(`Error fetching account data for ${source}:`, error);
    res.status(500).json({ error: `Failed to retrieve data for ${source}`, details: error.message });
  }
});

export default router;
