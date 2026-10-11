import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';

interface Dataset {
  id: string;
  name: string;
  format: 'csv' | 'json';
  recordCount: number;
  columns: string[];
  createdAt: string;
}

interface DatasetDetail extends Dataset {
  data: {
    columns: string[];
    records: Array<Record<string, unknown>>;
  };
}

const PAGE_SIZE = 25;

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export const UserDatasetTable: React.FC<{ spec: ComponentSpec }> = ({ spec }) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [selectedId, setSelectedId] = useState(
    typeof spec.config?.datasetId === 'string' ? spec.config.datasetId : ''
  );
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    axios.get<{ datasets: Dataset[] }>('/api/user-data')
      .then(response => {
        if (!active) return;
        setDatasets(response.data.datasets);
        const preferred = response.data.datasets.find(item => item.id === spec.config?.datasetId);
        setSelectedId(preferred?.id || response.data.datasets[0]?.id || '');
      })
      .catch(() => {
        if (active) setError('Could not load your uploaded datasets.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [spec.config?.datasetId]);

  useEffect(() => {
    if (!selectedId) {
      setDataset(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    axios.get<DatasetDetail>(`/api/user-data/${encodeURIComponent(selectedId)}`)
      .then(response => {
        if (active) setDataset(response.data);
      })
      .catch(() => {
        if (active) setError('Could not load this dataset. It may have been removed.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [selectedId]);

  const columns = dataset?.data.columns ?? [];
  const filteredRecords = useMemo(() => {
    const records = dataset?.data.records ?? [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return records;
    return records.filter(record =>
      columns.some(column => formatValue(record[column]).toLowerCase().includes(normalizedQuery))
    );
  }, [columns, dataset, query]);
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const pageRecords = filteredRecords.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading && !dataset) {
    return <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Loading your uploaded data…</p>;
  }
  if (error) {
    return <p role="alert" className="py-4 text-sm text-coral">{error}</p>;
  }
  if (!datasets.length || !dataset) {
    return <p className="py-8 text-center text-sm text-[var(--text-secondary)]">No uploaded datasets are available for this account.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{dataset.name}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {dataset.recordCount.toLocaleString()} records · {columns.length} fields · {dataset.format.toUpperCase()}
          </p>
        </div>
        {datasets.length > 1 && (
          <select
            aria-label="Choose uploaded dataset"
            value={selectedId}
            onChange={event => {
              setSelectedId(event.target.value);
              setPage(0);
            }}
            className="max-w-full rounded-lg border border-[var(--border-color)] bg-[var(--canvas-color)] px-3 py-2 text-xs text-[var(--text-primary)]"
          >
            {datasets.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        )}
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--canvas-color)] px-3">
        <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        <input
          value={query}
          onChange={event => {
            setQuery(event.target.value);
            setPage(0);
          }}
          placeholder="Search uploaded records…"
          className="w-full bg-transparent py-2.5 text-xs outline-none placeholder:text-[var(--text-muted)]"
        />
      </label>

      <div className="max-h-[32rem] overflow-auto rounded-lg border border-[var(--border-color)]">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 bg-[var(--canvas-color)]">
            <tr>
              {columns.map(column => (
                <th key={column} className="whitespace-nowrap border-b border-[var(--border-color)] px-3 py-2.5 font-semibold text-[var(--text-secondary)]">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRecords.map((record, index) => (
              <tr key={`${page}-${index}`} className="border-b border-[var(--border-color)]/60 last:border-0">
                {columns.map(column => (
                  <td key={column} className="max-w-sm whitespace-pre-wrap break-words px-3 py-2.5 text-[var(--text-primary)]">
                    {formatValue(record[column]) || '—'}
                  </td>
                ))}
              </tr>
            ))}
            {!pageRecords.length && (
              <tr><td colSpan={Math.max(1, columns.length)} className="px-3 py-8 text-center text-[var(--text-muted)]">No matching records.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>{filteredRecords.length.toLocaleString()} matching records</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => setPage(current => Math.max(0, current - 1))}
            className="rounded-md border border-[var(--border-color)] p-1.5 disabled:opacity-40"
          ><ChevronLeft className="h-4 w-4" /></button>
          <span>Page {page + 1} of {pageCount}</span>
          <button
            type="button"
            aria-label="Next page"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage(current => Math.min(pageCount - 1, current + 1))}
            className="rounded-md border border-[var(--border-color)] p-1.5 disabled:opacity-40"
          ><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
};
