import { Router, Request, Response } from 'express';
import { repository } from '../services/data/repository';

const router = Router();

// GET /api/data/kpis/overview
router.get('/kpis/overview', (req: Request, res: Response) => {
  try {
    const kpis = repository.getOverviewKPIs();
    res.json(kpis);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute KPIs', details: err.message });
  }
});

// GET /api/data/:source
router.get('/:source', (req: Request, res: Response) => {
  const { source } = req.params;
  const { clientId, priority, status, date, days, isOverdue } = req.query as Record<string, string>;

  try {
    switch (source) {
      case 'clients': {
        if (clientId) {
          const client = repository.getClientById(clientId);
          return res.json(client || null);
        }
        return res.json(repository.getClients());
      }
      case 'communications': {
        return res.json(repository.getCommunications(clientId));
      }
      case 'meetings': {
        return res.json(repository.getMeetings(clientId, date));
      }
      case 'usage-metrics': {
        const numDays = days ? parseInt(days, 10) : 90;
        return res.json(repository.getUsageMetrics(numDays));
      }
      case 'feature-adoption': {
        return res.json(repository.getFeatureAdoption());
      }
      case 'releases': {
        return res.json(repository.getReleases());
      }
      case 'support-incidents': {
        return res.json(repository.getSupportIncidents(clientId, priority, status));
      }
      case 'projects': {
        return res.json(repository.getProjects(clientId));
      }
      case 'tasks': {
        return res.json(repository.getTasks({
          priority,
          status,
          isOverdue: isOverdue === 'true'
        }));
      }
      case 'employees': {
        return res.json(repository.getEmployees());
      }
      case 'availability': {
        return res.json(repository.getAvailability(date));
      }
      case 'activities': {
        return res.json(repository.getActivities());
      }
      case 'recommendations': {
        return res.json(repository.getRecommendations());
      }
      default:
        return res.status(404).json({ error: `Unknown data source: ${source}` });
    }
  } catch (error: any) {
    console.error(`Error fetching data for ${source}:`, error);
    res.status(500).json({ error: `Failed to retrieve data for ${source}`, details: error.message });
  }
});

export default router;
