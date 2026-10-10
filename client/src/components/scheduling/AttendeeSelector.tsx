import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Plus } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

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
  const [selectedIds, setSelectedIds] = useState<string[]>(
    spec.config?.preselectedIds || ['emp-1', 'emp-2', 'emp-3', 'emp-4', 'emp-20']
  );

  useEffect(() => {
    axios
      .get('/api/data/employees')
      .then(res => setEmployees(res.data.slice(0, 8)))
      .catch(console.error);
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="text-gray-400">
        Required Launch Council & Technical Reviewers ({selectedIds.length} selected):
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
        {employees.map(emp => {
          const isSelected = selectedIds.includes(emp.id);

          return (
            <div
              key={emp.id}
              onClick={() => toggleSelect(emp.id)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-primary/20 border-primary text-white shadow-sm'
                  : 'bg-plum-900/30 border-border/50 text-gray-400 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-border"
                />
                <div className="truncate">
                  <div className="font-semibold text-white truncate text-[11px]">{emp.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{emp.role}</div>
                </div>
              </div>

              <div
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-primary text-white' : 'border border-gray-600'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
