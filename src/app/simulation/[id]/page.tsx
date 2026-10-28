'use client';

import { use, useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getScenario, simulateScenario, saveScenario, runQuickSimulation } from '@/lib/store';
import { BlastCanvas } from '@/components/simulation/BlastCanvas';
import { Slider } from '@/components/ui/Slider';
import { RiskBadge, ResultCard } from '@/components/ui/ResultCard';
import type { Scenario, SimulationStage } from '@/lib/types';
import { Play, RotateCcw, Save, ArrowLeft, Sliders, Activity, Info, Check } from 'lucide-react';

function SimulationWorkspaceInner({ scenarioId }: { scenarioId: string }) {
  const searchParams = useSearchParams();
  const autorun = searchParams.get('autorun') === 'true';

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [results, setResults] = useState<ReturnType<typeof runQuickSimulation> | undefined>();
  const [stage, setStage] = useState<SimulationStage>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [paramTab, setParamTab] = useState<'rock' | 'geometry' | 'energy'>('rock');

  useEffect(() => {
    const s = getScenario(scenarioId);
    if (s) {
      setScenario(s);
      if (s.results) setResults(s.results);
    }
  }, [scenarioId]);

  useEffect(() => {
    if (scenario && stage === 'idle') {
      setResults(runQuickSimulation(scenario.params));
    }
  }, [scenario, stage]);

  useEffect(() => {
    if (autorun && scenario && stage === 'idle' && !isRunning) {
      handleSimulate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, autorun]);

  const handleSimulate = useCallback(() => {
    if (!scenario) return;
    setIsRunning(true);
    setSaved(false);
    setStage('stage1_intact');
    const timings: [SimulationStage, number][] = [
      ['stage2_energy', 700],
      ['stage3_cracks', 1500],
      ['stage4_fragmentation', 2500],
      ['stage5_result', 3800],
    ];
    timings.forEach(([s, t]) => {
      setTimeout(() => setStage(s), t);
    });
    setTimeout(() => {
      const sim = simulateScenario(scenarioId);
      if (sim?.results) setResults(sim.results);
      setIsRunning(false);
    }, 4400);
  }, [scenario, scenarioId]);

  const handleReset = useCallback(() => {
    if (!scenario) return;
    setStage('idle');
    setResults(runQuickSimulation(scenario.params));
  }, [scenario]);

  const handleSave = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);

  const updateParam = useCallback(
    <K extends keyof Scenario['params']>(
      section: K,
      key: keyof Scenario['params'][K],
      val: unknown
    ) => {
      setScenario((prev) => {
        if (!prev) return null;
        const newParams = {
          ...prev.params,
          [section]: {
            ...(prev.params[section] as object),
            [key]: val,
          },
        };
        const updated = { ...prev, params: newParams };
        saveScenario(updated);
        setResults(runQuickSimulation(newParams));
        return updated;
      });
    },
    []
  );

  if (!scenario) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading scenario workspace...</div>;
  }

  const p = scenario.params;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar */}
      <div className="panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Link href="/history" className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }}>
                <ArrowLeft size={14} /> Back
              </Link>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>•</span>
              <span className="text-eyebrow" style={{ margin: 0 }}>Interactive Workspace</span>
            </div>
            <h1 className="h2" style={{ margin: 0, fontSize: '1.5rem' }}>{scenario.scenarioName}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className={'badge ' + (isRunning ? 'badge-amber' : stage === 'stage5_result' ? 'badge-green' : 'badge-gray')}>
              {isRunning ? 'Simulating Physics...' : stage === 'stage5_result' ? 'Simulation Complete' : 'Live Sync Active'}
            </span>

            <button
              onClick={handleReset}
              disabled={isRunning}
              type="button"
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={14} /> Reset
            </button>

            <button
              onClick={handleSave}
              type="button"
              className="btn btn-secondary btn-sm"
            >
              {saved ? <Check size={14} color="var(--color-green)" /> : <Save size={14} />}
              {saved ? 'Saved!' : 'Save'}
            </button>

            <button
              onClick={handleSimulate}
              disabled={isRunning}
              type="button"
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 16px' }}
            >
              <Play size={14} fill="white" />
              {stage === 'idle' ? 'Run Simulation' : 'Re-run'}
            </button>
          </div>
        </div>
      </div>

      {/* Main 3 columns layout: Parameters (300px) | Canvas (Flex) | Results (280px) */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 280px', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Parameters Studio */}
        <div className="panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={16} color="var(--color-primary)" />
              Live Parameters
            </h3>
            <Link href="/simulation/new" style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Full Wizard →
            </Link>
          </div>

          <div className="toolbar-segmented" style={{ width: '100%' }}>
            {(['rock', 'geometry', 'energy'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setParamTab(t)}
                className={paramTab === t ? 'active' : ''}
                style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '6px' }}
              >
                {t}
              </button>
            ))}
          </div>

          {paramTab === 'rock' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="kv-row">
                <span className="kv-key">Target Lithology</span>
                <span className="kv-value" style={{ textTransform: 'capitalize' }}>
                  {p.rockProperties.rockType.replace('_', ' ')}
                </span>
              </div>
              <Slider
                label="Strength Index"
                value={p.rockProperties.strengthIndex}
                min={10}
                max={100}
                onChange={(v) => updateParam('rockProperties', 'strengthIndex', v)}
                unit="/100"
              />
              <Slider
                label="Density"
                value={p.rockProperties.density}
                min={1500}
                max={3500}
                onChange={(v) => updateParam('rockProperties', 'density', v)}
                unit=" kg/m³"
              />
              <div className="kv-row">
                <span className="kv-key">Weathering</span>
                <span className="kv-value" style={{ textTransform: 'capitalize' }}>
                  {p.rockProperties.condition.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          {paramTab === 'geometry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Slider
                label="Borehole Depth"
                value={p.geometry.boreholeDepth}
                min={2}
                max={25}
                step={0.5}
                onChange={(v) => updateParam('geometry', 'boreholeDepth', v)}
                unit=" m"
              />
              <Slider
                label="Burden"
                value={p.geometry.burden}
                min={1}
                max={8}
                step={0.1}
                onChange={(v) => updateParam('geometry', 'burden', v)}
                unit=" m"
              />
              <Slider
                label="Spacing"
                value={p.geometry.spacing}
                min={1}
                max={10}
                step={0.1}
                onChange={(v) => updateParam('geometry', 'spacing', v)}
                unit=" m"
              />
              <Slider
                label="Bench Height"
                value={p.geometry.benchHeight}
                min={5}
                max={30}
                step={0.5}
                onChange={(v) => updateParam('geometry', 'benchHeight', v)}
                unit=" m"
              />
              <Slider
                label="Number of Holes"
                value={p.geometry.numberOfHoles ?? 10}
                min={1}
                max={30}
                step={1}
                onChange={(v) => updateParam('geometry', 'numberOfHoles', v)}
                unit=" holes"
              />
              <Slider
                label="Field Depth (F.T.)"
                value={p.geometry.ft ?? 6.5}
                min={2}
                max={15}
                step={0.5}
                onChange={(v) => updateParam('geometry', 'ft', v)}
                unit=" m"
              />
              <Slider
                label="Hole Diameter"
                value={p.geometry.boreholeDiameter}
                min={50}
                max={300}
                step={2}
                onChange={(v) => updateParam('geometry', 'boreholeDiameter', v)}
                unit=" mm"
              />
            </div>
          )}

          {paramTab === 'energy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Slider
                label="Energy Level"
                value={p.energyModel.energyLevel}
                min={20}
                max={100}
                onChange={(v) => updateParam('energyModel', 'energyLevel', v)}
                unit="/100"
              />
              <Slider
                label="O₂ / Oxygen Quantity"
                value={p.energyModel.oxygenQuantityKg ?? 520}
                min={100}
                max={1500}
                step={20}
                onChange={(v) => updateParam('energyModel', 'oxygenQuantityKg', v)}
                unit=" kg"
              />
              <Slider
                label="Confinement"
                value={p.energyModel.confinementLevel}
                min={20}
                max={100}
                onChange={(v) => updateParam('energyModel', 'confinementLevel', v)}
                unit="/100"
              />
              <Slider
                label="Initiation Quality"
                value={p.energyModel.initiationQuality}
                min={20}
                max={100}
                onChange={(v) => updateParam('energyModel', 'initiationQuality', v)}
                unit="/100"
              />
              <div className="kv-row">
                <span className="kv-key">Profile</span>
                <span className="kv-value" style={{ textTransform: 'capitalize' }}>
                  {p.energyModel.energyDistribution}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Blast Canvas */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={16} color="var(--color-primary)" />
              2D Blast Dynamics Canvas
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Step Sequence Timeline
            </span>
          </div>

          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <BlastCanvas params={p} results={results} stage={stage} onStageChange={setStage} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', paddingTop: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>STAGES:</span>
            {(['stage1_intact', 'stage2_energy', 'stage3_cracks', 'stage4_fragmentation', 'stage5_result'] as SimulationStage[]).map((s, idx) => (
              <span
                key={s}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: stage === s ? 700 : 500,
                  color: stage === s ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  background: stage === s ? 'var(--color-primary-light)' : 'transparent',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {idx + 1}. {s.replace('stage', '').replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column: Live Results */}
        <div className="panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Live Results</h3>
            {results && <Link href={"/results/" + scenarioId} style={{ fontSize: "0.75rem", color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Detailed &rarr;</Link>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            <ResultCard title="Efficiency Score" value={String(results?.efficiencyScore ?? 0) + "%"} subtitle="Energy transmission yield" accentColor="#16A34A" />
            <ResultCard title="Relative Intensity" value={results?.intensityIndex ?? 0} unit="/100" subtitle="Peak borehole shock index" />
            <ResultCard title="Consistency" value={results?.consistencyScore ?? 0} unit="/100" subtitle="Fragment uniformity rating" accentColor="var(--color-teal)" />
          </div>

          <div className="divider" style={{ margin: '4px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="kv-row">
              <span className="kv-key">Fragmentation</span>
              <RiskBadge level={results?.fragmentationScore ?? 'low'} />
            </div>
            <div className="kv-row">
              <span className="kv-key">Vibration Risk</span>
              <RiskBadge level={results?.vibrationRiskIndex ?? 'low'} />
            </div>
            <div className="kv-row">
              <span className="kv-key">Overbreak Risk</span>
              <RiskBadge level={results?.overbreakRisk ?? 'low'} />
            </div>
            <div className="kv-row">
              <span className="kv-key">Geo Uncertainty</span>
              <RiskBadge level={results?.geologicalUncertainty ?? 'low'} />
            </div>
          </div>

          {results?.mlPrediction && (
            <div style={{
              background: 'rgba(37, 99, 235, 0.05)',
              border: '1px solid rgba(37, 99, 235, 0.15)',
              borderRadius: '8px',
              padding: '10px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                  LOX ML Model
                </span>
                <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                  {results.mlPrediction.trainingCasesCount} Cases
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem' }}>
                <div style={{ background: 'var(--color-surface)', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', display: 'block' }}>Muckpile</span>
                  <span style={{ fontWeight: 600 }}>{results.mlPrediction.muckpileCoverage}</span>
                </div>
                <div style={{ background: 'var(--color-surface)', padding: '4px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', display: 'block' }}>Dust Tendency</span>
                  <span style={{ fontWeight: 600 }}>{results.mlPrediction.dustTendency}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="info-panel info-panel-blue">
        <Info size={16} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.8125rem' }}>
          Pure virtual approximation model for conceptual mining exploration and operator instruction. Not calibrated for operational blast release.
        </span>
      </div>
    </div>
  );
}

export default function SimulationWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading simulation workspace...</div>}>
      <SimulationWorkspaceInner scenarioId={id} />
    </Suspense>
  );
}
