import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, AlertCircle, CheckCircle2, Calendar, GitCommit } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface ActivityItem {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  actor: string;
  entityType: string;
}

export const ActivityTimeline: React.FC<{ spec: ComponentSpec }> = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/data/activities')
      .then(res => setActivities(res.data.slice(0, 8)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-xs text-gray-500 py-6 text-center animate-pulse">Loading activity stream...</div>;
  }

  const getIcon = (type: string) => {
    if (type.includes('incident')) return <AlertCircle className="w-4 h-4 text-coral" />;
    if (type.includes('task_completed')) return <CheckCircle2 className="w-4 h-4 text-mint" />;
    if (type.includes('meeting')) return <Calendar className="w-4 h-4 text-primary" />;
    if (type.includes('release')) return <GitCommit className="w-4 h-4 text-teal" />;
    return <Clock className="w-4 h-4 text-amber" />;
  };

  return (
    <div className="space-y-3">
      {activities.map(item => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-2.5 rounded-lg bg-plum-900/30 hover:bg-plum-800/40 border border-border/40 transition-colors"
        >
          <div className="mt-0.5 p-1 rounded-md bg-canvas/80 border border-border/60 shrink-0">
            {getIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-200 leading-snug">{item.description}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
              <span className="font-medium text-gray-400">{item.actor}</span>
              <span>•</span>
              <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
