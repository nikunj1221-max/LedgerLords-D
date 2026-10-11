import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ComponentSpec } from '../../types/workspace';

interface FeatureItem {
  id: string;
  name: string;
  key: string;
  adoptionRatePercent: number;
  previousAdoptionRatePercent: number;
  weeklyGrowthPercent: number;
  status: string;
  monthlyActiveUsers: number;
}

export const FeatureAdoptionChart: React.FC<{ spec: ComponentSpec }> = () => {
  const [features, setFeatures] = useState<FeatureItem[]>([]);

  useEffect(() => {
    axios
      .get('/api/data/feature-adoption')
      .then(res => setFeatures(res.data))
      .catch(console.error);
  }, []);

  if (features.length === 0) {
    return <div className="text-xs text-gray-500 py-6 text-center">Loading feature metrics...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={features} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
            <XAxis
              dataKey="name"
              stroke="#524b75"
              fontSize={10}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis stroke="#524b75" fontSize={11} tickFormatter={v => `${v}%`} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const f = payload[0].payload as FeatureItem;
                  return (
                    <div className="bg-canvas border border-border p-3 rounded-lg shadow-xl text-xs space-y-1">
                      <div className="font-semibold text-white">{f.name}</div>
                      <div className="text-gray-300">Active Adoption: <strong className="text-white">{f.adoptionRatePercent}%</strong></div>
                      <div className="text-gray-400">Previous Week: {f.previousAdoptionRatePercent}%</div>
                      <div className={f.weeklyGrowthPercent < 0 ? 'text-coral font-bold' : 'text-mint'}>
                        Weekly Shift: {f.weeklyGrowthPercent > 0 ? '+' : ''}{f.weeklyGrowthPercent}%
                      </div>
                      <div className="text-teal-300 text-[11px]">Monthly Users: {f.monthlyActiveUsers.toLocaleString()}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="adoptionRatePercent" radius={[4, 4, 0, 0]}>
              {features.map(f => (
                <Cell
                  key={f.id}
                  fill={f.status === 'Degraded' ? '#ff6363' : f.status === 'Impacted' ? '#f59e0b' : '#14b8a6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1.5">
        {features.filter(f => f.status === 'Degraded' || f.status === 'Impacted').map(f => (
          <div
            key={f.id}
            className="p-2 rounded bg-coral/10 border border-coral/30 text-[11px] text-gray-300 flex items-center justify-between"
          >
            <span className="font-semibold text-coral">{f.name}</span>
            <span>Collapse: <strong>{f.weeklyGrowthPercent}%</strong> (Correlates with v2.8.4 optimizer)</span>
          </div>
        ))}
      </div>
    </div>
  );
};
