import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, Star } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface AvailabilityRecord {
  employeeId: string;
  employeeName: string;
  date: string;
  timeSlots: Array<{ time: string; available: boolean; meeting?: string }>;
}

export const AvailabilityPanel: React.FC<{ spec: ComponentSpec }> = () => {
  const [records, setRecords] = useState<AvailabilityRecord[]>([]);

  useEffect(() => {
    axios
      .get('/api/data/availability?date=2026-10-11')
      .then(res => setRecords(res.data.slice(0, 4)))
      .catch(console.error);
  }, []);

  const timeSlots = ['10:00 - 11:00', '11:00 - 12:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00'];

  return (
    <div className="space-y-3 text-xs">
      <div className="p-2.5 rounded-lg bg-teal/10 border border-teal/20 text-teal-300 flex items-center justify-between">
        <span className="font-semibold flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-teal-400 text-teal-400" />
          Optimal Overlap Found: 02:00 PM – 03:00 PM EST
        </span>
        <span className="text-[10px] text-gray-400">All 4 key leads free</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-center border-collapse text-[11px]">
          <thead>
            <tr className="bg-plum-900/60 border-b border-border/50 text-gray-400">
              <th className="py-2 px-3 text-left">Stakeholder</th>
              {timeSlots.map(t => (
                <th
                  key={t}
                  className={`py-2 px-2 whitespace-nowrap font-mono ${
                    t === '14:00 - 15:00' ? 'text-teal-400 bg-teal/10 font-bold' : ''
                  }`}
                >
                  {t.split(' - ')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 bg-card/60">
            {records.map(r => (
              <tr key={r.employeeId}>
                <td className="py-2 px-3 text-left font-medium text-white whitespace-nowrap">
                  {r.employeeName}
                </td>
                {timeSlots.map(t => {
                  const slot = r.timeSlots.find(s => s.time === t);
                  const isAvailable = slot ? slot.available : true;
                  const isOptimal = t === '14:00 - 15:00';

                  return (
                    <td
                      key={t}
                      className={`py-2 px-2 ${
                        isOptimal ? 'bg-teal/5' : ''
                      }`}
                    >
                      {isAvailable ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-mint/20 text-mint">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-coral/20 text-coral"
                          title={slot?.meeting || 'Busy'}
                        >
                          <X className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
