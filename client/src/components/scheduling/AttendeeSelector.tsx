import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Check, Search, Users, UserCheck } from 'lucide-react';
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

export const AttendeeSelector: React.FC<{ spec: ComponentSpec }> = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    if (loading || error) return;

    const attendeeIds = new Set(employees.map(employee => employee.id));
    const validSelectedIds = selectedIds.filter(id => attendeeIds.has(id));
    if (validSelectedIds.length !== selectedIds.length) {
      setSelectedIds(validSelectedIds);
    }
  }, [employees, error, loading, selectedIds, setSelectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter(selectedId => selectedId !== id)
        : [...selectedIds, id]
    );
  };

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const query = search.toLowerCase();
    return employees.filter(
      emp =>
        emp.name.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.department?.toLowerCase().includes(query)
    );
  }, [employees, search]);

  return (
    <div className="space-y-3 text-xs h-full flex flex-col justify-between">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            <span className="font-semibold text-[var(--text-primary)] text-sm">Invite Attendees</span>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
            {selectedIds.filter(id => employees.some(employee => employee.id === id)).length} of {employees.length} selected
          </span>
        </div>

        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
          Select team leads and attendees who will receive Google Calendar invitations.
        </p>

        {employees.length > 4 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role or email…"
              className="w-full bg-canvas border border-border/70 rounded-lg pl-8 pr-3 py-1.5 text-[var(--text-primary)] text-xs focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        )}
      </div>

      {loading && <p className="text-[var(--text-secondary)] py-4 text-center">Loading team members…</p>}
      {error && <p role="alert" className="text-coral py-2">{error}</p>}
      {!loading && !error && employees.length === 0 && (
        <p className="text-[var(--text-secondary)] py-4 text-center">
          No meeting invitees are configured in this workspace.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
        {filteredEmployees.map(emp => {
          const isSelected = selectedIds.includes(emp.id);

          return (
            <button
              type="button"
              key={emp.id}
              onClick={() => toggleSelect(emp.id)}
              aria-pressed={isSelected}
              className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                isSelected
                  ? 'bg-primary/15 border-primary text-[var(--text-primary)] shadow-sm'
                  : 'bg-card border-[var(--border-color)] text-[var(--text-secondary)] hover:border-primary/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {emp.avatar ? (
                  <img
                    src={emp.avatar}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                    {emp.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-semibold text-[var(--text-primary)] truncate text-[11px]">{emp.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{emp.role}</div>
                  <div className="text-[10px] text-gray-500 truncate">{emp.email}</div>
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-primary text-white shadow-sm' : 'border border-[var(--border-color)] bg-canvas'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
