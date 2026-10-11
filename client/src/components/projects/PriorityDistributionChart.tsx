import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ComponentSpec } from '../../types/workspace';

export const PriorityDistributionChart: React.FC<{ spec: ComponentSpec }> = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get('/api/data/tasks?isOverdue=true')
      .then(res => {
        const tasks = res.data;
        const counts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        tasks.forEach((t: any) => {
          if (counts[t.priority] !== undefined) counts[t.priority]++;
        });

        const chartData = [
          { name: 'Critical', value: counts.Critical, color: '#ff6363' },
          { name: 'High', value: counts.High, color: '#f59e0b' },
          { name: 'Medium', value: counts.Medium, color: '#8b5cf6' },
          { name: 'Low', value: counts.Low, color: '#14b8a6' }
        ].filter(d => d.value > 0);

        setData(chartData);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-3">
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0];
                  return (
                    <div className="bg-canvas border border-border p-2 rounded text-xs shadow-lg">
                      <span className="font-semibold text-white">{d.name}: </span>
                      <span className="font-bold text-teal-300">{d.value} overdue tasks</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              innerRadius={36}
              outerRadius={60}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5 p-1.5 rounded bg-plum-900/40 border border-border/40">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-gray-300">{d.name}:</span>
            <strong className="text-white ml-auto">{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};
