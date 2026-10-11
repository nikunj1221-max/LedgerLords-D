import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { prisma } from '../database/prisma';

export interface Client {
  id: string;
  name: string;
  shortName: string;
  industry: string;
  tier: string;
  status: string;
  mrr: number;
  healthScore: number;
  healthTrend: string;
  contractRenewalDate: string;
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  accountExecutiveId: string;
  accountExecutiveName: string;
  customerSuccessId: string;
  customerSuccessName: string;
  tags: string[];
  summary: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Completed' | 'In Progress' | 'Overdue' | 'Blocked';
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  blockedBy: string | null;
  clientName: string;
  hoursEstimated: number;
  tags: string[];
}

export interface Meeting {
  id: string;
  title: string;
  clientId: string | null;
  clientName: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  googleEventId?: string;
  googleEventLink?: string;
  status: string;
  location: string;
  hostId: string;
  hostName: string;
  participants: Array<{ name: string; email: string; role: string; status: string }>;
  agenda: Array<{ time: string; item: string }>;
  previousMeetingSummary?: string;
  relatedProject?: string | null;
  openIssuesCount?: number;
  briefingSummary?: string;
}

export interface SupportIncident {
  id: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  featureImpacted: string;
  reporter: string;
  assigneeName: string;
  description: string;
}

type StoredRecord = { id: string; payload: Prisma.JsonValue };

function asRecord<T>(row: StoredRecord): T {
  return JSON.parse(JSON.stringify(row.payload)) as T;
}

function asPayload(value: object): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

class DataRepository {
  private readonly prisma = prisma;

  public async getClients(): Promise<Client[]> {
    const rows = await this.prisma.client.findMany();
    return rows.map(row => asRecord<Client>(row));
  }

  public async getClientById(id: string): Promise<Client | undefined> {
    const normalizedId = id.toLowerCase();
    return (await this.getClients()).find(client =>
      client.id.toLowerCase() === normalizedId ||
      client.shortName.toLowerCase() === normalizedId
    );
  }

  public async findClientsByName(nameQuery: string): Promise<Client[]> {
    const query = nameQuery.toLowerCase().trim();
    return (await this.getClients()).filter(client =>
      client.name.toLowerCase().includes(query) ||
      client.shortName.toLowerCase().includes(query)
    );
  }

  public async getCommunications(clientId?: string): Promise<any[]> {
    const rows = await this.prisma.communication.findMany();
    const records = rows.map(row => asRecord<any>(row));
    if (!clientId) return records;
    const query = clientId.toLowerCase();
    return records.filter(record =>
      record.clientId === clientId ||
      record.clientName?.toLowerCase().includes(query)
    );
  }

  public async getMeetings(clientId?: string, dateFilter?: string): Promise<Meeting[]> {
    const rows = await this.prisma.meeting.findMany();
    let meetings = rows.map(row => asRecord<Meeting>(row));
    if (clientId) {
      const query = clientId.toLowerCase();
      meetings = meetings.filter(meeting =>
        meeting.clientId === clientId ||
        meeting.clientName?.toLowerCase().includes(query)
      );
    }
    if (dateFilter) {
      meetings = meetings.filter(meeting => meeting.startTime.startsWith(dateFilter));
    }
    return meetings;
  }

  public async addMeeting(newMeeting: Meeting): Promise<Meeting> {
    await this.prisma.meeting.upsert({
      where: { id: newMeeting.id },
      create: { id: newMeeting.id, payload: asPayload(newMeeting) },
      update: { payload: asPayload(newMeeting) },
    });
    return newMeeting;
  }

  public async getUsageMetrics(days = 90): Promise<any[]> {
    const rows = await this.prisma.usageMetric.findMany({ orderBy: { id: 'asc' } });
    const metrics = rows.map(row => asRecord<any>(row));
    if (days < metrics.length) return metrics.slice(-days);
    return metrics;
  }

  public async getFeatureAdoption(): Promise<any[]> {
    const rows = await this.prisma.featureAdoption.findMany();
    return rows.map(row => asRecord<any>(row));
  }

  public async getReleases(): Promise<any[]> {
    const rows = await this.prisma.release.findMany();
    return rows.map(row => asRecord<any>(row));
  }

  public async getSupportIncidents(
    clientId?: string,
    priority?: string,
    status?: string
  ): Promise<SupportIncident[]> {
    const rows = await this.prisma.supportIncident.findMany();
    let incidents = rows.map(row => asRecord<SupportIncident>(row));
    if (clientId) {
      const query = clientId.toLowerCase();
      incidents = incidents.filter(incident =>
        incident.clientId === clientId ||
        incident.clientName.toLowerCase().includes(query)
      );
    }
    if (priority) {
      incidents = incidents.filter(incident =>
        incident.priority.toLowerCase() === priority.toLowerCase()
      );
    }
    if (status) {
      incidents = incidents.filter(incident =>
        incident.status.toLowerCase() === status.toLowerCase()
      );
    }
    return incidents;
  }

  public async resolveIncident(id: string): Promise<SupportIncident | null> {
    return this.setIncidentStatus(id, 'Resolved');
  }

  public async setIncidentStatus(id: string, status: string): Promise<SupportIncident | null> {
    const rows = await this.prisma.supportIncident.findMany();
    const match = rows
      .map(row => ({ row, incident: asRecord<SupportIncident>(row) }))
      .find(({ row, incident }) => row.id === id || incident.ticketNumber === id);
    if (!match) return null;

    const updatedIncident: SupportIncident = {
      ...match.incident,
      status,
      resolvedAt: status.toLowerCase() === 'resolved'
        ? match.incident.resolvedAt ?? new Date().toISOString()
        : null,
    };
    const updated = await this.prisma.supportIncident.update({
      where: { id: match.row.id },
      data: { payload: asPayload(updatedIncident) },
    });
    return asRecord<SupportIncident>(updated);
  }

  public async getProjects(clientId?: string): Promise<any[]> {
    const rows = await this.prisma.project.findMany();
    const projects = rows.map(row => asRecord<any>(row));
    if (!clientId) return projects;
    const query = clientId.toLowerCase();
    return projects.filter(project =>
      project.clientId === clientId ||
      project.clientName?.toLowerCase().includes(query)
    );
  }

  public async getTasks(filters?: {
    priority?: string;
    status?: string;
    projectId?: string;
    isOverdue?: boolean;
  }): Promise<Task[]> {
    const rows = await this.prisma.task.findMany();
    let tasks = rows.map(row => asRecord<Task>(row));
    if (!filters) return tasks;

    if (filters.priority) {
      tasks = tasks.filter(task =>
        task.priority.toLowerCase() === filters.priority?.toLowerCase()
      );
    }
    if (filters.status) {
      tasks = tasks.filter(task =>
        task.status.toLowerCase() === filters.status?.toLowerCase()
      );
    }
    if (filters.projectId) {
      tasks = tasks.filter(task => task.projectId === filters.projectId);
    }
    if (filters.isOverdue) {
      tasks = tasks.filter(task =>
        task.status === 'Overdue' ||
        (task.dueDate < '2026-10-10' && task.status !== 'Completed')
      );
    }
    return tasks;
  }

  public async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    const row = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!row) return null;

    const updatedTask = { ...asRecord<Task>(row), ...updates };
    const updated = await this.prisma.task.update({
      where: { id: taskId },
      data: { payload: asPayload(updatedTask) },
    });
    return asRecord<Task>(updated);
  }

  public async getEmployees(): Promise<any[]> {
    const rows = await this.prisma.employee.findMany();
    return rows.map(row => asRecord<any>(row));
  }

  public async getAvailability(date?: string, employeeIds?: string[]): Promise<any[]> {
    const rows = await this.prisma.availability.findMany();
    let availability = rows.map(row => asRecord<any>(row));
    if (date) availability = availability.filter(record => record.date === date);
    if (employeeIds?.length) {
      availability = availability.filter(record => employeeIds.includes(record.employeeId));
    }
    return availability;
  }

  public async getActivities(): Promise<any[]> {
    const rows = await this.prisma.activity.findMany();
    return rows.map(row => asRecord<any>(row));
  }

  public async getRecommendations(): Promise<any[]> {
    const rows = await this.prisma.recommendation.findMany();
    return rows.map(row => asRecord<any>(row));
  }

  public async getOverviewKPIs() {
    const [clients, tasks, incidents, usage, meetings] = await Promise.all([
      this.getClients(),
      this.getTasks(),
      this.getSupportIncidents(),
      this.getUsageMetrics(7),
      this.getMeetings(),
    ]);

    const totalMrr = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
    const avgHealth = clients.length
      ? Math.round(clients.reduce((sum, client) => sum + (client.healthScore || 0), 0) / clients.length)
      : 0;
    const overdueTasks = tasks.filter(task =>
      task.status === 'Overdue' ||
      (task.dueDate < '2026-10-10' && task.status !== 'Completed')
    );
    const criticalIncidents = incidents.filter(incident =>
      incident.priority === 'Critical' && incident.status !== 'Resolved'
    );
    const latestDau = usage.length ? usage[usage.length - 1].dailyActiveUsers : 10800;
    const previousDau = usage.length > 1 ? usage[usage.length - 2].dailyActiveUsers : 11200;
    const upcomingMeetings = meetings.filter(meeting => meeting.status === 'Scheduled');

    return {
      totalMrr,
      avgHealthScore: avgHealth,
      overdueTaskCount: overdueTasks.length,
      criticalIncidentCount: criticalIncidents.length,
      dailyActiveUsers: latestDau,
      dauChangePercent: previousDau
        ? Number((((latestDau - previousDau) / previousDau) * 100).toFixed(1))
        : 0,
      upcomingMeetingCount: upcomingMeetings.length,
      activeClientCount: clients.length,
    };
  }
}

export const repository = new DataRepository();
