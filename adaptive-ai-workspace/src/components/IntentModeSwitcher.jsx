import React from 'react';
import { Compass, GitMerge, CheckSquare } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

export default function IntentModeSwitcher() {
  const { workspace, setIntentMode } = useWorkspace();
  const currentMode = workspace?.intentMode || 'explore';

  const modes = [
    {
      id: 'explore',
      label: 'Explore',
      desc: 'Understand situation, data, insights & risks',
      icon: Compass,
    },
    {
      id: 'decide',
      label: 'Decide',
      desc: 'Compare alternatives, scenarios & trade-offs',
      icon: GitMerge,
    },
    {
      id: 'execute',
      label: 'Execute',
      desc: 'Drive action plans, task lists & milestones',
      icon: CheckSquare,
    }
  ];

  return (
    <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
      {modes.map(m => {
        const Icon = m.icon;
        const isActive = currentMode === m.id;

        return (
          <button
            key={m.id}
            onClick={() => setIntentMode(m.id)}
            title={m.desc}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
