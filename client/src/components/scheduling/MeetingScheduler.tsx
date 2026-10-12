import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, Video, CheckCircle2, Sparkles } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { AttendeeSelector } from './AttendeeSelector';

interface MeetingResult {
  title: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  location: string;
  timeZone: string;
  calendarEventLink?: string;
  invitedAttendees: Array<{ name: string; email: string }>;
  skippedAttendees: Array<{ name: string }>;
}

const localDate = (date: Date) => {
  const localYear = date.getFullYear();
  const localMonth = String(date.getMonth() + 1).padStart(2, '0');
  const localDay = String(date.getDate()).padStart(2, '0');
  return `${localYear}-${localMonth}-${localDay}`;
};

const getInitialMeetingDate = (preferredDate: unknown, startTime = '14:00') => {
  const now = new Date();
  const today = localDate(now);
  const hasValidPreferredDate =
    typeof preferredDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(preferredDate);
  const candidate = hasValidPreferredDate && preferredDate >= today ? preferredDate : today;
  if (
    candidate === today &&
    startTime <= `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  ) {
    now.setDate(now.getDate() + 1);
    return localDate(now);
  }
  return candidate;
};

export const MeetingScheduler: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const config = spec.config || {};
  const initialStartTime = '14:00';
  const [title, setTitle] = useState(
    config.defaultTitle || 'Strategic Review & Team Sync'
  );
  const [date, setDate] = useState(getInitialMeetingDate(config.defaultDate, initialStartTime));
  const [startTime, setStartTime] = useState(initialStartTime);
  const [duration, setDuration] = useState(config.defaultDuration || '60');
  const [location, setLocation] = useState('');
  const [confirmedMeeting, setConfirmedMeeting] = useState<MeetingResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedAttendeeIds = useWorkspaceStore(state => state.selectedAttendeeIds);
  const requestIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (config.defaultTitle) {
      setTitle(config.defaultTitle);
    }
  }, [config.defaultTitle]);

  useEffect(() => {
    requestIdRef.current = null;
  }, [title, date, startTime, duration, location, selectedAttendeeIds]);

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);
    requestIdRef.current ??= crypto.randomUUID();

    try {
      const response = await axios.post('/api/actions/schedule_meeting', {
        requestId: requestIdRef.current,
        title,
        date,
        startTime,
        durationMinutes: Number(duration),
        location,
        attendeeIds: selectedAttendeeIds,
      });
      setConfirmedMeeting({
        title,
        date,
        startTime,
        durationMinutes: Number(duration),
        location,
        timeZone: response.data.timeZone,
        calendarEventLink: response.data.calendarEventLink,
        invitedAttendees: response.data.invitedAttendees,
        skippedAttendees: response.data.skippedAttendees,
      });
      requestIdRef.current = null;
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || 'Could not create the Google Calendar event.'
          : 'Could not create the Google Calendar event.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedMeeting) {
    return (
      <div className="p-4 rounded-xl bg-mint/10 border border-mint/30 text-xs space-y-3">
        <div className="flex items-center gap-2 text-mint font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5 text-mint" />
          Google Calendar event created
        </div>
        <p className="text-[var(--text-secondary)]">
          Invitations were sent to the selected attendees that are enabled by the server allowlist.
          The event and its reminder are on the configured demo Google Calendar.
        </p>
        <div className="p-3 rounded-lg bg-canvas border border-border/60 space-y-1.5 font-mono text-[11px]">
          <div><strong className="text-[var(--text-primary)]">Title:</strong> {confirmedMeeting.title}</div>
          <div>
            <strong className="text-[var(--text-primary)]">Date &amp; time:</strong>{' '}
            {confirmedMeeting.date} {confirmedMeeting.startTime} ({confirmedMeeting.timeZone})
          </div>
          <div>
            <strong className="text-[var(--text-primary)]">Invited:</strong>{' '}
            {confirmedMeeting.invitedAttendees.map(attendee => attendee.email).join(', ')}
          </div>
          {confirmedMeeting.skippedAttendees.length > 0 && (
            <div>
              <strong className="text-[var(--text-primary)]">Not invited (not allowlisted):</strong>{' '}
              {confirmedMeeting.skippedAttendees.map(attendee => attendee.name).join(', ')}
            </div>
          )}
          {confirmedMeeting.location && (
            <div><strong className="text-[var(--text-primary)]">Location:</strong> {confirmedMeeting.location}</div>
          )}
        </div>
        {confirmedMeeting.calendarEventLink && (
          <a
            href={confirmedMeeting.calendarEventLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-primary hover:underline font-medium"
          >
            Open event in Google Calendar
          </a>
        )}
        <button
          type="button"
          onClick={() => setConfirmedMeeting(null)}
          className="block text-xs text-primary hover:underline font-medium"
        >
          Schedule another meeting
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="block text-gray-400 font-medium mb-1 flex items-center justify-between">
          <span>Meeting title / topic:</span>
          <span className="text-primary text-[10px] flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3" />
            Edit before sending
          </span>
        </label>
        <input
          type="text"
          value={title}
          maxLength={200}
          onChange={event => setTitle(event.target.value)}
          className="w-full bg-canvas border border-border/70 rounded-lg px-3 py-2 text-[var(--text-primary)] font-medium focus:outline-none focus:border-primary text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 font-medium mb-1">Date:</label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="date"
              min={localDate(new Date())}
              value={date}
              onChange={event => setDate(event.target.value)}
              className="w-full bg-canvas border border-border/70 rounded-lg pl-8 pr-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-primary text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 font-medium mb-1">Start time:</label>
          <div className="relative">
            <Clock className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <select
              value={startTime}
              onChange={event => setStartTime(event.target.value)}
              className="w-full bg-canvas border border-border/70 rounded-lg pl-8 pr-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-primary text-xs"
            >
              <option value="11:00">11:00 AM</option>
              <option value="13:00">01:00 PM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:00">03:00 PM</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 font-medium mb-1">Duration:</label>
          <select
            value={duration}
            onChange={event => setDuration(event.target.value)}
            className="w-full bg-canvas border border-border/70 rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-primary text-xs"
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
            <option value="90">90 minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-400 font-medium mb-1">Location / room:</label>
          <div className="relative">
            <Video className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={location}
              maxLength={500}
              onChange={event => setLocation(event.target.value)}
              placeholder="Room or meeting link (optional)"
              className="w-full bg-canvas border border-border/70 rounded-lg pl-8 pr-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-primary text-xs"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border-color)] p-3 space-y-2">
        <h4 className="font-semibold text-[var(--text-primary)]">Invite Attendees</h4>
        <p className="text-[var(--text-secondary)]">
          Only selected employee emails explicitly allowlisted in the server environment will receive invitations.
        </p>
        <AttendeeSelector spec={spec} />
      </div>
      <p className="text-[var(--text-secondary)]">
        Date and time use the server-configured calendar timezone (Asia/Kolkata by default).
      </p>

      {error && <p role="alert" className="text-coral">{error}</p>}
      <button
        type="button"
        onClick={() => void handleConfirm()}
        disabled={isSubmitting || !title.trim() || !date || selectedAttendeeIds.length === 0}
        className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-glow-violet transition-all flex items-center justify-center gap-2 mt-2"
      >
        <CheckCircle2 className="w-4 h-4" />
        {isSubmitting ? 'Creating calendar event…' : 'Create Google Calendar event and send invitations'}
      </button>
    </div>
  );
};
