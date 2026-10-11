import { Router, Request, Response } from 'express';
import { repository } from '../services/data/repository';

const router = Router();

router.post('/:actionId', async (req: Request, res: Response) => {
  const { actionId } = req.params;
  const payload = req.body || {};

  try {
    switch (actionId) {
      case 'confirm_mock_meeting': {
        const { title, date, time, attendees, agenda, relatedProject } = payload;
        const newMeeting = await repository.addMeeting({
          id: `meet-mock-${Date.now()}`,
          title: title || 'NexusFlow 3.0 Launch Readiness',
          clientId: null,
          clientName: 'Internal Core Leadership',
          startTime: `${date || '2026-10-11'}T${(time || '14:00').split(' - ')[0]}:00Z`,
          endTime: `${date || '2026-10-11'}T${(time || '15:00').split(' - ')[1] || '15:00'}:00Z`,
          status: 'Confirmed',
          location: 'NexusFlow Executive Boardroom & Virtual Video',
          hostId: 'emp-1',
          hostName: 'Alex Rivera',
          participants: (attendees || ['Elena Rostova', 'Marcus Vance', 'Alex Rivera']).map((name: string) => ({
            name,
            email: `${name.toLowerCase().replace(' ', '.')}@nexusflow.io`,
            role: 'Launch Council',
            status: 'Accepted'
          })),
          agenda: agenda || [
            { time: '14:00 - 14:15', item: 'Post-mortem on Query Engine v2 memory leak (Elena & Chloe)' },
            { time: '14:15 - 14:35', item: 'Hotfix v2.8.5 deployment verification (Elena Rostova)' },
            { time: '14:35 - 15:00', item: 'Executive Go / No-Go Launch Vote (Alex Rivera)' }
          ],
          briefingSummary: 'Confirmed mock launch meeting successfully added to local session calendar.'
        });

        return res.json({
          success: true,
          message: `Meeting "${newMeeting.title}" successfully confirmed for ${date || 'tomorrow'}!`,
          meeting: newMeeting
        });
      }

      case 'mark_task_complete': {
        const { taskId } = payload;
        if (!taskId) return res.status(400).json({ error: 'taskId required' });

        const updated = await repository.updateTask(taskId, { status: 'Completed' });
        if (!updated) return res.status(404).json({ error: `Task ${taskId} not found` });

        return res.json({
          success: true,
          message: `Task "${updated.title}" marked as Completed.`,
          task: updated
        });
      }

      case 'update_task_priority': {
        const { taskId, priority } = payload;
        if (!taskId || !priority) return res.status(400).json({ error: 'taskId and priority required' });

        const updated = await repository.updateTask(taskId, { priority });
        return res.json({
          success: true,
          message: `Task priority updated to ${priority}.`,
          task: updated
        });
      }

      case 'resolve_incident': {
        const { incidentId } = payload;
        const resolved = await repository.resolveIncident(incidentId);
        if (!resolved) return res.status(404).json({ error: `Incident ${incidentId} not found` });

        return res.json({
          success: true,
          message: `Incident ${resolved.ticketNumber} marked as Resolved.`,
          incident: resolved
        });
      }

      case 'confirm_agenda': {
        return res.json({
          success: true,
          message: 'Meeting agenda confirmed and shared with all participants.'
        });
      }

      case 'copy_briefing': {
        return res.json({
          success: true,
          message: 'Executive briefing dossier copied to clipboard.'
        });
      }

      default: {
        return res.json({
          success: true,
          message: `Action "${actionId}" executed successfully.`,
          receivedPayload: payload
        });
      }
    }
  } catch (error: any) {
    console.error(`Error executing action ${actionId} using Supabase:`, error);
    res.status(500).json({ error: `Action ${actionId} failed`, details: error.message });
  }
});

export default router;
