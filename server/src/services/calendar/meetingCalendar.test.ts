import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMeetingAttendeeOptions,
  buildCalendarEvent,
  getMeetingAllowedAttendees,
  getMeetingCalendarSettings,
  getMeetingEventId,
  isMeetingInFuture,
  MeetingCalendarError,
} from './meetingCalendar';

const validEnv: NodeJS.ProcessEnv = {
  GOOGLE_CALENDAR_CLIENT_ID: 'demo-client',
  GOOGLE_CALENDAR_CLIENT_SECRET: 'demo-secret',
  GOOGLE_CALENDAR_REFRESH_TOKEN: 'demo-refresh-token',
  MEETING_ALLOWED_ATTENDEES: 'one@example.com, two@example.com',
};

test('requires server OAuth credentials and an attendee allowlist', () => {
  assert.throws(
    () => getMeetingCalendarSettings({}),
    (error: unknown) => error instanceof MeetingCalendarError && /OAuth client ID/.test(error.message)
  );
  assert.throws(
    () => getMeetingCalendarSettings({ ...validEnv, MEETING_ALLOWED_ATTENDEES: '' }),
    (error: unknown) => error instanceof MeetingCalendarError && /between one and three/.test(error.message)
  );
});

test('normalizes the recipient allowlist and applies safe calendar defaults', () => {
  const settings = getMeetingCalendarSettings({
    ...validEnv,
    MEETING_ALLOWED_ATTENDEES: ' One@Example.com, two@example.com ',
  });

  assert.deepEqual([...settings.allowedAttendees], ['one@example.com', 'two@example.com']);
  assert.equal(settings.calendarId, 'primary');
  assert.equal(settings.timeZone, 'Asia/Kolkata');
  assert.equal(settings.reminderMinutes, 10);
});

test('loads the attendee allowlist without requiring Google OAuth credentials', () => {
  assert.deepEqual(
    [...getMeetingAllowedAttendees({ MEETING_ALLOWED_ATTENDEES: ' One@Example.com, two@example.com ' })],
    ['one@example.com', 'two@example.com']
  );
});

test('compares meeting times against now in the configured calendar timezone', () => {
  const now = new Date('2026-10-11T18:00:00.000Z');

  assert.equal(isMeetingInFuture('2026-10-11', '23:29', 'Asia/Kolkata', now), false);
  assert.equal(isMeetingInFuture('2026-10-11', '23:31', 'Asia/Kolkata', now), true);
  assert.equal(isMeetingInFuture('2026-10-10', '10:00', 'Asia/Kolkata', now), false);
});

test('rejects more than three allowed recipients or invalid reminder values', () => {
  assert.throws(
    () => getMeetingCalendarSettings({
      ...validEnv,
      MEETING_ALLOWED_ATTENDEES: 'a@example.com,b@example.com,c@example.com,d@example.com',
    }),
    MeetingCalendarError
  );
  assert.throws(
    () => getMeetingCalendarSettings({ ...validEnv, MEETING_REMINDER_MINUTES: '40321' }),
    MeetingCalendarError
  );
});

test('lists an allowlisted invitee even when no employee record exists', () => {
  const options = buildMeetingAttendeeOptions([], new Set(['saniyastargupta12@gmail.com']));

  assert.deepEqual(options, [{
    id: 'allowlisted:saniyastargupta12@gmail.com',
    name: 'saniyastargupta12@gmail.com',
    role: 'Configured attendee',
    email: 'saniyastargupta12@gmail.com',
    avatar: '',
    department: '',
  }]);
});

test('only exposes employee records whose email is allowlisted', () => {
  const options = buildMeetingAttendeeOptions([
    { id: 'employee-1', name: 'Allowed Employee', email: 'One@Example.com' },
    { id: 'employee-2', name: 'Unlisted Employee', email: 'other@example.com' },
  ], new Set(['one@example.com']));

  assert.equal(options.length, 1);
  assert.equal(options[0].id, 'employee-1');
  assert.equal(options[0].email, 'one@example.com');
});

test('creates a time-zoned Google event with only supplied attendees and a reminder', () => {
  const input = {
    requestId: '7ac20c78-d13b-4f11-88ab-26ab2f6debb9',
    title: 'Client planning',
    description: 'Discuss the launch plan.',
    date: '2026-10-12',
    startTime: '23:30',
    durationMinutes: 60,
    timeZone: 'Asia/Kolkata',
    location: 'Online',
    attendees: [{ email: 'one@example.com', name: 'One' }],
  };
  const event = buildCalendarEvent(input, 10);

  assert.equal(event.summary, input.title);
  assert.deepEqual(event.start, { dateTime: '2026-10-12T23:30:00', timeZone: 'Asia/Kolkata' });
  assert.deepEqual(event.end, { dateTime: '2026-10-13T00:30:00', timeZone: 'Asia/Kolkata' });
  assert.deepEqual(event.attendees, [{ email: 'one@example.com', displayName: 'One' }]);
  assert.deepEqual(event.reminders.overrides, [
    { method: 'email', minutes: 10 },
    { method: 'popup', minutes: 10 },
  ]);
  assert.equal(getMeetingEventId(input.requestId), event.id);
});
