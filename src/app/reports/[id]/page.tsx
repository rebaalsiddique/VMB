'use client';

import { use, useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { getScenario } from '@/lib/store';
import { runSimulation } from '@/lib/simulation-engine';
import { RiskBadge } from '@/components/ui/ResultCard';
import type { Scenario, SimulationResults } from '@/lib/types';
import { Printer, ArrowLeft, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

function ReportInner({ scenarioId }: { scenarioId: string }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [results, setResults] = useState<SimulationResults | null>(null);

  useEffect(() => {
    const s = getScenario(scenarioId);
    if (s) {
      setScenario(s);
      setResults(s.results ?? runSimulation(s.params));
    }
  }, [scenarioId]);

  function handlePrint() {
    window.print();
  }

  if (!scenario || !results) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading report...</div>;
  }

  const p = scenario.params;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Action Header */}
      <div className="panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <Link href={"/results/" + scenarioId} className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} /> Back to Results
          </Link>
          <button type="button" onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={14} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Document Sheet */}
      <div ref={reportRef} className="panel" style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#FFFFFF' }}>
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Virtual Mining Blast Lab • Technical Dossier
            </span>
            <h1 className="h1" style={{ fontSize: '2rem', margin: '6px 0 4px' }}>{scenario.scenarioName}</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {scenario.description || 'Routine engineering blast prediction model.'}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <div>Dossier ID: <strong>{scenario.id.slice(0, 8)}</strong></div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div>
          <h2 className="section-title-strong" style={{ marginBottom: '12px' }}>Executive Performance Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Efficiency</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--color-green)' }}>{results.efficiencyScore}%</strong>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Intensity Index</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>{results.intensityIndex}/100</strong>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Fragmentation</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)' }}>~{results.estimatedFragmentSize} cm</strong>
            </div>
            <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Vibration Risk</span>
              <div style={{ marginTop: '2px' }}><RiskBadge level={results.vibrationRiskIndex} /></div>
            </div>
          </div>
        </div>

        {/* Input Parameters Matrix */}
        <div>
          <h2 className="section-title-strong" style={{ marginBottom: '12px' }}>Configured Input Matrix</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '14px 16px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--color-primary)' }}>Geotechnical &amp; Geology</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                <div className="kv-row"><span className="kv-key">Rock Type</span><span className="kv-value" style={{ textTransform: 'capitalize' }}>{p.rockProperties.rockType.replace('_', ' ')}</span></div>
                <div className="kv-row"><span className="kv-key">Strength Index</span><span className="kv-value">{p.rockProperties.strengthIndex}/100</span></div>
                <div className="kv-row"><span className="kv-key">Density</span><span className="kv-value">{p.rockProperties.density} kg/m³</span></div>
                <div className="kv-row"><span className="kv-key">Fracture Level</span><span className="kv-value">{p.geologicalConditions.fractureLevel}/100</span></div>
                <div className="kv-row"><span className="kv-key">Joints Orientation</span><span className="kv-value" style={{ textTransform: 'capitalize' }}>{p.geologicalConditions.jointOrientation}</span></div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '14px 16px' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: '0 0 10px', color: 'var(--color-primary)' }}>Pattern &amp; Energetics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                <div className="kv-row"><span className="kv-key">Burden x Spacing</span><span className="kv-value">{p.geometry.burden}m x {p.geometry.spacing}m</span></div>
                <div className="kv-row"><span className="kv-key">Borehole Depth</span><span className="kv-value">{p.geometry.boreholeDepth}m</span></div>
                <div className="kv-row"><span className="kv-key">Charge Zone</span><span className="kv-value">{p.geometry.chargeZoneLength}m</span></div>
                <div className="kv-row"><span className="kv-key">Hole Diameter</span><span className="kv-value">{p.geometry.boreholeDiameter}mm</span></div>
                <div className="kv-row"><span className="kv-key">Energy Level</span><span className="kv-value">{p.energyModel.energyLevel}/100</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer in Print */}
        <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '16px', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          <strong>Notice:</strong> This dossier contains synthetic engineering predictions generated via the Virtual Mining Blast Lab empirical model. Strictly for planning, instruction, and comparison.
        </div>
      </div>
    </div>
  );
}

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading report...</div>}>
      <ReportInner scenarioId={id} />
    </Suspense>
  );
}
