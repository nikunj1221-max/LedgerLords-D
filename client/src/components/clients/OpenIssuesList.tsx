import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface Incident {
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
}

export const OpenIssuesList: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const { executeMockAction } = useWorkspaceStore();

  const clientId = spec.config?.clientId;
  const filterStatus = spec.config?.filterStatus;

  useEffect(() => {
    let url = '/api/data/support-incidents';
    const params = new URLSearchParams();
    if (clientId) params.append('clientId', clientId);
    if (filterStatus === 'unresolved') params.append('status', 'Investigating');
    if (params.toString()) url += `?${params.toString()}`;

    axios
      .get(url)
      .then(res => {
        let items = res.data;
        if (clientId) {
          items = items.filter((i: Incident) => i.clientId === clientId);
        }
        setIncidents(items.slice(0, 6));
      })
      .catch(console.error);
  }, [clientId, filterStatus]);

  const handleResolve = async (incidentId: string) => {
    await executeMockAction('resolve_incident', { incidentId });
    setIncidents(prev =>
      prev.map(i => (i.id === incidentId || i.ticketNumber === incidentId ? { ...i, status: 'Resolved' } : i))
    );
  };

  if (incidents.length === 0) {
    return <div className="text-xs text-gray-400 py-4 text-center">No open issues found for this account.</div>;
  }

  return (
    <div className="space-y-2.5">
      {incidents.map(inc => {
        const isResolved = inc.status === 'Resolved';
        const isCritical = inc.priority === 'Critical';

        return (
          <div
            key={inc.id}
            className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
              isResolved
                ? 'bg-plum-900/20 border-border/40 opacity-70'
                : isCritical
                ? 'bg-coral/10 border-coral/30'
                : 'bg-plum-900/40 border-border/60'
            }`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-200">{inc.ticketNumber}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    isCritical
                      ? 'bg-coral/20 text-coral border border-coral/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {inc.priority}
                </span>
                <span className="text-[11px] text-gray-400">({inc.clientName})</span>
              </div>
              <h5 className="font-medium text-white line-clamp-1">{inc.title}</h5>
              <div className="text-[11px] text-gray-400 flex items-center gap-2">
                <span>Impacted: <strong className="text-teal-300">{inc.featureImpacted}</strong></span>
                <span>•</span>
                <span>Assignee: {inc.assigneeName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isResolved ? (
                <span className="px-2 py-1 rounded bg-mint/20 text-mint text-xs flex items-center gap-1 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Resolved
                </span>
              ) : (
                <button
                  onClick={() => handleResolve(inc.id)}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-mint hover:text-gray-900 text-gray-200 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
