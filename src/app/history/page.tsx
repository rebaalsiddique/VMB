'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadScenarios, deleteScenario, duplicateScenario } from '@/lib/store';
import { SAMPLE_HISTORY as DEMO_HISTORY } from '@/data/demo-scenario';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { Scenario } from '@/lib/types';
import { Plus, Trash2, Copy, ExternalLink, GitCompare, History, Filter } from 'lucide-react';

export default function HistoryPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [filter, setFilter] = useState<'all' | 'simulated' | 'draft'>('all');

  useEffect(() => {
    const loaded = loadScenarios();
    setScenarios(loaded.length === 0 ? DEMO_HISTORY : loaded);
  }, []);

  const filtered = scenarios.filter((s) => {
    if (filter === 'simulated') return s.results != null;
    if (filter === 'draft') return s.results == null;
    return true;
  });

  function handleDelete(id: string) {
    if (confirm('Delete this scenario?')) {
      deleteScenario(id);
      setScenarios(loadScenarios());
    }
  }

  function handleDuplicate(id: string) {
    duplicateScenario(id);
    setScenarios(loadScenarios());
  }

  const columns: Column<Scenario>[] = [
    {
      key: 'scenarioName',
      label: 'Scenario Model',
      sortable: true,
      render: (s) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.scenarioName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {s.description || 'Engineering baseline model'}
          </div>
        </div>
      ),
    },
    {
      key: 'rockType',
      label: 'Lithology',
      render: (s) => (
        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
          {s.params.rockProperties.rockType.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'geometry',
      label: 'Pattern',
      render: (s) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
          {s.params.geometry.burden}m B x {s.params.geometry.spacing}m S
        </span>
      ),
    },
    {
      key: 'result',
      label: 'Simulation Status',
      render: (s) =>
        s.results ? (
          <span className="badge badge-green">
            {s.results.efficiencyScore}% Eff. ({s.results.fragmentationScore} frag)
          </span>
        ) : (
          <span className="badge badge-gray">Draft Config</span>
        ),
    },
    {
      key: 'updatedAt',
      label: 'Last Modified',
      sortable: true,
      render: (s) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          {new Date(s.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <Link href={`/simulation/${s.id}`} className="btn btn-ghost btn-sm" title="Open workspace" style={{ padding: '4px 8px' }}>
            <ExternalLink size={14} /> Open
          </Link>
          <button type="button" onClick={() => handleDuplicate(s.id)} className="btn btn-ghost btn-sm" title="Duplicate" style={{ padding: '4px 8px' }}>
            <Copy size={14} />
          </button>
          <Link href={`/compare?ids=${s.id}`} className="btn btn-ghost btn-sm" title="Compare" style={{ padding: '4px 8px' }}>
            <GitCompare size={14} />
          </Link>
          <button type="button" onClick={() => handleDelete(s.id)} className="btn btn-ghost btn-sm" title="Delete" style={{ padding: '4px 8px', color: 'var(--color-red)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="text-eyebrow">Scenario Repository</span>
            <h1 className="h2" style={{ margin: '4px 0 6px' }}>Simulation History</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Manage, compare, and reopen previously configured and calculated blast models.
            </p>
          </div>
          <Link href="/simulation/new" className="btn btn-primary">
            <Plus size={16} /> New Simulation
          </Link>
        </div>
      </div>

      {/* Filter and Table Panel */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={15} color="var(--color-text-muted)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Filter:</span>
            <div className="toolbar-segmented">
              {(['all', 'simulated', 'draft'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={filter === f ? 'active' : ''}
                  style={{ textTransform: 'capitalize', fontSize: '0.8125rem', padding: '6px 14px' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Showing <strong>{filtered.length}</strong> of {scenarios.length} scenarios
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          searchable
          searchKeys={['scenarioName', 'description'] as (keyof Scenario)[]}
          rowKey={(s) => s.id}
          emptyMessage="No scenarios found matching your criteria. Create your first simulation!"
        />
      </div>
    </div>
  );
}
