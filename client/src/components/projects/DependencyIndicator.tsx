import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowRight, AlertTriangle, Link2 } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

export const DependencyIndicator: React.FC<{ spec: ComponentSpec }> = () => {
  const [blockedTasks, setBlockedTasks] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get('/api/data/tasks')
      .then(res => {
        const blocked = res.data.filter((t: any) => !!t.blockedBy);
        setBlockedTasks(blocked.slice(0, 4));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-2.5">
      <div className="text-xs text-gray-400 mb-2">
        Active task dependency bottlenecks preventing downstream deliverables:
      </div>

      {blockedTasks.map(task => (
        <div
          key={task.id}
          className="p-3 rounded-xl bg-plum-900/30 border border-coral/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-coral shrink-0" />
            <div>
              <div className="font-semibold text-white">{task.title}</div>
              <div className="text-[11px] text-gray-400">{task.clientName} • Assignee: {task.assigneeName}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-canvas border border-border text-[11px] shrink-0 self-start sm:self-auto">
            <span className="text-coral font-medium">Blocked</span>
            <ArrowRight className="w-3 h-3 text-gray-500" />
            <span className="text-teal-300 font-mono font-semibold flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              {task.blockedBy}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
