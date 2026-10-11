import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  urgency: string;
  suggestedAction: string;
  actionId: string;
}

export const RecommendationCard: React.FC<{ spec: ComponentSpec }> = () => {
  const [items, setItems] = useState<Recommendation[]>([]);
  const { submitPrompt, executeMockAction } = useWorkspaceStore();

  useEffect(() => {
    axios
      .get('/api/data/recommendations')
      .then(res => setItems(res.data.slice(0, 4)))
      .catch(console.error);
  }, []);

  const handleAction = (item: Recommendation) => {
    if (item.actionId === 'prep_acme_meeting') {
      submitPrompt('Prepare a new meeting with selected attendees.');
    } else if (item.actionId === 'investigate_usage_drop') {
      submitPrompt("Investigate why product usage dropped this week.");
    } else if (item.actionId === 'view_overdue_tasks') {
      submitPrompt("Show me the overdue project work that needs attention first.");
    } else if (item.actionId === 'schedule_launch_meeting') {
      submitPrompt("Now schedule a meeting tomorrow about the product launch.");
    } else {
      executeMockAction(item.actionId);
    }
  };

  return (
    <div className="space-y-3">
      {items.map(rec => (
        <div
          key={rec.id}
          className="p-3 rounded-xl bg-plum-900/40 border border-primary/20 hover:border-primary/50 transition-all flex flex-col justify-between gap-2"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {rec.category}
              </span>
              {rec.urgency === 'Immediate' && (
                <span className="text-[10px] font-semibold text-coral flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Immediate
                </span>
              )}
            </div>
            <h4 className="text-xs font-semibold text-white">{rec.title}</h4>
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{rec.description}</p>
          </div>

          <button
            onClick={() => handleAction(rec)}
            className="self-start mt-1 flex items-center gap-1 text-xs font-medium text-teal-300 hover:text-teal-200 hover:underline"
          >
            {rec.suggestedAction}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};
