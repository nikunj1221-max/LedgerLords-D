import React from 'react';
import {
  Sparkles, Plus, Home, FolderKanban, History, Settings,
  CheckSquare, Calendar, ChevronRight, Sliders, PlayCircle
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

export default function Sidebar({ isOpen, onClose }) {
  const {
    workspace,
    generateWorkspace,
    resetWorkspace,
    setHistoryDrawerOpen,
    setPreferencesModalOpen,
  } = useWorkspace();

  const presets = [
    {
      title: 'Project Launch Kickoff',
      prompt: 'I want to launch a new project, so help me prepare for the kickoff meeting.',
      desc: 'Master Primary Demo',
    },
    {
      title: 'Sales Decline Analysis',
      prompt: 'Help me understand why sales are declining.',
      desc: 'Scenario A: Analytical KPIs',
    },
    {
      title: 'Project Schedule Recovery',
      prompt: 'Our project is behind schedule. Help us recover.',
      desc: 'Scenario B: Critical Path',
    }
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 md:static md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Brand Zone */}
        <div className="h-14 border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              A
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">
              Adaptive Workspace
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-slate-600 p-1"
          >
            ✕
          </button>
        </div>

        {/* Primary Action */}
        <div className="p-3">
          <button
            onClick={() => resetWorkspace()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-2 space-y-1 text-xs font-medium text-slate-600">
          <button
            onClick={() => resetWorkspace()}
            className="w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setHistoryDrawerOpen(true)}
            className="w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>Workspace History</span>
          </button>
          <button
            onClick={() => setPreferencesModalOpen(true)}
            className="w-full flex items-center gap-2.5 py-1.5 px-2.5 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & Memory</span>
          </button>
        </div>

        {/* Preset Starters */}
        <div className="px-3 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 block mb-2">
            Demo Workspaces
          </span>
          <div className="space-y-1.5">
            {presets.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  generateWorkspace(p.prompt);
                  onClose();
                }}
                className="w-full p-2 text-left rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/40 text-xs transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                    {p.title}
                  </span>
                  <PlayCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom user profile & status */}
      <div className="p-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between bg-slate-50/50">
        <div className="truncate">
          <p className="font-semibold text-slate-700 truncate">HACKWAVE 3.0</p>
          <p className="text-[10px] text-slate-400">Deterministic Engine</p>
        </div>
        <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">
          v1.0
        </span>
      </div>
    </aside>
  );
}
