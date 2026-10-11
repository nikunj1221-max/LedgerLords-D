import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, Filter, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface Task {
  id: string;
  projectId: string;
  title: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: string;
  assigneeName: string;
  dueDate: string;
  blockedBy: string | null;
  clientName: string;
  hoursEstimated: number;
}

export const OverdueTasksTable: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate'>('priority');
  const { executeMockAction } = useWorkspaceStore();

  const configPriority = spec.config?.filterPriority;

  useEffect(() => {
    // If the plan specified a refinement filter (e.g. Test 7: 'Critical,High')
    if (configPriority && configPriority !== 'all') {
      setFilterPriority('high_critical');
    }
  }, [configPriority]);

  useEffect(() => {
    axios
      .get('/api/data/tasks?isOverdue=true')
      .then(res => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleMarkComplete = async (taskId: string) => {
    await executeMockAction('mark_task_complete', { taskId });
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: 'Completed' } : t))
    );
  };

  const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };

  const filteredTasks = tasks
    .filter(t => {
      if (filterPriority === 'critical') return t.priority === 'Critical';
      if (filterPriority === 'high_critical') return t.priority === 'Critical' || t.priority === 'High';
      if (filterPriority === 'blocked') return !!t.blockedBy;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.dueDate.localeCompare(b.dueDate);
    });

  if (loading) {
    return <div className="text-xs text-gray-500 py-8 text-center animate-pulse">Loading overdue tasks...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Filters and sorting */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-canvas/80 p-1.5 rounded-lg border border-border/60">
          <Filter className="w-3.5 h-3.5 text-gray-500 ml-1" />
          <button
            onClick={() => setFilterPriority('all')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterPriority === 'all' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            All Overdue ({tasks.length})
          </button>
          <button
            onClick={() => setFilterPriority('critical')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterPriority === 'critical' ? 'bg-coral text-white shadow-sm' : 'text-gray-400 hover:text-coral'
            }`}
          >
            Critical Only
          </button>
          <button
            onClick={() => setFilterPriority('high_critical')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterPriority === 'high_critical' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-400 hover:text-amber-400'
            }`}
          >
            High & Critical
          </button>
          <button
            onClick={() => setFilterPriority('blocked')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              filterPriority === 'blocked' ? 'bg-plum-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Blocked
          </button>
        </div>

        <button
          onClick={() => setSortBy(sortBy === 'priority' ? 'dueDate' : 'priority')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas border border-border/60 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort: <strong className="text-white">{sortBy === 'priority' ? 'Priority First' : 'Due Date'}</strong></span>
        </button>
      </div>

      {/* Interactive Table */}
      <div className="overflow-x-auto rounded-lg border border-border/50 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-plum-900/60 border-b border-border/60 text-gray-400 text-[11px] uppercase tracking-wide">
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Task Title & Project</th>
              <th className="py-2.5 px-3">Assignee</th>
              <th className="py-2.5 px-3">Due Date</th>
              <th className="py-2.5 px-3">Blocker / Dependency</th>
              <th className="py-2.5 px-3 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 bg-card/60">
            {filteredTasks.map(t => {
              const isCompleted = t.status === 'Completed';
              const isCritical = t.priority === 'Critical';

              return (
                <tr
                  key={t.id}
                  className={`hover:bg-plum-800/30 transition-colors ${
                    isCompleted ? 'opacity-50 line-through bg-black/20' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        isCritical
                          ? 'bg-coral/20 text-coral border border-coral/30'
                          : t.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {isCritical && <AlertTriangle className="w-3 h-3" />}
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-white">{t.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                      <span className="text-teal-300 font-mono">{t.projectId}</span>
                      <span>•</span>
                      <span>{t.clientName}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-gray-200 font-medium">
                    {t.assigneeName}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-coral font-medium flex items-center gap-1 mt-2.5">
                    <Clock className="w-3 h-3" />
                    {t.dueDate}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {t.blockedBy ? (
                      <span className="px-1.5 py-0.5 rounded bg-coral/20 text-coral border border-coral/30 text-[10px] font-mono">
                        Blocked by {t.blockedBy}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[11px]">None</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    {isCompleted ? (
                      <span className="text-mint font-medium text-xs flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkComplete(t.id)}
                        className="px-2.5 py-1 rounded bg-primary/20 hover:bg-mint hover:text-gray-900 text-primary hover:border-mint border border-primary/30 text-xs font-medium transition-all inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Mark Done
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
