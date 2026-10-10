import React, { useState } from 'react';
import { Calendar, Clock, Video, CheckCircle2, Sparkles } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const MeetingScheduler: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const config = spec.config || {};
  const [title, setTitle] = useState(config.defaultTitle || 'NexusFlow 3.0 Launch Readiness & Go/No-Go Decision');
  const [date, setDate] = useState(config.defaultDate || '2026-10-11');
  const [time, setTime] = useState('14:00 - 15:00');
  const [duration, setDuration] = useState(config.defaultDuration || '60');
  const [location, setLocation] = useState('NexusFlow Boardroom & Virtual Video');
  const [confirmedMeeting, setConfirmedMeeting] = useState<any | null>(null);

  const { executeMockAction } = useWorkspaceStore();

  const handleConfirm = async () => {
    const payload = {
      title,
      date,
      time,
      duration: `${duration}m`,
      location,
      relatedProject: config.relatedProject || 'NexusFlow 3.0 Platform Launch',
      attendees: ['Elena Rostova', 'Marcus Vance', 'Alex Rivera', 'Chloe Chen', 'Daniel Brooks']
    };

    await executeMockAction('confirm_mock_meeting', payload);

    setConfirmedMeeting({
      ...payload,
      id: `meet-mock-${Date.now()}`,
      status: 'Confirmed'
    });
  };

  if (confirmedMeeting) {
    return (
      <div className="p-4 rounded-xl bg-mint/10 border border-mint/30 text-xs space-y-3">
        <div className="flex items-center gap-2 text-mint font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5 text-mint" />
          Mock Meeting Successfully Scheduled!
        </div>
        <p className="text-gray-300">
          Created a local mock meeting record in application state. (No actual external calendar invite was sent.)
        </p>
        <div className="p-3 rounded-lg bg-canvas border border-border/60 space-y-1.5 font-mono text-[11px]">
          <div><strong className="text-white">Title:</strong> {confirmedMeeting.title}</div>
          <div><strong className="text-white">Date & Time:</strong> {confirmedMeeting.date} ({confirmedMeeting.time})</div>
          <div><strong className="text-white">Attendees:</strong> Elena Rostova, Marcus Vance, Alex Rivera, Daniel Brooks</div>
          <div><strong className="text-white">Location:</strong> {confirmedMeeting.location}</div>
        </div>
        <button
          onClick={() => setConfirmedMeeting(null)}
          className="text-xs text-primary hover:underline font-medium"
        >
          Edit / Schedule another session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs">
      {/* Title */}
      <div>
        <label className="block text-gray-400 font-medium mb-1 flex items-center justify-between">
          <span>Meeting Topic:</span>
          <span className="text-primary text-[10px] flex items-center gap-1 font-mono">
            <Sparkles className="w-3 h-3" />
            Synthesized from Launch Context
          </span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-canvas border border-border/70 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-primary text-xs"
        />
      </div>

      {/* Date & Time Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 font-medium mb-1">Target Date:</label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-canvas border border-border/70 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-primary text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 font-medium mb-1">Recommended Time Window:</label>
          <div className="relative">
            <Clock className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <select
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full bg-canvas border border-border/70 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-primary text-xs"
            >
              <option value="11:00 - 12:00">11:00 AM – 12:00 PM (Partial overlap)</option>
              <option value="13:00 - 14:00">01:00 PM – 02:00 PM (1 conflict)</option>
              <option value="14:00 - 15:00">02:00 PM – 03:00 PM (★ Recommended: All Free)</option>
              <option value="15:00 - 16:00">03:00 PM – 04:00 PM (Marcus conflict)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Duration & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 font-medium mb-1">Duration:</label>
          <select
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-full bg-canvas border border-border/70 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary text-xs"
          >
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes (Standard Review)</option>
            <option value="90">90 minutes</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-400 font-medium mb-1">Location / Room:</label>
          <div className="relative">
            <Video className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-canvas border border-border/70 rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-primary text-xs"
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleConfirm}
        className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow-violet transition-all flex items-center justify-center gap-2 mt-2"
      >
        <CheckCircle2 className="w-4 h-4" />
        Confirm and Create Mock Meeting Record
      </button>
    </div>
  );
};
