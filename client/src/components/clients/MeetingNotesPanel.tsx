import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface CommunicationNote {
  id: string;
  type: string;
  sender: string;
  date: string;
  subject: string;
  preview: string;
}

export const MeetingNotesPanel: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const [notes, setNotes] = useState<CommunicationNote[]>([]);

  useEffect(() => {
    const clientId = spec.config?.clientId;
    const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
    axios
      .get(`/api/data/communications${query}`)
      .then(response => {
        const records = response.data as CommunicationNote[];
        const meetingNotes = records.filter(record =>
          /note|meeting/i.test(`${record.type} ${record.subject}`)
        );
        setNotes((meetingNotes.length ? meetingNotes : records).slice(0, 3));
      })
      .catch(console.error);
  }, [spec.config?.clientId]);

  if (notes.length === 0) {
    return <div className="py-4 text-xs text-gray-400">No uploaded meeting notes or communications found.</div>;
  }

  return (
    <div className="space-y-3">
      {notes.map(note => (
        <article key={note.id} className="rounded-lg border border-border/60 bg-plum-900/40 p-3 text-xs">
          <div className="mb-2 flex items-center justify-between gap-2 text-gray-400">
            <span className="flex items-center gap-1.5 font-semibold text-gray-200">
              <FileText className="h-3.5 w-3.5 text-primary" />
              {note.subject || note.type || 'Uploaded communication'}
            </span>
            <time className="shrink-0 font-mono text-[11px]">
              {note.date ? new Date(note.date).toLocaleDateString() : ''}
            </time>
          </div>
          <p className="mb-2 text-[11px] text-gray-400">{note.sender}</p>
          <p className="leading-relaxed text-gray-300">{note.preview}</p>
        </article>
      ))}
    </div>
  );
};
