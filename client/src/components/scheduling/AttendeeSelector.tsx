import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Check } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  department: string;
}

export const AttendeeSelector: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const appliedPreselection = useRef(false);
  const selectedIds = useWorkspaceStore(state => state.selectedAttendeeIds);
  const setSelectedIds = useWorkspaceStore(state => state.setSelectedAttendeeIds);

  useEffect(() => {
    axios
      .get<{ attendees: Employee[] }>('/api/actions/meeting-attendees')
      .then(res => {
        setEmployees(res.data.attendees);
        setError(null);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Could not load employee records.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const preselectedIds = Array.isArray(spec.config?.preselectedIds)
      ? spec.config.preselectedIds.filter((id: unknown): id is string => typeof id === 'string')
      : [];
    if (!appliedPreselection.current && selectedIds.length === 0 && preselectedIds.length > 0) {
      setSelectedIds(preselectedIds);
    }
    appliedPreselection.current = true;
  }, [selectedIds.length, setSelectedIds, spec.config?.preselectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter(selectedId => selectedId !== id)
        : [...selectedIds, id]
    );
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="text-gray-400">
        Select meeting attendees ({selectedIds.length} selected):
      </div>

      {loading && <p className="text-[var(--text-secondary)]">Loading employees…</p>}
      {error && <p role="alert" className="text-coral">{error}</p>}
      {!loading && !error && employees.length === 0 && (
        <p className="text-[var(--text-secondary)]">
          No meeting invitees are configured. Add addresses to MEETING_ALLOWED_ATTENDEES in the server environment.
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {employees.map(emp => {
          const isSelected = selectedIds.includes(emp.id);

          return (
            <button
              type="button"
              key={emp.id}
              onClick={() => toggleSelect(emp.id)}
              aria-pressed={isSelected}
              className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-primary/20 border-primary text-[var(--text-primary)] shadow-sm'
                  : 'bg-card border-[var(--border-color)] text-[var(--text-secondary)] hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {emp.avatar && (
                  <img
                    src={emp.avatar}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-border"
                  />
                )}
                <div className="truncate">
                  <div className="font-semibold text-[var(--text-primary)] truncate text-[11px]">{emp.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{emp.role}</div>
                  <div className="text-[10px] text-gray-500 truncate">{emp.email}</div>
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-primary text-white' : 'border border-gray-600'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
