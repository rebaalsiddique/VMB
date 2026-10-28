'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
  rowKey: (row: T) => string;
}

export function DataTable<T>({
  columns, data, searchable, searchKeys, emptyMessage, rowKey,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = search && searchKeys
    ? data.filter((row) => searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(search.toLowerCase())))
    : data;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortKey] ?? '');
        const bv = String((b as Record<string, unknown>)[sortKey] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : filtered;

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {searchable && (
        <div style={{ position: 'relative', maxWidth: '320px' }}>
          <Search size={14} style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search scenarios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '32px', paddingRight: search ? '32px' : '13px' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              type="button"
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                  className={col.sortable ? 'sortable' : ''}
                  style={{ textAlign: col.align ?? 'left', width: col.width }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {col.label}
                    {col.sortable && sortKey === String(col.key) && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
                  {emptyMessage ?? 'No records found'}
                </td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={String(col.key)} style={{ textAlign: col.align ?? 'left' }}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[String(col.key)] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > 0 && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
          Showing {sorted.length} of {data.length} scenarios
        </div>
      )}
    </div>
  );
}