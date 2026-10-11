import React, { useState } from 'react';
import { Plus, Trash2, Clock, Check } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface AgendaItem {
  time: string;
  item: string;
}

export const AgendaEditor: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const [items, setItems] = useState<AgendaItem[]>(
    spec.config?.items || [
      { time: '14:00 - 14:15', item: 'Post-mortem on Query Engine v2 memory leak & DAU impact (Elena & Chloe)' },
      { time: '14:15 - 14:35', item: 'Hotfix v2.8.5 deployment verification & rollback criteria (Elena Rostova)' },
      { time: '14:35 - 14:50', item: 'Tier 1 client notifications & revised SLA commitments (Alex & Daniel)' },
      { time: '14:50 - 15:00', item: 'Executive Go / No-Go Launch Decision Vote (Alex Rivera)' }
    ]
  );

  const [newItem, setNewItem] = useState('');
  const [newTime, setNewTime] = useState('15:00 - 15:15');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    setItems([...items, { time: newTime, item: newItem.trim() }]);
    setNewItem('');
  };

  const handleDelete = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="space-y-2">
        {items.map((slot, index) => (
          <div
            key={index}
            className="p-2.5 rounded-lg bg-canvas/80 border border-border/60 flex items-start justify-between gap-2 group hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start gap-2 flex-1">
              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary font-mono text-[11px] font-semibold shrink-0">
                {slot.time}
              </span>
              <span className="text-gray-200 leading-snug">{slot.item}</span>
            </div>

            <button
              onClick={() => handleDelete(index)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-coral transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new agenda item */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
        <input
          type="text"
          placeholder="New agenda item..."
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-canvas border border-border/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary hover:text-white border border-primary/30 font-medium transition-colors flex items-center gap-1 text-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Add Slot
        </button>
      </div>
    </div>
  );
};
