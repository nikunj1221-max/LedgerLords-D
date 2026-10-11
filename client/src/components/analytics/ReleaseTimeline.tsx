import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GitCommit, AlertTriangle, CheckCircle2, User, Calendar } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface Release {
  version: string;
  title: string;
  deployedAt: string;
  deployedBy: string;
  type: string;
  impactLevel: string;
  status: string;
  affectedFeatures: string[];
  changelog: string[];
  rollbackStatus?: string;
}

export const ReleaseTimeline: React.FC<{ spec: ComponentSpec }> = () => {
  const [releases, setReleases] = useState<Release[]>([]);

  useEffect(() => {
    axios
      .get('/api/data/releases')
      .then(res => setReleases(res.data.slice(0, 4)))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-3">
      {releases.map(rel => {
        const isRegression = rel.status === 'Regression Identified';

        return (
          <div
            key={rel.version}
            className={`p-3.5 rounded-xl border text-xs transition-all ${
              isRegression
                ? 'bg-coral/10 border-coral/40 shadow-glow-coral/10'
                : 'bg-plum-900/30 border-border/50'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-white px-2 py-0.5 rounded bg-canvas border border-border">
                  {rel.version}
                </span>
                <span className="font-semibold text-gray-200">{rel.title}</span>
              </div>

              {isRegression ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-coral text-white flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Regression Trigger
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] bg-mint/20 text-mint border border-mint/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Stable
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                {new Date(rel.deployedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-gray-500" />
                {rel.deployedBy}
              </span>
            </div>

            <div className="space-y-1 text-gray-300">
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Key Changes:</div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-gray-300">
                {rel.changelog.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {rel.rollbackStatus && (
              <div className="mt-2.5 p-2 rounded bg-canvas/80 border border-coral/30 text-[11px] text-coral font-medium flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5" />
                {rel.rollbackStatus}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
