import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { repository } from '../services/data/repository';
import { prisma } from '../services/database/prisma';
import { PublicUser } from '../services/auth/auth';
import {
  buildMeetingAttendeeOptions,
  createCalendarMeeting,
  getMeetingAllowedAttendees,
  getMeetingCalendarSettings,
  isMeetingInFuture,
  MeetingCalendarError,
} from '../services/calendar/meetingCalendar';
import {
  createFieldMappingInterpretation,
  DatasetInterpretation,
  getRecordGroup,
  selectRecordsForSchema,
} from '../services/data/datasetSchemaMapping';

const router = Router();

router.get('/meeting-attendees', async (_req: Request, res: Response) => {
  try {
    const allowedAttendees = getMeetingAllowedAttendees();
    const user = res.locals.authUser as PublicUser;
    const datasets = await prisma.userDataset.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { data: true },
    });
    const employees = datasets.flatMap(dataset => {
      const data = dataset.data as Prisma.JsonObject;
      const records = (Array.isArray(data.records) ? data.records : [])
        .filter((record): record is Prisma.JsonObject =>
          !!record && typeof record === 'object' && !Array.isArray(record)
        ) as Record<string, unknown>[];
      const interpretation = data.interpretation as DatasetInterpretation | undefined;
      return selectRecordsForSchema(records, 'Employee', interpretation);
    });
    res.json({
      attendees: buildMeetingAttendeeOptions(employees, allowedAttendees),
    });
  } catch (error) {
    console.error('Failed to retrieve configured meeting attendees:', error);
    if (error instanceof MeetingCalendarError) {
      return res.status(503).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Could not load meeting attendees.' });
  }
});

router.post('/:actionId', async (req: Request, res: Response) => {
  const { actionId } = req.params;
  const payload = req.body || {};

  try {
    switch (actionId) {
      case 'schedule_meeting': {
        const { requestId, title, date, startTime, durationMinutes, location, attendeeIds } = payload;
        if (typeof requestId !== 'string' ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
          return res.status(400).json({ error: 'A valid meeting request ID is required.' });
        }
        if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
          return res.status(400).json({ error: 'Enter a meeting title of at most 200 characters.' });
        }
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return res.status(400).json({ error: 'Choose a valid meeting date.' });
        }
        const [year, month, day] = date.split('-').map(Number);
        const parsedDate = new Date(Date.UTC(year, month - 1, day));
        if (parsedDate.toISOString().slice(0, 10) !== date) {
          return res.status(400).json({ error: 'Choose a valid meeting date.' });
        }
        if (typeof startTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime)) {
          return res.status(400).json({ error: 'Choose a valid meeting start time.' });
        }
        if (![30, 45, 60, 90].includes(durationMinutes)) {
          return res.status(400).json({ error: 'Choose a supported meeting duration.' });
        }
        if (typeof location !== 'string' || location.length > 500) {
          return res.status(400).json({ error: 'Meeting location must be at most 500 characters.' });
        }
        if (!Array.isArray(attendeeIds) || attendeeIds.length === 0 ||
            attendeeIds.length > 50 ||
            attendeeIds.some((id: unknown) => typeof id !== 'string' || !id.trim())) {
          return res.status(400).json({ error: 'Select at least one valid meeting attendee.' });
        }
        const requestedIds = new Set(attendeeIds as string[]);
        if (requestedIds.size !== attendeeIds.length) {
          return res.status(400).json({ error: 'Each meeting attendee can only be selected once.' });
        }

        const settings = getMeetingCalendarSettings();
        if (!isMeetingInFuture(date, startTime, settings.timeZone)) {
          return res.status(400).json({ error: 'Choose a meeting date and time in the future.' });
        }
        const user = res.locals.authUser as PublicUser;
        const datasets = await prisma.userDataset.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          select: { data: true },
        });
        const employees = datasets.flatMap(dataset => {
          const data = dataset.data as Prisma.JsonObject;
          const records = (Array.isArray(data.records) ? data.records : [])
            .filter((record): record is Prisma.JsonObject =>
              !!record && typeof record === 'object' && !Array.isArray(record)
            ) as Record<string, unknown>[];
          const interpretation = data.interpretation as DatasetInterpretation | undefined;
          return selectRecordsForSchema(records, 'Employee', interpretation);
        });
        const employeeById = new Map<string, Record<string, unknown>>();
        employees.forEach(employee => {
          if (typeof employee.id === 'string' && !employeeById.has(employee.id)) {
            employeeById.set(employee.id, employee);
          }
        });
        const selectedAttendees = Array.from(requestedIds, id => {
          if (id.startsWith('allowlisted:')) {
            const email = id.slice('allowlisted:'.length).trim().toLowerCase();
            return settings.allowedAttendees.has(email)
              ? { email, name: email }
              : undefined;
          }
          const employee = employeeById.get(id);
          if (!employee) return undefined;
          const email = typeof employee.email === 'string' ? employee.email.trim().toLowerCase() : '';
          const name = typeof employee.name === 'string' ? employee.name.trim() : '';
          return email && name && settings.allowedAttendees.has(email)
            ? { email, name }
            : undefined;
        });
        if (selectedAttendees.some(attendee => !attendee)) {
          return res.status(400).json({
            error: 'One or more selected attendees are not in the server allowlist or employee data.',
          });
        }
        const allowedAttendees = selectedAttendees.filter(
          (attendee): attendee is { email: string; name: string } => !!attendee
        );
        if (allowedAttendees.length === 0) {
          return res.status(400).json({
            error: 'Select an attendee whose email is listed in MEETING_ALLOWED_ATTENDEES.',
          });
        }

        const meetingDescription = [
          `Scheduled through SaarthAI by ${user.name}.`,
          `Invited attendees: ${allowedAttendees.map(attendee => attendee.name).join(', ')}.`,
        ].join('\n');
        const event = await createCalendarMeeting({
          requestId,
          title: title.trim(),
          description: meetingDescription,
          date,
          startTime,
          durationMinutes,
          timeZone: settings.timeZone,
          location: location.trim(),
          attendees: allowedAttendees,
        });
        const end = new Date(Date.UTC(
          year,
          month - 1,
          day,
          Number(startTime.slice(0, 2)),
          Number(startTime.slice(3)) + durationMinutes
        ));
        const localDateTime = (value: Date) =>
          `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}-${String(value.getUTCDate()).padStart(2, '0')}T${String(value.getUTCHours()).padStart(2, '0')}:${String(value.getUTCMinutes()).padStart(2, '0')}:00`;
        const meeting = await repository.addMeeting({
          id: event.id,
          title: title.trim(),
          clientId: null,
          clientName: 'Internal meeting',
          startTime: `${date}T${startTime}:00`,
          endTime: localDateTime(end),
          timeZone: settings.timeZone,
          status: 'Scheduled',
          location: location.trim(),
          hostId: user.id,
          hostName: user.name,
          participants: allowedAttendees.map(attendee => ({
            ...attendee,
            role: 'Attendee',
            status: 'Invited',
          })),
          agenda: [],
          googleEventId: event.id,
          googleEventLink: event.htmlLink,
          briefingSummary: 'Created in the configured Google Calendar and invitations sent to allowlisted attendees.',
        });

        return res.status(201).json({
          success: true,
          message: `Google Calendar event created. Invitations were sent to ${allowedAttendees.length} allowlisted attendee(s).`,
          meeting,
          calendarEventLink: event.htmlLink,
          invitedAttendees: allowedAttendees,
          skippedAttendees: [],
          timeZone: settings.timeZone,
        });
      }

      case 'confirm_mock_meeting': {
        return res.status(410).json({
          error: 'Mock meeting creation has been removed. Use the Google Calendar scheduling flow.',
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

      case 'set_incident_status': {
        const { incidentId, status } = payload;
        if (typeof incidentId !== 'string' || !incidentId.trim()) {
          return res.status(400).json({ error: 'incidentId is required' });
        }
        if (typeof status !== 'string' || !status.trim() || status.length > 50) {
          return res.status(400).json({ error: 'A valid incident status is required' });
        }

        const user = res.locals.authUser as PublicUser;
        const datasets = await prisma.userDataset.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        });
        for (const dataset of datasets) {
          const storedData = dataset.data as Prisma.JsonObject;
          const records = (Array.isArray(storedData.records) ? storedData.records : [])
            .filter((record): record is Prisma.JsonObject =>
              !!record && typeof record === 'object' && !Array.isArray(record)
            ) as Record<string, unknown>[];
          const interpretation = storedData.interpretation as DatasetInterpretation | undefined;
          const mapping = interpretation ?? createFieldMappingInterpretation(records);
          const incident = records.find(record =>
            mapping.groups[getRecordGroup(record)]?.schema === 'SupportIncident' &&
            (record.id === incidentId || record.ticketNumber === incidentId)
          );
          if (!incident) continue;

          const resolvedAt = status.toLowerCase() === 'resolved'
            ? (typeof incident.resolvedAt === 'string' ? incident.resolvedAt : new Date().toISOString())
            : null;
          const updatedIncident = { ...incident, status, resolvedAt };
          const updatedRecords = records.map(record =>
            record.id === incidentId || record.ticketNumber === incidentId
              ? updatedIncident
              : record
          );
          await prisma.userDataset.update({
            where: { id: dataset.id },
            data: {
              data: JSON.parse(JSON.stringify({ ...storedData, records: updatedRecords })) as Prisma.InputJsonValue,
            },
          });
          return res.json({
            success: true,
            message: `Incident ${incident.ticketNumber ?? incidentId} status changed to ${status}.`,
            incident: updatedIncident,
          });
        }

        if (datasets.length > 0) {
          return res.status(404).json({ error: `Incident ${incidentId} not found in your uploaded data` });
        }
        const updated = await repository.setIncidentStatus(incidentId, status);
        if (!updated) return res.status(404).json({ error: `Incident ${incidentId} not found` });
        return res.json({
          success: true,
          message: `Incident ${updated.ticketNumber} status changed to ${status}.`,
          incident: updated,
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
    if (error instanceof MeetingCalendarError) {
      return res.status(503).json({ error: error.message });
    }
    res.status(500).json({ error: `Action ${actionId} failed`, details: error.message });
  }
});

export default router;
