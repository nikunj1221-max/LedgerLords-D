import React from 'react';
import { Settings, X, Check } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

export default function PreferencesModal() {
  const {
    preferencesModalOpen,
    setPreferencesModalOpen,
    userPreferences,
    updatePreferences,
  } = useWorkspace();

  if (!preferencesModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Workspace Memory & Preferences</h3>
              <p className="text-[11px] text-slate-500">Personalize layout, density, and defaults</p>
            </div>
          </div>
          <button
            onClick={() => setPreferencesModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Density */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-800 block">Layout Density</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'comfortable', label: 'Comfortable', desc: 'Airy padding & margins' },
                { id: 'compact', label: 'Compact', desc: 'High-density information grid' },
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => updatePreferences({ density: d.id })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    userPreferences.density === d.id
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500 text-indigo-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-semibold">{d.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Default Intent Mode */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-800 block">Default Intent Mode</span>
            <div className="grid grid-cols-3 gap-2">
              {['explore', 'decide', 'execute'].map(m => (
                <button
                  key={m}
                  onClick={() => updatePreferences({ defaultIntentMode: m })}
                  className={`py-2 px-3 rounded-lg border text-center capitalize transition-all ${
                    userPreferences.defaultIntentMode === m
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={() => setPreferencesModalOpen(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
