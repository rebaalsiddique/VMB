'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadScenarios } from '@/lib/store';
import { SAMPLE_HISTORY } from '@/data/demo-scenario';
import type { Scenario } from '@/lib/types';
import { FileText, ArrowRight, ExternalLink, Calendar, Layers } from 'lucide-react';

export default function ReportsListPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    const loaded = loadScenarios();
    setScenarios(loaded.length === 0 ? SAMPLE_HISTORY : loaded);
  }, []);

  const withResults = scenarios.filter((s) => s.results);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div>
          <span className="text-eyebrow">Technical Output</span>
          <h1 className="h2" style={{ margin: '4px 0 6px' }}>Engineering Reports</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Review formal simulation outcome summaries, energy distribution metrics, and export compliance documents.
          </p>
        </div>
      </div>

      {withResults.length === 0 ? (
        <div className="panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <FileText size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)', marginBottom: '6px' }}>No Completed Simulations Found</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '16px' }}>Run and evaluate at least one blast scenario to generate technical reports.</p>
          <Link href="/simulation/new" className="btn btn-primary">
            Configure New Simulation
          </Link>
        </div>
      ) : (
        <div className="panel" style={{ padding: '20px 24px' }}>
          <h2 className="section-title-strong" style={{ marginBottom: '16px' }}>
            Available Technical Dossiers ({withResults.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {withResults.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
                      {s.params.rockProperties.rockType.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(s.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '6px 0 4px', color: 'var(--color-text-primary)' }}>
                    {s.scenarioName}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {s.description || 'Routine engineering blast prediction model.'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>EFFICIENCY</span>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--color-green)' }}>{s.results?.efficiencyScore}%</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>INTENSITY</span>
                      <strong style={{ fontSize: '0.9375rem', color: 'var(--color-text-primary)' }}>{s.results?.intensityIndex}/100</strong>
                    </div>
                  </div>

                  <Link href={"/reports/" + s.id} className="btn btn-secondary btn-sm" style={{ padding: "6px 12px" }}>
                    <span>View Dossier</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
