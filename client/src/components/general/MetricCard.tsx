import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface MetricCardProps {
  spec: ComponentSpec;
}

export const MetricCard: React.FC<MetricCardProps> = ({ spec }) => {
  const config = spec.config || {};
  const value = config.value || '—';
  const change = config.change || '';
  const trend = config.trend || 'neutral';
  const subtitle = config.subtitle || spec.explanation;

  const isUp = trend === 'up';
  const isDown = trend === 'down';

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="text-3xl font-bold tracking-tight text-white mb-1.5">{value}</div>
        <div className="text-xs text-gray-400 line-clamp-2">{subtitle}</div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isDown && (spec.title.includes('Drop') || spec.title.includes('DAU') || spec.title.includes('Health'))
                ? 'bg-coral/20 text-coral border border-coral/30'
                : isUp && spec.title.includes('Error')
                ? 'bg-coral/20 text-coral border border-coral/30'
                : isUp
                ? 'bg-mint/20 text-mint border border-mint/30'
                : 'bg-amber/20 text-amber border border-amber/30'
            }`}
          >
            {isUp && <TrendingUp className="w-3 h-3" />}
            {isDown && <TrendingDown className="w-3 h-3" />}
            {!isUp && !isDown && <Minus className="w-3 h-3" />}
            {change}
          </span>
          <span className="text-[11px] text-gray-500">vs target</span>
        </div>
      )}
    </div>
  );
};
