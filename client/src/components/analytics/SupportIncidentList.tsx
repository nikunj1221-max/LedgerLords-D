import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Search, Filter } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface SupportIncident {
  id: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  title: string;
  priority: string;
  status: string;
  createdAt: string;
  featureImpacted: string;
  reporter: string;
  assigneeName: string;
  description: string;
}

export const SupportIncidentList: React.FC<{ spec: ComponentSpec }> = () => {
  const [incidents, setIncidents] = useState<SupportIncident[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const { incidentStatusById, setIncidentStatus } = useWorkspaceStore();

  useEffect(() => {
    axios
      .get('/api/data/support-incidents')
      .then(res => setIncidents(res.data))
      .catch(console.error);
  }, []);

  const handleStatusChange = async (incident: SupportIncident) => {
    const currentStatus = incidentStatusById[incident.id]
      ?? incidentStatusById[incident.ticketNumber]
      ?? incident.status;
    await setIncidentStatus(
      incident.id,
      currentStatus,
      currentStatus.toLowerCase() === 'resolved' ? 'Investigating' : 'Resolved'
    );
  };

  const filtered = incidents.filter(i => {
    if (priorityFilter !== 'all' && i.priority.toLowerCase() !== priorityFilter.toLowerCase()) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase()) && !i.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-canvas p-1.5 rounded-lg border border-border/60">
          <Filter className="w-3.5 h-3.5 text-gray-500 ml-1" />
          <button
            onClick={() => setPriorityFilter('all')}
            className={`px-2.5 py-0.5 rounded font-medium ${
              priorityFilter === 'all' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            All ({incidents.length})
          </button>
          <button
            onClick={() => setPriorityFilter('critical')}
            className={`px-2.5 py-0.5 rounded font-medium ${
              priorityFilter === 'critical' ? 'bg-coral text-white' : 'text-gray-400 hover:text-coral'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setPriorityFilter('high')}
            className={`px-2.5 py-0.5 rounded font-medium ${
              priorityFilter === 'high' ? 'bg-amber-500 text-white' : 'text-gray-400 hover:text-amber-400'
            }`}
          >
            High
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search tickets or clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-canvas border border-border/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Incidents Table / List */}
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-plum-900/60 border-b border-border/60 text-gray-400 text-[11px] uppercase tracking-wide">
              <th className="py-2.5 px-3">Ticket</th>
              <th className="py-2.5 px-3">Account</th>
              <th className="py-2.5 px-3">Summary</th>
              <th className="py-2.5 px-3">Feature Impacted</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 bg-card/60">
            {filtered.slice(0, 7).map(item => {
              const status = incidentStatusById[item.id]
                ?? incidentStatusById[item.ticketNumber]
                ?? item.status;
              const isResolved = status.toLowerCase() === 'resolved';
              return (
                <tr key={item.id} className="hover:bg-plum-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-gray-200">{item.ticketNumber}</td>
                  <td className="py-2.5 px-3 font-medium text-white whitespace-nowrap">{item.clientName}</td>
                  <td className="py-2.5 px-3 text-gray-300 max-w-[280px] truncate" title={item.description}>
                    {item.title}
                  </td>
                  <td className="py-2.5 px-3 text-teal-300 font-medium whitespace-nowrap">{item.featureImpacted}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.priority === 'Critical'
                          ? 'bg-coral/20 text-coral border border-coral/30'
                          : item.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-medium ${
                        isResolved ? 'text-mint' : 'text-gray-300'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => void handleStatusChange(item)}
                      className="px-2 py-1 rounded bg-white/10 hover:bg-mint hover:text-gray-900 text-gray-200 text-[11px] transition-colors"
                    >
                      {isResolved ? 'Reopen' : 'Resolve'}
                    </button>
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
