import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Target, Calendar, User, DollarSign } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface Project {
  id: string;
  name: string;
  code: string;
  clientName: string;
  status: string;
  priority: string;
  progress: number;
  ownerName: string;
  targetDate: string;
  budget: string;
  description: string;
}

export const ProjectProgressCard: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const targetProjectId = spec.config?.projectId;

  useEffect(() => {
    axios
      .get('/api/data/projects')
      .then(res => {
        let projs = res.data;
        if (targetProjectId) {
          projs = projs.filter((p: Project) => p.id === targetProjectId);
        }
        setProjects(projs.slice(0, 4));
      })
      .catch(console.error);
  }, [targetProjectId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-mint/20 text-mint border-mint/30';
      case 'At Risk':
        return 'bg-coral/20 text-coral border-coral/30';
      case 'Delayed':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <div className="space-y-3">
      {projects.map(proj => (
        <div
          key={proj.id}
          className="p-3.5 rounded-xl bg-plum-900/40 border border-border/60 space-y-2.5 text-xs hover:border-primary/40 transition-colors"
        >
          <div className="flex flex-wrap items-center justify-between gap-1">
            <div>
              <span className="font-semibold text-white text-sm">{proj.name}</span>
              <span className="text-[11px] text-gray-400 ml-2 font-mono">({proj.code})</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusColor(proj.status)}`}>
              {proj.status}
            </span>
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed">{proj.description}</p>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-gray-400">Completion Velocity:</span>
              <strong className="text-teal-300">{proj.progress}%</strong>
            </div>
            <div className="w-full h-2 rounded-full bg-canvas overflow-hidden border border-border/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  proj.progress > 75
                    ? 'bg-project-gradient'
                    : proj.progress > 40
                    ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                    : 'bg-coral'
                }`}
                style={{
                  width: `${proj.progress}%`,
                  ...(proj.progress > 75
                    ? { background: 'linear-gradient(135deg, #fc5602 0%, #ffb703 100%)' }
                    : {})
                }}
              />
            </div>
          </div>

          {/* Metadata chips */}
          <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-gray-500" />
              Owner: <strong className="text-gray-300">{proj.ownerName}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-gray-500" />
              Target: <strong className="text-amber-300">{proj.targetDate}</strong>
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-gray-500" />
              Budget: {proj.budget}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
