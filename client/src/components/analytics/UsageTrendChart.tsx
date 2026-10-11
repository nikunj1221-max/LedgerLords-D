import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ComponentSpec } from '../../types/workspace';

export const UsageTrendChart: React.FC<{ spec: ComponentSpec }> = () => {
  const [data, setData] = useState<any[]>([]);
  const [viewMetric, setViewMetric] = useState<'dailyActiveUsers' | 'totalSessions' | 'errorRatePercent'>('dailyActiveUsers');

  useEffect(() => {
    axios
      .get('/api/data/usage-metrics?days=90')
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);

  if (data.length === 0) {
    return <div className="text-xs text-gray-500 py-12 text-center animate-pulse">Loading 90-day telemetry...</div>;
  }

  // Format date for chart labels
  const formattedData = data.map(d => ({
    ...d,
    displayDate: typeof d.date === 'string' ? d.date.slice(5) : String(d.date ?? '')
  }));
  const firstValue = Number(data[0]?.[viewMetric]) || 0;
  const latestValue = Number(data[data.length - 1]?.[viewMetric]) || 0;
  const periodChange = firstValue
    ? ((latestValue - firstValue) / firstValue) * 100
    : 0;
  const changeColor = periodChange < 0 ? 'text-coral' : 'text-mint';

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-canvas border border-border p-3 rounded-lg shadow-xl text-xs space-y-1">
          <div className="font-semibold text-white">{item.date || 'Unknown date'}</div>
          <div className="text-primary font-bold">
            DAU: {(Number(item.dailyActiveUsers) || 0).toLocaleString()}
          </div>
          <div className="text-teal-300">Sessions: {(Number(item.totalSessions) || 0).toLocaleString()}</div>
          <div className="text-coral">
            Error Rate: {item.errorRatePercent ?? '—'}%
          </div>
          <div className="text-gray-400 text-[11px] pt-1 border-t border-border/50">
            {item.featureBreakdown?.queryBuilder !== undefined
              ? `Query Builder Users: ${Number(item.featureBreakdown.queryBuilder).toLocaleString()}`
              : 'Feature breakdown not provided'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Metric Selector & Event Callout */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-canvas/80 p-1 rounded-lg border border-border/60 text-xs">
          <button
            onClick={() => setViewMetric('dailyActiveUsers')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMetric === 'dailyActiveUsers'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Daily Active Users
          </button>
          <button
            onClick={() => setViewMetric('totalSessions')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMetric === 'totalSessions'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Total Sessions
          </button>
          <button
            onClick={() => setViewMetric('errorRatePercent')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMetric === 'errorRatePercent'
                ? 'bg-coral text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            504 Error Rate %
          </button>
        </div>

        <div className="text-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-coral animate-ping" />
          <span className={`${changeColor} font-medium`}>
            Period change: {periodChange > 0 ? '+' : ''}{periodChange.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff6363" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#ff6363" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="displayDate"
              stroke="#524b75"
              fontSize={11}
              tickLine={false}
              interval={12}
            />
            <YAxis
              stroke="#524b75"
              fontSize={11}
              tickLine={false}
              tickFormatter={(val: number) => (val > 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)}
            />
            <Tooltip content={customTooltip} />
            <Area
              type="monotone"
              dataKey={viewMetric}
              stroke={viewMetric === 'errorRatePercent' ? '#ff6363' : '#8b5cf6'}
              strokeWidth={2.5}
              fillOpacity={1}
              fill={viewMetric === 'errorRatePercent' ? 'url(#errorGradient)' : 'url(#dauGradient)'}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="p-2.5 rounded-lg bg-plum-900/30 border border-border/40 text-[11px] text-gray-400 flex items-center justify-between">
        <span>First value: <strong>{firstValue.toLocaleString()}</strong></span>
        <span className={`${changeColor} font-medium`}>Latest: <strong>{latestValue.toLocaleString()}</strong></span>
        <span>Data points: <strong>{data.length}</strong></span>
      </div>
    </div>
  );
};
