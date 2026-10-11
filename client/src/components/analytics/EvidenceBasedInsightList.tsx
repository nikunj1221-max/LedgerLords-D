import React from 'react';
import { Lightbulb, CheckCircle2, TrendingDown, GitBranch } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

export const EvidenceBasedInsightList: React.FC<{ spec: ComponentSpec }> = () => {
  const insights = [
    {
      id: 'ins-1',
      title: 'Direct Temporal Correlation with Release v2.8.4',
      confidence: '98% Correlation',
      detail: 'Platform DAU remained steady around 15,200 for 83 consecutive days until Oct 4 at 18:30 UTC when Release v2.8.4 deployed. Usage began declining within 4 hours.',
      evidence: 'Release record v2.8.4 + Telemetry day index 84.',
      type: 'critical'
    },
    {
      id: 'ins-2',
      title: 'Degradation Isolated Exclusively to Query Builder',
      confidence: 'High Evidence',
      detail: 'Real-Time Dashboards (+1.8%) and Autonomous Workflows (+7.0%) retained normal engagement. Only Advanced Query Builder collapsed by -52.2%.',
      evidence: 'Feature adoption records feat-query-builder vs feat-live-dashboards.',
      type: 'isolated'
    },
    {
      id: 'ins-3',
      title: 'Customer Escalation Spike (INC-1042, INC-1045)',
      confidence: 'Direct Client Feedback',
      detail: '9 enterprise accounts filed critical tickets reporting Error 504 Gateway Timeouts during multi-tenant join operations exceeding memory limits.',
      evidence: 'Support incidents logged across Acme Corp, Strata Cloud, and Apex.',
      type: 'feedback'
    }
  ];

  return (
    <div className="space-y-3">
      {insights.map(item => (
        <div
          key={item.id}
          className="p-3 rounded-xl bg-plum-900/40 border border-primary/20 hover:border-primary/40 transition-all text-xs space-y-1.5"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              {item.title}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
              {item.confidence}
            </span>
          </div>

          <p className="text-gray-300 leading-relaxed text-[11px]">{item.detail}</p>

          <div className="pt-1.5 border-t border-border/40 text-[10px] text-teal-300 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
            Evidence: {item.evidence}
          </div>
        </div>
      ))}
    </div>
  );
};
