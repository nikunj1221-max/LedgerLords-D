import React from 'react';
import { FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

export const MeetingNotesPanel: React.FC<{ spec: ComponentSpec }> = () => {
  return (
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-plum-900/40 border border-border/60 text-xs">
        <div className="flex items-center justify-between text-gray-400 mb-2">
          <span className="font-semibold text-gray-200 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            Sept 24 Executive Sync Summary
          </span>
          <span className="text-[11px] font-mono">Recorded by Marcus Vance</span>
        </div>
        <p className="text-gray-300 leading-relaxed">
          Acme leadership (Sarah Jenkins & VP Tech) evaluated Q3 performance and verbally committed to expanding NexusFlow into 14 international distribution centers ($18k MRR upsell).
        </p>
      </div>

      <div className="space-y-2 text-xs">
        <div className="font-semibold text-gray-300">Hard Client Deliverables for Tomorrow's Review:</div>
        <div className="p-2.5 rounded-lg bg-mint/10 border border-mint/20 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-mint shrink-0 mt-0.5" />
          <div className="text-gray-300">
            <strong className="text-white">Distribution Expansion Terms:</strong> Commercial agreement ready for signature adding 350 operator licenses.
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-coral/10 border border-coral/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-coral shrink-0 mt-0.5" />
          <div className="text-gray-300">
            <strong className="text-white">Query Builder Latency Guarantee:</strong> Sarah requested concrete post-mortem on the 504 timeouts their Chicago warehouse experienced.
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-gray-300">
            <strong className="text-white">SAML SSO Attribute Sync:</strong> IT security audit sign-off due by Oct 15.
          </div>
        </div>
      </div>
    </div>
  );
};
