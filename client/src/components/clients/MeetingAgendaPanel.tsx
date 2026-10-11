import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, Calendar, Users, CheckCircle, Video } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  timeZone?: string;
  status: string;
  location: string;
  hostName: string;
  participants: Array<{ name: string; email: string; role: string; status: string }>;
  agenda: Array<{ time: string; item: string }>;
  briefingSummary?: string;
}

export const MeetingAgendaPanel: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const meetingId = spec.config?.meetingId || 'meet-1';
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const { executeMockAction } = useWorkspaceStore();

  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/data/meetings')
      .then(res => {
        const found = res.data.find((m: Meeting) => m.id === meetingId);
        setMeeting(found ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [meetingId]);

  if (loading) {
    return <div className="text-xs text-gray-400 py-4">Loading scheduled meeting details...</div>;
  }

  if (!meeting) {
    return <div className="text-xs text-gray-400 py-4">No matching meeting was found.</div>;
  }

  const displayTimeZone = meeting.timeZone || 'UTC';
  const isLocalDateTime = (value: string) =>
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) && !/(Z|[+-]\d{2}:\d{2})$/i.test(value);
  const displayDate = (value: string) => {
    if (isLocalDateTime(value)) {
      const [year, month, day] = value.slice(0, 10).split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      });
    }
    return new Date(value).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: displayTimeZone,
    });
  };
  const displayTime = (value: string) => {
    if (isLocalDateTime(value)) {
      const [hour, minute] = value.slice(11, 16).split(':').map(Number);
      return new Date(Date.UTC(2000, 0, 1, hour, minute)).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC',
      });
    }
    return new Date(value).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: displayTimeZone,
    });
  };
  const displayDateLabel = displayDate(meeting.startTime);
  const durationMinutes = Math.round(
    (new Date(meeting.endTime).getTime() - new Date(meeting.startTime).getTime()) / 60_000
  );

  return (
    <div className="space-y-4">
      {/* Time & Location Header */}
      <div className="p-3 rounded-lg bg-plum-900/40 border border-primary/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-white">
            {displayDateLabel}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs font-medium text-teal-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {displayTime(meeting.startTime)} – {displayTime(meeting.endTime)} {displayTimeZone} ({durationMinutes} min)
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-300">
          <Video className="w-3.5 h-3.5 text-primary" />
          <span className="truncate max-w-[200px]">{meeting.location}</span>
        </div>
      </div>

      {/* Structured Agenda Schedule */}
      <div>
        <div className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-teal" />
          Agreed Meeting Agenda Schedule
        </div>
        <div className="space-y-2">
          {meeting.agenda.map((slot, index) => (
            <div
              key={index}
              className="p-2.5 rounded-lg bg-canvas/70 border border-border/50 flex items-start gap-3 hover:border-primary/40 transition-colors"
            >
              <div className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[11px] font-mono font-medium shrink-0">
                {slot.time}
              </div>
              <div className="text-xs text-gray-200 leading-snug flex-1">{slot.item}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Participants */}
      <div>
        <div className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-coral" />
          Confirmed Attendees ({meeting.participants.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {meeting.participants.map((p, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-plum-900/30 border border-border/40"
            >
              <div className="truncate mr-2">
                <div className="font-medium text-white truncate">{p.name}</div>
                <div className="text-[11px] text-gray-400 truncate">{p.role}</div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-mint/20 text-mint border border-mint/30 flex items-center gap-0.5 shrink-0">
                <CheckCircle className="w-2.5 h-2.5" />
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Quick Action */}
      <button
        onClick={() => executeMockAction('confirm_agenda', { meetingId: meeting.id })}
        className="w-full py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        Confirm Agenda Readout with Account Team
      </button>
    </div>
  );
};
