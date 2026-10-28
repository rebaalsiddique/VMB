'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadScenarios } from '@/lib/store';
import { SAMPLE_HISTORY } from '@/data/demo-scenario';
import { runSimulation } from '@/lib/simulation-engine';
import { RiskBadge } from '@/components/ui/ResultCard';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend
} from 'recharts';
import type { Scenario, SimulationResults } from '@/lib/types';
import { GitCompare, CheckSquare, Square, Layers, Info } from 'lucide-react';

const COLORS = ['#2563EB', '#0D9488', '#D97706', '#DC2626'];

function CompareInner() {
  const searchParams = useSearchParams();
  const preselect = searchParams.get('ids')?.split(',') ?? [];

  const [allScenarios, setAllScenarios] = useState<Scenario[]>([]);
  const [selected, setSelected] = useState<string[]>(preselect.slice(0, 4));

  useEffect(() => {
    const loaded = loadScenarios();
    const sc = loaded.length === 0 ? SAMPLE_HISTORY : loaded;
    setAllScenarios(sc);
    if (selected.length === 0 && sc.length >= 2) {
      setSelected([sc[0].id, sc[1].id]);
    }
  }, []);

  const selectedScenarios = selected
    .map((id) => allScenarios.find((s) => s.id === id))
    .filter(Boolean) as Scenario[];

  const resultsMap = new Map<string, SimulationResults>();
  for (const s of selectedScenarios) {
    resultsMap.set(s.id, s.results ?? runSimulation(s.params));
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  }

  const radarData = ['Intensity', 'Efficiency', 'Consistency', 'Safety', 'Fragmentation'].map((metric) => {
    const entry: Record<string, string | number> = { subject: metric };
    for (const s of selectedScenarios) {
      const r = resultsMap.get(s.id)!;
      const val =
        metric === 'Intensity' ? r.intensityIndex :
        metric === 'Efficiency' ? r.efficiencyScore :
        metric === 'Consistency' ? r.consistencyScore :
        metric === 'Safety' ? (r.overbreakRisk === 'low' ? 85 : r.overbreakRisk === 'medium' ? 50 : 15) :
        (r.fragmentationScore === 'high' ? 80 : r.fragmentationScore === 'medium' ? 50 : 20);
      entry[s.scenarioName.slice(0, 14)] = val;
    }
    return entry;
  });

  const barData = selectedScenarios.map((s, i) => {
    const r = resultsMap.get(s.id)!;
    return {
      name: s.scenarioName.slice(0, 16),
      Intensity: r.intensityIndex,
      Efficiency: r.efficiencyScore,
      Consistency: r.consistencyScore,
      fill: COLORS[i % COLORS.length],
    };
  });

  const RISK_KEYS = ['vibration', 'frag. score'];

  function getParamVal(s: Scenario, idx: number): string {
    const r = resultsMap.get(s.id);
    switch (idx) {
      case 0: return s.params.rockProperties.rockType.replace('_', ' ');
      case 1: return `${s.params.rockProperties.strengthIndex}/100`;
      case 2: return `${s.params.geometry.boreholeDepth}m`;
      case 3: return `${s.params.geometry.burden}m`;
      case 4: return `${s.params.geometry.spacing}m`;
      case 5: return `${s.params.energyModel.energyLevel}/100`;
      case 6: return String(r?.intensityIndex ?? '-');
      case 7: return `${r?.efficiencyScore ?? '-'}%`;
      case 8: return `${r?.consistencyScore ?? '-'}/100`;
      case 9: return String(r?.fragmentationScore ?? '-');
      case 10: return String(r?.vibrationRiskIndex ?? '-');
      default: return '-';
    }
  }

  const PARAMS: string[] = ['Lithology', 'Rock Strength', 'Borehole Depth', 'Burden', 'Spacing', 'Energy Level', 'Shock Intensity', 'Efficiency', 'Consistency', 'Frag. Score', 'Vibration Risk'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="text-eyebrow">Multivariate Analytics</span>
            <h1 className="h2" style={{ margin: '4px 0 6px' }}>Compare Scenarios</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Select 2 to 4 saved scenarios to benchmark fragmentation, blast efficiency, and risk envelopes side-by-side.
            </p>
          </div>
          <span className="badge badge-blue" style={{ fontSize: '0.8125rem', padding: '6px 14px' }}>
            {selected.length}/4 selected
          </span>
        </div>
      </div>

      {/* Selector Pills */}
      <div className="panel" style={{ padding: '16px 20px' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
          Select scenarios to evaluate (choose 2-4):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {allScenarios.map((s) => {
            const isSelected = selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSelect(s.id)}
                className={"btn " + (isSelected ? "btn-primary" : "btn-secondary") + " btn-sm"}
                style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
              >
                {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                <span>{s.scenarioName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedScenarios.length < 2 && (
        <div className="info-panel info-panel-blue">
          <Info size={18} style={{ flexShrink: 0 }} />
          <span>Please select at least 2 scenarios above to generate comparative charts and tabular metrics.</span>
        </div>
      )}

      {selectedScenarios.length >= 2 && (
        <>
          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <div className="panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '14px' }}>Multi-Axis Radar Comparison</h3>
              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                    {selectedScenarios.map((s, i) => (
                      <Radar
                        key={s.id}
                        name={s.scenarioName.slice(0, 14)}
                        dataKey={s.scenarioName.slice(0, 14)}
                        stroke={COLORS[i % COLORS.length]}
                        fill={COLORS[i % COLORS.length]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '14px' }}>Predictive Scores Breakdown</h3>
              <div style={{ height: '280px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '12px' }} />
                    <Bar dataKey="Efficiency" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Intensity" fill="#D97706" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Consistency" fill="#0D9488" radius={[4, 4, 0, 0]} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Side-by-side Table */}
          <div className="panel" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '14px' }}>Parameter &amp; Outcome Correlation Table</h3>
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '220px' }}>Parameter / Metric</th>
                    {selectedScenarios.map((s, idx) => (
                      <th key={s.id} style={{ color: COLORS[idx % COLORS.length] }}>
                        {s.scenarioName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PARAMS.map((label, idx) => {
                    const isRisk = RISK_KEYS.includes(label.toLowerCase());
                    return (
                      <tr key={label}>
                        <td style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{label}</td>
                        {selectedScenarios.map((s) => {
                          const val = getParamVal(s, idx);
                          return (
                            <td key={s.id} style={{ fontFamily: isRisk ? 'inherit' : 'monospace' }}>
                              {isRisk && val !== '-' ? (
                                <RiskBadge level={val} />
                              ) : (
                                val
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading comparison module...</div>}>
      <CompareInner />
    </Suspense>
  );
}
