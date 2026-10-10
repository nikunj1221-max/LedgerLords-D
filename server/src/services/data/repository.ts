import fs from 'fs';
import path from 'path';

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
  status: 'Investigating' | 'In Progress' | 'Resolved';
  createdAt: string;
  resolvedAt: string | null;
  featureImpacted: string;
  reporter: string;
  assigneeName: string;
  description: string;
}

class DataRepository {
  private baseDir: string;
  private cache: Map<string, any> = new Map();

  constructor() {
    const candidate1 = path.resolve(__dirname, '../../../data');
    const candidate2 = path.resolve(__dirname, '../../../../data');
    const candidate3 = path.resolve(process.cwd(), 'data');
    const candidate4 = path.resolve(process.cwd(), 'server/data');

    if (fs.existsSync(candidate1)) this.baseDir = candidate1;
    else if (fs.existsSync(candidate4)) this.baseDir = candidate4;
    else if (fs.existsSync(candidate2)) this.baseDir = candidate2;
    else if (fs.existsSync(candidate3)) this.baseDir = candidate3;
    else this.baseDir = candidate1;
  }

  private loadFile<T>(filename: string): T {
    if (this.cache.has(filename)) {
      return this.cache.get(filename);
    }
    const fullPath = path.join(this.baseDir, filename);
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${fullPath}`);
      return [] as unknown as T;
    }
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const data = JSON.parse(content);
      this.cache.set(filename, data);
      return data;
    } catch (err) {
      console.error(`Error loading ${filename}:`, err);
      return [] as unknown as T;
    }
  }

  public getClients(): Client[] {
    return this.loadFile<Client[]>('clients.json');
  }

  public getClientById(id: string): Client | undefined {
    return this.getClients().find(c => c.id.toLowerCase() === id.toLowerCase() || c.shortName.toLowerCase() === id.toLowerCase());
  }

  public findClientsByName(nameQuery: string): Client[] {
    const q = nameQuery.toLowerCase().trim();
    return this.getClients().filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.shortName.toLowerCase().includes(q)
    );
  }

  public getCommunications(clientId?: string) {
    const comms = this.loadFile<any[]>('communications.json');
    if (clientId) {
      return comms.filter(c => c.clientId === clientId || c.clientName?.toLowerCase().includes(clientId.toLowerCase()));
    }
    return comms;
  }

  public getMeetings(clientId?: string, dateFilter?: string): Meeting[] {
    const meets = this.loadFile<Meeting[]>('meetings.json');
    let res = meets;
    if (clientId) {
      res = res.filter(m => m.clientId === clientId || m.clientName?.toLowerCase().includes(clientId.toLowerCase()));
    }
    if (dateFilter) {
      res = res.filter(m => m.startTime.startsWith(dateFilter));
    }
    return res;
  }

  public addMeeting(newMeeting: Meeting): Meeting {
    const meets = this.loadFile<Meeting[]>('meetings.json');
    meets.unshift(newMeeting);
    this.cache.set('meetings.json', meets);
    return newMeeting;
  }

  public getUsageMetrics(days: number = 90) {
    const metrics = this.loadFile<any[]>('usage-metrics.json');
    if (days < metrics.length) {
      return metrics.slice(-days);
    }
    return metrics;
  }

  public getFeatureAdoption() {
    return this.loadFile<any[]>('feature-adoption.json');
  }

  public getReleases() {
    return this.loadFile<any[]>('releases.json');
  }

  public getSupportIncidents(clientId?: string, priority?: string, status?: string): SupportIncident[] {
    let incidents = this.loadFile<SupportIncident[]>('support-incidents.json');
    if (clientId) {
      incidents = incidents.filter(i => i.clientId === clientId || i.clientName.toLowerCase().includes(clientId.toLowerCase()));
    }
    if (priority) {
      incidents = incidents.filter(i => i.priority.toLowerCase() === priority.toLowerCase());
    }
    if (status) {
      incidents = incidents.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }
    return incidents;
  }

  public resolveIncident(id: string): SupportIncident | null {
    const incidents = this.loadFile<SupportIncident[]>('support-incidents.json');
    const inc = incidents.find(i => i.id === id || i.ticketNumber === id);
    if (inc) {
      inc.status = 'Resolved';
      inc.resolvedAt = new Date().toISOString();
      this.cache.set('support-incidents.json', incidents);
      return inc;
    }
    return null;
  }

  public getProjects(clientId?: string) {
    const projs = this.loadFile<any[]>('projects.json');
    if (clientId) {
      return projs.filter(p => p.clientId === clientId || p.clientName?.toLowerCase().includes(clientId.toLowerCase()));
    }
    return projs;
  }

  public getTasks(filters?: { priority?: string; status?: string; projectId?: string; isOverdue?: boolean }): Task[] {
    let tasks = this.loadFile<Task[]>('tasks.json');
    if (!filters) return tasks;

    if (filters.priority) {
      tasks = tasks.filter(t => t.priority.toLowerCase() === filters.priority?.toLowerCase());
    }
    if (filters.status) {
      tasks = tasks.filter(t => t.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters.projectId) {
      tasks = tasks.filter(t => t.projectId === filters.projectId);
    }
    if (filters.isOverdue) {
      tasks = tasks.filter(t => t.status === 'Overdue' || (t.dueDate < '2026-10-10' && t.status !== 'Completed'));
    }
    return tasks;
  }

  public updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const tasks = this.loadFile<Task[]>('tasks.json');
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      Object.assign(task, updates);
      this.cache.set('tasks.json', tasks);
      return task;
    }
    return null;
  }

  public getEmployees() {
    return this.loadFile<any[]>('employees.json');
  }

  public getAvailability(date?: string, employeeIds?: string[]) {
    let avail = this.loadFile<any[]>('availability.json');
    if (date) {
      avail = avail.filter(a => a.date === date);
    }
    if (employeeIds && employeeIds.length > 0) {
      avail = avail.filter(a => employeeIds.includes(a.employeeId));
    }
    return avail;
  }

  public getActivities() {
    return this.loadFile<any[]>('activities.json');
  }

  public getRecommendations() {
    return this.loadFile<any[]>('recommendations.json');
  }

  // General business overview KPIs derived directly from datasets
  public getOverviewKPIs() {
    const clients = this.getClients();
    const tasks = this.getTasks();
    const incidents = this.getSupportIncidents();
    const usage = this.getUsageMetrics(7);
    const meetings = this.getMeetings();

    const totalMrr = clients.reduce((sum, c) => sum + (c.mrr || 0), 0);
    const avgHealth = Math.round(clients.reduce((sum, c) => sum + (c.healthScore || 0), 0) / clients.length);
    const overdueTasks = tasks.filter(t => t.status === 'Overdue' || (t.dueDate < '2026-10-10' && t.status !== 'Completed'));
    const criticalIncidents = incidents.filter(i => i.priority === 'Critical' && i.status !== 'Resolved');
    const latestDau = usage.length > 0 ? usage[usage.length - 1].dailyActiveUsers : 10800;
    const previousDau = usage.length > 1 ? usage[usage.length - 2].dailyActiveUsers : 11200;
    const upcomingMeetings = meetings.filter(m => m.status === 'Scheduled');

    return {
      totalMrr,
      avgHealthScore: avgHealth,
      overdueTaskCount: overdueTasks.length,
      criticalIncidentCount: criticalIncidents.length,
      dailyActiveUsers: latestDau,
      dauChangePercent: Number((((latestDau - previousDau) / previousDau) * 100).toFixed(1)),
      upcomingMeetingCount: upcomingMeetings.length,
      activeClientCount: clients.length
    };
  }
}

export const repository = new DataRepository();
