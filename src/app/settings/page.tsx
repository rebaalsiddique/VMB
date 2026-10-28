'use client';

import { Settings, Shield, Cpu, Sliders, Database } from 'lucide-react';

const PREFERENCES = [
  ['Theme Mode', 'Light Engineering Professional'],
  ['Primary Colorway', 'Classic Mining Blue (#2563EB)'],
  ['Geotechnical Standard', 'Metric (SI Units - MPa, m, kg/m³)'],
  ['Simulation Formulation', 'Empirical Kuz-Ram Hybrid v1.2'],
  ['Persistence Layer', 'Browser LocalStorage (Zero-backend prototype)'],
  ['Visualization Mode', '2D Canvas Blast Dynamics (Three.js ready)'],
  ['Animation Velocity', 'Normal (4.4s multi-phase sequence)'],
  ['Numerical Precision', 'Single Decimal Place (0.1m)'],
];

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div>
          <span className="text-eyebrow">Platform Environment</span>
          <h1 className="h2" style={{ margin: '4px 0 6px' }}>Settings &amp; Preferences</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            System configuration and engine execution environment parameters.
          </p>
        </div>
      </div>

      <div className="panel" style={{ padding: '20px 24px' }}>
        <h2 className="section-title-strong" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="var(--color-primary)" />
          Application Preferences
        </h2>

        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '300px' }}>Configuration Key</th>
                <th>Active Setting</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {PREFERENCES.map(([k, v]) => (
                <tr key={k}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{k}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {v}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="badge badge-green">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ padding: '20px 24px', background: 'var(--color-surface-2)' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 6px' }}>Backend Scaffolding Notes</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
          The current prototype runs entirely client-side via LocalStorage for instantaneous exploring and demonstration. All entities mirror the full FastAPI + PostgreSQL production schema ready for enterprise database connection.
        </p>
      </div>
    </div>
  );
}
