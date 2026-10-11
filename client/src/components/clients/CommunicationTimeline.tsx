import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, MessageSquare, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface Communication {
  id: string;
  type: string;
  direction: string;
  sender: string;
  recipient: string;
  date: string;
  subject: string;
  preview: string;
  sentiment: string;
  tags: string[];
}

export const CommunicationTimeline: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const clientId = spec.config?.clientId;
  const [comms, setComms] = useState<Communication[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>('comm-1');

  useEffect(() => {
    const query = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
    axios
      .get(`/api/data/communications${query}`)
      .then(res => setComms(res.data.slice(0, 6)))
      .catch(console.error);
  }, [clientId]);

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'Concerned':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-coral/20 text-coral border border-coral/30">Concerned</span>;
      case 'Escalated':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-coral/30 text-white font-bold border border-coral">Escalated</span>;
      case 'Delighted':
      case 'Positive':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-mint/20 text-mint border border-mint/30">Positive</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-300">Neutral</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('Email')) return <Mail className="w-3.5 h-3.5 text-primary" />;
    if (type.includes('Slack') || type.includes('Message')) return <MessageSquare className="w-3.5 h-3.5 text-teal" />;
    return <FileText className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <div className="space-y-3">
      {comms.map(item => {
        const isExpanded = expandedId === item.id;

        return (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-plum-900/40 border border-border/60 hover:border-border transition-all"
          >
            <div
              className="flex items-start justify-between gap-2 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 p-1 rounded bg-canvas border border-border/80">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-xs">{item.subject}</span>
                    {getSentimentBadge(item.sentiment)}
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    From: <strong className="text-gray-300">{item.sender}</strong> → {item.recipient}
                  </div>
                </div>
              </div>

              <button className="text-gray-400 hover:text-white p-1">
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-border/40 text-xs text-gray-300 leading-relaxed bg-canvas/40 p-2.5 rounded-lg">
                <p>{item.preview}</p>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  {item.tags.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-gray-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
