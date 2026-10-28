'use client';

import { use, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { getScenario } from '@/lib/store';
import { RiskBadge, ProgressBar, ResultCard } from '@/components/ui/ResultCard';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { Scenario } from '@/lib/types';
import { ArrowLeft, FileText, CheckCircle2, Sliders, Activity, BarChart2 } from 'lucide-react';

function ResultsInner({ scenarioId }: { scenarioId: string }) {
  const [scenario, setScenario] = useState<Scenario | null>(null);

  useEffect(() => {
    const s = getScenario(scenarioId);
    if (s) setScenario(s);
  }, [scenarioId]);

  if (!scenario || !scenario.results) {
    return (
      <div className="panel" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>No calculated results found for this scenario.</p>
        <Link href={"/simulation/" + scenarioId} className="btn btn-primary btn-sm" style={{ marginTop: "12px" }}>
          Open Workspace &amp; Run
        </Link>
      </div>
    );
  }

  const r = scenario.results;
  const radarData = [
    { subject: 'Intensity', A: r.intensityIndex },
    { subject: 'Efficiency', A: r.efficiencyScore },
    { subject: 'Consistency', A: r.consistencyScore },
    { subject: 'Frag Quality', A: r.fragmentationScore === 'high' ? 85 : r.fragmentationScore === 'medium' ? 55 : 25 },
    { subject: 'Safety', A: r.overbreakRisk === 'low' ? 85 : r.overbreakRisk === 'medium' ? 50 : 20 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Link href={"/simulation/" + scenarioId} className="btn btn-ghost btn-sm" style={{ padding: "2px 6px" }}>
                <ArrowLeft size={14} /> Workspace
              </Link>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
              <span className="badge badge-green">Simulation Complete</span>
            </div>
            <h1 className="h2" style={{ margin: '4px 0 6px' }}>{scenario.scenarioName}</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Detailed numerical breakdown of shockwave transfer, fragmentation sizing, and environmental risks.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href={"/reports/" + scenarioId} className="btn btn-primary">
              <FileText size={15} /> Technical Report
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="kpi-grid">
        <ResultCard title="Efficiency Score" value={String(r.efficiencyScore) + "%"} subtitle="Energy release factor" accentColor="#16A34A" />
        <ResultCard title="Relative Intensity" value={r.intensityIndex} unit="/100" subtitle="Borehole shockwave proxy" />
        <ResultCard title="Consistency Score" value={r.consistencyScore} unit="/100" subtitle="Fragment homogeneity" accentColor="var(--color-teal)" />
        <ResultCard title="Mean Fragment Size" value={"~" + String(r.estimatedFragmentSize)} unit="cm" subtitle="Predicted Kuz-Ram distribution" accentColor="#D97706" />
      </div>

      {/* Main Grid: Radar + Progress Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Radar */}
        <div className="panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '14px' }}>Multi-Metric Envelope</h3>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
                <Radar name="Performance" dataKey="A" stroke="#2563EB" fill="#2563EB" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Predictive Indices</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <ProgressBar label="Shockwave Intensity" value={r.intensityIndex} max={100} showLabel color="#2563EB" />
            <ProgressBar label="Energy Transmission Efficiency" value={r.efficiencyScore} max={100} showLabel color="#16A34A" />
            <ProgressBar label="Fracture Network Uniformity" value={r.consistencyScore} max={100} showLabel color="#0D9488" />
          </div>

          <div className="divider" style={{ margin: '8px 0' }} />

          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Risk Assessments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="kv-row"><span className="kv-key">Fragmentation Sizing</span><RiskBadge level={r.fragmentationScore} /></div>
            <div className="kv-row"><span className="kv-key">Ground Vibration Risk</span><RiskBadge level={r.vibrationRiskIndex} /></div>
            <div className="kv-row"><span className="kv-key">Bench Back-Break (Overbreak)</span><RiskBadge level={r.overbreakRisk} /></div>
            <div className="kv-row"><span className="kv-key">Lithology Discontinuity Uncertainty</span><RiskBadge level={r.geologicalUncertainty} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading results...</div>}>
      <ResultsInner scenarioId={id} />
    </Suspense>
  );
}
