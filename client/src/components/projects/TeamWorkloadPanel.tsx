import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, AlertCircle } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

export const TeamWorkloadPanel: React.FC<{ spec: ComponentSpec }> = () => {
  const [workloads, setWorkloads] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get('/api/data/tasks?isOverdue=true')
      .then(res => {
        const tasks = res.data;
        const map: Record<string, { name: string; count: number; criticalCount: number }> = {};
        tasks.forEach((t: any) => {
          if (!map[t.assigneeName]) {
            map[t.assigneeName] = { name: t.assigneeName, count: 0, criticalCount: 0 };
          }
          map[t.assigneeName].count++;
          if (t.priority === 'Critical') map[t.assigneeName].criticalCount++;
        });
        const list = Object.values(map).sort((a, b) => b.count - a.count);
        setWorkloads(list.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-2.5">
      {workloads.map(w => (
        <div
          key={w.name}
          className="p-2.5 rounded-lg bg-plum-900/40 border border-border/60 flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-full bg-primary/20 text-primary">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-medium text-white">{w.name}</div>
              <div className="text-[10px] text-gray-400">
                {w.criticalCount > 0 ? (
                  <span className="text-coral flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" />
                    {w.criticalCount} critical blockers
                  </span>
                ) : (
                  'Active assignments'
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-bold text-coral">{w.count}</span>
            <div className="text-[10px] text-gray-500">overdue</div>
          </div>
        </div>
      ))}
    </div>
  );
};
