import axios from 'axios';
import { createHash } from 'node:crypto';

export interface MeetingCalendarSettings {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
  timeZone: string;
  reminderMinutes: number;
  allowedAttendees: Set<string>;
}

export interface CalendarMeetingInput {
  requestId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  timeZone: string;
  location: string;
  attendees: Array<{ email: string; name: string }>;
}

export interface CalendarEventResult {
  id: string;
  htmlLink?: string;
  start: { dateTime?: string; timeZone?: string };
  end: { dateTime?: string; timeZone?: string };
}

export interface MeetingAttendeeOption {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  department: string;
}

export class MeetingCalendarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MeetingCalendarError';
  }
}

export function getMeetingCalendarSettings(
  env: NodeJS.ProcessEnv = process.env
): MeetingCalendarSettings {
  const clientId = env.GOOGLE_CALENDAR_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim();
  const refreshToken = env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim();
  const reminderMinutes = Number.parseInt(env.MEETING_REMINDER_MINUTES ?? '10', 10);

  if (!clientId || !clientSecret || !refreshToken) {
    throw new MeetingCalendarError(
      'Google Calendar is not configured. Set the Calendar OAuth client ID, client secret, and refresh token on the server.'
    );
  }
  const allowedAttendees = getMeetingAllowedAttendees(env);
  if (!Number.isInteger(reminderMinutes) || reminderMinutes < 0 || reminderMinutes > 40320) {
    throw new MeetingCalendarError('MEETING_REMINDER_MINUTES must be between 0 and 40320.');
  }

  const timeZone = env.GOOGLE_CALENDAR_TIME_ZONE?.trim() || 'Asia/Kolkata';
  try {
    new Intl.DateTimeFormat('en', { timeZone });
  } catch {
    throw new MeetingCalendarError('GOOGLE_CALENDAR_TIME_ZONE must be a valid IANA timezone.');
  }

  return {
    clientId,
    clientSecret,
    refreshToken,
    calendarId: env.GOOGLE_CALENDAR_ID?.trim() || 'primary',
    timeZone,
    reminderMinutes,
    allowedAttendees,
  };
}

export function getMeetingAllowedAttendees(
  env: NodeJS.ProcessEnv = process.env
): Set<string> {
  const allowedAttendees = (env.MEETING_ALLOWED_ATTENDEES ?? '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean);

  if (allowedAttendees.length === 0 || allowedAttendees.length > 3) {
    throw new MeetingCalendarError(
      'Configure between one and three addresses in MEETING_ALLOWED_ATTENDEES before scheduling.'
    );
  }
  if (new Set(allowedAttendees).size !== allowedAttendees.length ||
      allowedAttendees.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new MeetingCalendarError('MEETING_ALLOWED_ATTENDEES must contain unique, valid email addresses.');
  }
  return new Set(allowedAttendees);
}

export function isMeetingInFuture(
  date: string,
  startTime: string,
  timeZone: string,
  now = new Date()
): boolean {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const currentParts = Object.fromEntries(
    parts.filter(part => part.type !== 'literal').map(part => [part.type, part.value])
  );
  const currentLocalDateTime =
    `${currentParts.year}-${currentParts.month}-${currentParts.day}T${currentParts.hour}:${currentParts.minute}`;
  return `${date}T${startTime}` > currentLocalDateTime;
}

export function getMeetingEventId(requestId: string): string {
  return createHash('sha256').update(requestId).digest('hex').slice(0, 40);
}

export function buildMeetingAttendeeOptions(
  employees: Array<Record<string, unknown>>,
  allowedAttendees: Set<string>
): MeetingAttendeeOption[] {
  const options: MeetingAttendeeOption[] = [];
  const includedEmails = new Set<string>();

  for (const employee of employees) {
    const email = typeof employee.email === 'string' ? employee.email.trim().toLowerCase() : '';
    if (!email || !allowedAttendees.has(email) || includedEmails.has(email)) continue;
    includedEmails.add(email);
    options.push({
      id: typeof employee.id === 'string' ? employee.id : `allowlisted:${email}`,
      name: typeof employee.name === 'string' && employee.name.trim()
        ? employee.name.trim()
        : email,
      role: typeof employee.role === 'string' && employee.role.trim()
        ? employee.role.trim()
        : 'Configured attendee',
      email,
      avatar: typeof employee.avatar === 'string' ? employee.avatar : '',
      department: typeof employee.department === 'string' ? employee.department : '',
    });
  }

  for (const email of allowedAttendees) {
    if (includedEmails.has(email)) continue;
    options.push({
      id: `allowlisted:${email}`,
      name: email,
      role: 'Configured attendee',
      email,
      avatar: '',
      department: '',
    });
  }
  return options;
}

export function buildCalendarEvent(
  input: CalendarMeetingInput,
  reminderMinutes: number
) {
  const [year, month, day] = input.date.split('-').map(Number);
  const [hour, minute] = input.startTime.split(':').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  const toLocalDateTime = (date: Date) => {
    const datePart = [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, '0'),
      String(date.getUTCDate()).padStart(2, '0'),
    ].join('-');
    const timePart = [
      String(date.getUTCHours()).padStart(2, '0'),
      String(date.getUTCMinutes()).padStart(2, '0'),
    ].join(':');
    return `${datePart}T${timePart}:00`;
  };

  return {
    id: getMeetingEventId(input.requestId),
    summary: input.title,
    description: input.description,
    location: input.location || undefined,
    start: { dateTime: toLocalDateTime(start), timeZone: input.timeZone },
    end: { dateTime: toLocalDateTime(end), timeZone: input.timeZone },
    attendees: input.attendees.map(attendee => ({
      email: attendee.email,
      displayName: attendee.name,
    })),
    reminders: {
      useDefault: false,
      overrides: reminderMinutes > 0
        ? [{ method: 'email', minutes: reminderMinutes }, { method: 'popup', minutes: reminderMinutes }]
        : [],
    },
    extendedProperties: { private: { appRequestId: input.requestId } },
  };
}

async function getAccessToken(settings: MeetingCalendarSettings): Promise<string> {
  try {
    const response = await axios.post<{ access_token?: string }>(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
        refresh_token: settings.refreshToken,
        grant_type: 'refresh_token',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    if (!response.data.access_token) {
      throw new MeetingCalendarError('Google OAuth did not return an access token.');
    }
    return response.data.access_token;
  } catch (error) {
    if (error instanceof MeetingCalendarError) throw error;
    console.error('Google Calendar token refresh failed:', {
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });
    throw new MeetingCalendarError(
      'Could not authenticate with Google Calendar. Check the server OAuth credentials and refresh token.'
    );
  }
}

export async function createCalendarMeeting(
  input: CalendarMeetingInput
): Promise<CalendarEventResult> {
  const settings = getMeetingCalendarSettings();
  const accessToken = await getAccessToken(settings);
  const event = buildCalendarEvent(input, settings.reminderMinutes);
  const calendarEventsUrl =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(settings.calendarId)}/events`;

  try {
    const response = await axios.post<CalendarEventResult>(
      calendarEventsUrl,
      event,
      {
        params: { sendUpdates: 'all' },
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 409) {
      try {
        const existing = await axios.get<CalendarEventResult & {
          extendedProperties?: { private?: { appRequestId?: string } };
        }>(
          `${calendarEventsUrl}/${event.id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (existing.data.extendedProperties?.private?.appRequestId === input.requestId) {
          return existing.data;
        }
      } catch (lookupError) {
        console.error('Could not verify an existing Google Calendar event:', {
          status: axios.isAxiosError(lookupError) ? lookupError.response?.status : undefined,
        });
      }
    }

    console.error('Google Calendar event creation failed:', {
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });
    throw new MeetingCalendarError(
      'Google Calendar could not create the event. Check Calendar API access and the configured calendar.'
    );
  }
}
