'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  ChevronLeft,
  Zap,
  Info,
  Check,
  AlertCircle,
} from 'lucide-react';
import { DEMO_PARAMS, ROCK_TYPES } from '@/data/demo-scenario';
import { Slider } from '@/components/ui/Slider';
import { RockCard } from '@/components/ui/RockCard';
import { GeometryDiagram } from '@/components/simulation/GeometryDiagram';
import { BlastCanvas } from '@/components/simulation/BlastCanvas';
import { createScenario } from '@/lib/store';
import { predictBlastOutcomes } from '@/lib/ml-pipeline';
import type {
  SimulationParams,
  RockType,
  JointOrientation,
  WaterPresence,
  GroundCondition,
  EnergyDistribution,
  SimulationMode,
  RockCondition,
} from '@/lib/types';

const STEPS = [
  { id: 1, key: 'rock', label: 'Rock Material', sub: 'Lithology & UCS' },
  { id: 2, key: 'geology', label: 'Geological', sub: 'Joints & Fractures' },
  { id: 3, key: 'geometry', label: 'Bench Geometry', sub: 'Boreholes & Burden' },
  { id: 4, key: 'energy', label: 'Energy Model', sub: 'Charge & Confinement' },
  { id: 5, key: 'environment', label: 'Review & Run', sub: 'Environment & Launch' },
];

function NewSimulationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';
  const preselectedRock = searchParams.get('rock') as RockType | null;

  const [step, setStep] = useState(1);
  const [simParams, setSimParams] = useState<SimulationParams>(() => {
    if (preselectedRock) {
      return {
        ...DEMO_PARAMS,
        rockProperties: { ...DEMO_PARAMS.rockProperties, rockType: preselectedRock },
      };
    }
    return DEMO_PARAMS;
  });

  const [name, setName] = useState(
    isDemo ? 'Granite Quarry Benchmark' : preselectedRock ? `${preselectedRock.toUpperCase()} Evaluation` : 'Production Bench Cut'
  );
  const [desc, setDesc] = useState(
    isDemo
      ? 'Synthetic verification model testing standard energy distribution.'
      : 'Engineering scenario model.'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const mlPrediction = predictBlastOutcomes(simParams);

  function updateParam<K extends keyof SimulationParams>(
    section: K,
    key: keyof SimulationParams[K],
    val: unknown
  ) {
    setSimParams((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [key]: val,
      },
    }));
  }

  function validateStep(currentStep: number): boolean {
    setValidationError(null);
    if (currentStep === 3) {
      if (simParams.geometry.chargeZoneLength > simParams.geometry.boreholeDepth) {
        setValidationError('Charge Zone Length cannot exceed total Borehole Depth.');
        return false;
      }
      if (simParams.geometry.burden > simParams.geometry.spacing * 1.8) {
        setValidationError('Burden is unusually high relative to borehole spacing. Recommended Burden <= 1.5 x Spacing.');
      }
    }
    if (currentStep === 5) {
      if (!name.trim()) {
        setValidationError('Please specify a valid Scenario Name.');
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
  }

  function handleBack() {
    setValidationError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  function handleRun() {
    if (!validateStep(5)) return;
    const finalName = name.trim() || `Scenario ${Date.now()}`;
    const created = createScenario(finalName, desc, simParams);
    router.push(`/simulation/${created.id}?autorun=true`);
  }

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Panel */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="text-eyebrow">Real-Time Interactive Design Studio</span>
            <h1 className="h2" style={{ margin: '4px 0 4px', fontSize: '1.625rem' }}>Configure &amp; Preview Blast Scenario</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Step {step} of {STEPS.length}: <strong>{STEPS[step - 1].label}</strong> — Viewport updates live as parameters change.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-blue">
              Step {step} / {STEPS.length}
            </span>
          </div>
        </div>

        {/* Stepper Timeline Buttons */}
        <div className="stepper" style={{ paddingTop: '16px', overflowX: 'auto', display: 'flex', gap: '8px' }}>
          {STEPS.map((s) => {
            const isComplete = step > s.id;
            const isActive = step === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (validateStep(step)) setStep(s.id);
                }}
                className={"stepper-item " + (isComplete ? "complete " : "") + (isActive ? "active" : "")}
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '4px 8px' }}
              >
                <div className="stepper-circle">
                  {isComplete ? <Check size={14} strokeWidth={3} /> : s.id}
                </div>
                <div className="stepper-label">
                  <span className="stepper-label-main">{s.label}</span>
                  <span className="stepper-label-sub">{s.sub}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Message */}
      {validationError && (
        <div className="info-panel info-panel-amber">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Real-Time Workspace: Split Screen Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Parameter Controls Studio */}
        <div className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* STEP 1: Rock Properties */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 className="section-title-strong">Select Target Lithology / Rock Type</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Rock strength and mass elasticity dictate fracture propagation speed and specific energy requirements.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {ROCK_TYPES.map((rock) => (
                  <RockCard
                    key={rock.id}
                    rock={rock}
                    selected={simParams.rockProperties.rockType === rock.id}
                    onClick={() => {
                      updateParam('rockProperties', 'rockType', rock.id);
                      const typicalStrength =
                        rock.id === 'quartzite' ? 92 :
                        rock.id === 'granite' ? 76 :
                        rock.id === 'basalt' ? 82 :
                        rock.id === 'iron_ore' ? 70 :
                        rock.id === 'limestone' ? 52 : 44;
                      updateParam('rockProperties', 'strengthIndex', typicalStrength);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="divider" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <Slider
                label="Rock Strength Index (UCS Proxy)"
                value={simParams.rockProperties.strengthIndex}
                min={10}
                max={100}
                unit="/100"
                lowLabel="Weak (10-40 MPa)"
                highLabel="Extremely Hard (>200 MPa)"
                tooltip="Normalized strength index proportional to Unconfined Compressive Strength."
                onChange={(v) => updateParam('rockProperties', 'strengthIndex', v)}
              />

              <div>
                <label className="label">Rock Density (kg/m³)</label>
                <input
                  type="number"
                  min={1500}
                  max={3600}
                  step={25}
                  value={simParams.rockProperties.density}
                  onChange={(e) =>
                    updateParam('rockProperties', 'density', Number(e.target.value))
                  }
                  className="input"
                />
                <span className="helper-text">
                  Standard granite: ~2,650 kg/m³ | Basalt: ~2,900 kg/m³ | Sandstone: ~2,200 kg/m³
                </span>
              </div>
            </div>

            <div>
              <label className="label">Rock Weathering Condition</label>
              <div className="toolbar-segmented" style={{ width: '100%', maxWidth: '480px' }}>
                {(['fresh', 'moderately_weathered', 'highly_weathered'] as RockCondition[]).map(
                  (cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => updateParam('rockProperties', 'condition', cond)}
                      className={simParams.rockProperties.condition === cond ? 'active' : ''}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {cond.replace('_', ' ')}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Geological Conditions */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 className="section-title-strong">Geological Structure &amp; Discontinuities</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Joint planes and existing natural fractures bleed off shock energy and guide block breakaways.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <Slider
                  label="In-Situ Fracture Density"
                  value={simParams.geologicalConditions.fractureLevel}
                  min={0}
                  max={100}
                  unit="/100"
                  lowLabel="Massive / Tight"
                  highLabel="Intensely Jointed"
                  tooltip="Higher fracture levels reduce specific explosive energy required but increase overbreak risk."
                  onChange={(v) => updateParam('geologicalConditions', 'fractureLevel', v)}
                />

                <Slider
                  label="Weathering Degradation"
                  value={simParams.geologicalConditions.weatheringLevel}
                  min={0}
                  max={100}
                  unit="/100"
                  lowLabel="Unaltered"
                  highLabel="Decomposed"
                  tooltip="Micro-cracking from weathering reduces rock compressive and shear strength."
                  onChange={(v) => updateParam('geologicalConditions', 'weatheringLevel', v)}
                />
              </div>
            </div>

            <div className="divider" />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div>
                <label className="label">Dominant Joint Set Orientation</label>
                <select
                  value={simParams.geologicalConditions.jointOrientation}
                  onChange={(e) =>
                    updateParam(
                      'geologicalConditions',
                      'jointOrientation',
                      e.target.value as JointOrientation
                    )
                  }
                  className="select"
                >
                  <option value="horizontal">Horizontal Bedding (Favorable heaving)</option>
                  <option value="vertical">Vertical Joints (Prone to back-break)</option>
                  <option value="inclined">Inclined / Dipping into pit (Optimal release)</option>
                  <option value="random">Random / Chaotic Orthogonal Sets</option>
                </select>
                <span className="helper-text">
                  Orientation governs whether shockwaves reflect cleanly off the free face.
                </span>
              </div>

              <div>
                <label className="label">Groundwater Infiltration</label>
                <div className="toolbar-segmented" style={{ width: '100%' }}>
                  {(['dry', 'damp', 'wet', 'saturated'] as WaterPresence[]).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => updateParam('geologicalConditions', 'waterPresence', w)}
                      className={simParams.geologicalConditions.waterPresence === w ? 'active' : ''}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {w}
                    </button>
                  ))}
                </div>
                <span className="helper-text">
                  Saturated boreholes propagate ground vibrations faster and may dilute energy.
                </span>
              </div>
            </div>

            <Slider
              label="Geological Complexity Index"
              value={simParams.geologicalConditions.geologicalComplexity}
              min={0}
              max={100}
              unit="/100"
              lowLabel="Homogeneous Stratum"
              highLabel="Faulted / Variable"
              tooltip="Variance in rock mass properties across the blast bench."
              onChange={(v) => updateParam('geologicalConditions', 'geologicalComplexity', v)}
            />
          </div>
        )}

        {/* STEP 3: Geometry & Borehole Pattern */}
        {step === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h2 className="section-title-strong">Borehole &amp; Pattern Dimensions</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Burden and spacing ratios govern toe displacement, fragmentation sizing, and flyrock risk.
                </p>
              </div>

              <Slider
                label="Borehole Depth"
                value={simParams.geometry.boreholeDepth}
                min={3}
                max={25}
                step={0.5}
                unit=" m"
                lowLabel="3m"
                highLabel="25m"
                tooltip="Total vertical drilled depth including sub-drilling."
                onChange={(v) => updateParam('geometry', 'boreholeDepth', v)}
              />

              <Slider
                label="Burden (Distance to Free Face)"
                value={simParams.geometry.burden}
                min={1.5}
                max={7.0}
                step={0.1}
                unit=" m"
                lowLabel="1.5m"
                highLabel="7.0m"
                tooltip="Distance from borehole center to nearest free rock face."
                onChange={(v) => updateParam('geometry', 'burden', v)}
              />

              <Slider
                label="Borehole Spacing"
                value={simParams.geometry.spacing}
                min={2.0}
                max={9.0}
                step={0.1}
                unit=" m"
                lowLabel="2.0m"
                highLabel="9.0m"
                tooltip="Distance between adjacent drill holes in the same pattern row."
                onChange={(v) => updateParam('geometry', 'spacing', v)}
              />

              <Slider
                label="Bench Height"
                value={simParams.geometry.benchHeight}
                min={4}
                max={24}
                step={0.5}
                unit=" m"
                lowLabel="4m"
                highLabel="24m"
                tooltip="Vertical height of the mining bench wall."
                onChange={(v) => updateParam('geometry', 'benchHeight', v)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Slider
                  label="Number of Holes"
                  value={simParams.geometry.numberOfHoles ?? 10}
                  min={1}
                  max={30}
                  step={1}
                  unit=" holes"
                  lowLabel="1 hole"
                  highLabel="30 holes"
                  tooltip="Total borehole count in the pattern (from field record / LOX dataset)."
                  onChange={(v) => updateParam('geometry', 'numberOfHoles', v)}
                />

                <Slider
                  label="Field Depth (F.T.)"
                  value={simParams.geometry.ft ?? 6.5}
                  min={2}
                  max={15}
                  step={0.5}
                  unit=" m"
                  lowLabel="2m"
                  highLabel="15m"
                  tooltip="Recorded field parameter from mine notes."
                  onChange={(v) => updateParam('geometry', 'ft', v)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Slider
                  label="Charge Length"
                  value={simParams.geometry.chargeZoneLength}
                  min={1}
                  max={simParams.geometry.boreholeDepth}
                  step={0.5}
                  unit=" m"
                  tooltip="Column length occupied by energetic model."
                  onChange={(v) => updateParam('geometry', 'chargeZoneLength', v)}
                />

                <Slider
                  label="Hole Diameter"
                  value={simParams.geometry.boreholeDiameter}
                  min={76}
                  max={250}
                  step={2}
                  unit=" mm"
                  tooltip="Drill bit diameter."
                  onChange={(v) => updateParam('geometry', 'boreholeDiameter', v)}
                />
              </div>
            </div>

            {/* Live Cross Section Diagram */}
            <div className="panel" style={{ background: 'var(--color-surface-2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Live Cross-Section Diagram
                </span>
                <span className="badge badge-gray" style={{ fontFamily: 'monospace' }}>
                  {simParams.geometry.burden}m B x {simParams.geometry.spacing}m S
                </span>
              </div>
              <div style={{ height: '260px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GeometryDiagram geometry={simParams.geometry} />
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Drill depth, explosive charge zone, stemming zone, and burden standoff.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Energy Model */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 className="section-title-strong">Abstract Energetic &amp; Confinement Model</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Configure simulated chemical shock potential and stemming confinement efficiency.
              </p>
            </div>

            <div className="info-panel info-panel-blue">
              <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '0.8125rem' }}>
                Energy Level is a dimensionless mathematical simulation parameter (0-100) used for comparative scenario modeling. It does not reflect real-world explosive weights or operational recipes.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <Slider
                label="Simulated Energy Level"
                value={simParams.energyModel.energyLevel}
                min={20}
                max={100}
                unit="/100"
                lowLabel="Low Energy"
                highLabel="Intense Shock Energy"
                tooltip="Relative energy index governing peak shockwave magnitude and fragment velocity."
                onChange={(v) => updateParam('energyModel', 'energyLevel', v)}
              />

              <Slider
                label="O₂ / Oxygen Quantity"
                value={simParams.energyModel.oxygenQuantityKg ?? 520}
                min={100}
                max={1500}
                step={20}
                unit=" kg"
                lowLabel="100 kg"
                highLabel="1500 kg"
                tooltip="Oxygen quantity recorded in LOX field notes (cases 4-6)."
                onChange={(v) => updateParam('energyModel', 'oxygenQuantityKg', v)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <Slider
                label="Stemming Confinement Quality"
                value={simParams.energyModel.confinementLevel}
                min={20}
                max={100}
                unit="/100"
                lowLabel="Weak Stemming (Blowouts)"
                highLabel="Optimal Gas Trapping"
                tooltip="Higher confinement retains expanding gas pressure inside borehole for thorough rock fracturing."
                onChange={(v) => updateParam('energyModel', 'confinementLevel', v)}
              />

              <Slider
                label="Initiation Synchronization"
                value={simParams.energyModel.initiationQuality}
                min={20}
                max={100}
                unit="/100"
                lowLabel="Scattered Timing"
                highLabel="Microsecond Precision"
                tooltip="Reflects electronic delay timing uniformity and waveform superposition."
                onChange={(v) => updateParam('energyModel', 'initiationQuality', v)}
              />
            </div>

            <div>
              <label className="label">Energy Distribution Profile</label>
              <div className="toolbar-segmented" style={{ width: '100%', maxWidth: '420px' }}>
                {(['uniform', 'concentrated', 'graduated'] as EnergyDistribution[]).map((dist) => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => updateParam('energyModel', 'energyDistribution', dist)}
                    className={simParams.energyModel.energyDistribution === dist ? 'active' : ''}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Environmental & Launch */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 className="section-title-strong">Environmental Conditions &amp; Scenario Details</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Finalize scenario metadata and ambient site conditions prior to simulation execution.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div>
                <label className="label">Scenario Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. North Pit Bench 42 Cut"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Description / Engineering Notes</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. High energy test for secondary fragmentation reduction"
                  className="input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div>
                <label className="label">Ambient Temperature (°C)</label>
                <input
                  type="number"
                  min={-30}
                  max={50}
                  value={simParams.environmentalConditions.temperature}
                  onChange={(e) =>
                    updateParam(
                      'environmentalConditions',
                      'temperature',
                      Number(e.target.value)
                    )
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="label">Observed Weather</label>
                <select
                  value={simParams.environmentalConditions.weather ?? 'Clear'}
                  onChange={(e) =>
                    updateParam(
                      'environmentalConditions',
                      'weather',
                      e.target.value
                    )
                  }
                  className="select"
                >
                  <option value="Clear">Clear (assumed)</option>
                  <option value="Partly cloudy">Partly Cloudy (assumed)</option>
                  <option value="Overcast">Overcast</option>
                  <option value="Rain">Rain / Sleet</option>
                </select>
              </div>

              <div>
                <label className="label">Wind Condition</label>
                <select
                  value={simParams.environmentalConditions.windCondition ?? 'Light wind'}
                  onChange={(e) =>
                    updateParam(
                      'environmentalConditions',
                      'windCondition',
                      e.target.value
                    )
                  }
                  className="select"
                >
                  <option value="Calm">Calm (&lt; 5 km/h)</option>
                  <option value="Light wind">Light Wind (assumed, 5-15 km/h)</option>
                  <option value="Moderate">Moderate Breeze (15-25 km/h)</option>
                  <option value="Strong">Strong Gusts (&gt; 25 km/h)</option>
                </select>
              </div>

              <div>
                <label className="label">Pit Floor Ground Condition</label>
                <select
                  value={simParams.environmentalConditions.groundCondition}
                  onChange={(e) =>
                    updateParam(
                      'environmentalConditions',
                      'groundCondition',
                      e.target.value as GroundCondition
                    )
                  }
                  className="select"
                >
                  <option value="dry">Dry / Compacted</option>
                  <option value="damp">Damp / Loose Mud</option>
                  <option value="wet">Standing Water / Muck</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Calculation Algorithm Mode</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {([
                  ['standard', 'Standard Predictive', 'Balanced empirical weighting across rock and energy.'],
                  ['conservative', 'Conservative Envelope', 'Increases vibration risk factor and safety buffer.'],
                  ['research', 'Sensitivity Mode', 'Exposes non-linear coupling effects for research.'],
                ] as const).map(([modeKey, modeTitle, modeDesc]) => (
                  <button
                    key={modeKey}
                    type="button"
                    onClick={() =>
                      updateParam('environmentalConditions', 'simulationMode', modeKey as SimulationMode)
                    }
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: simParams.environmentalConditions.simulationMode === modeKey
                        ? '2px solid var(--color-primary)'
                        : '1px solid var(--color-border)',
                      background: simParams.environmentalConditions.simulationMode === modeKey
                        ? 'var(--color-primary-light)'
                        : 'var(--color-surface)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: simParams.environmentalConditions.simulationMode === modeKey ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      marginBottom: '4px',
                    }}>
                      {modeTitle}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                      {modeDesc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Configuration Summary */}
            <div className="panel" style={{ background: 'var(--color-surface-2)', padding: '16px 20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em', marginBottom: '12px' }}>
                Pre-Launch Configuration Summary
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Lithology</span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
                    {simParams.rockProperties.rockType.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Strength Index</span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                    {simParams.rockProperties.strengthIndex}/100
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Burden x Spacing</span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                    {simParams.geometry.burden}m x {simParams.geometry.spacing}m
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Energy Index</span>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                    {simParams.energyModel.energyLevel}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Sticky Live Simulation Viewport */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '80px' }}>
        <div className="panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="text-eyebrow" style={{ margin: 0 }}>Live Reactive Viewport</span>
              <h3 style={{ margin: '2px 0 0', fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Continuous Blast Preview
              </h3>
            </div>
            <span className="badge badge-green" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)' }} />
              Real-Time Sync Active
            </span>
          </div>

          {/* Continuous Real-Time Blast Canvas */}
          <BlastCanvas params={simParams} />

          {/* Live Metrics Grid Under Canvas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', paddingTop: '4px' }}>
            <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--color-surface-2)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Lithology</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
                {simParams.rockProperties.rockType.replace('_', ' ')}
              </span>
            </div>
            <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--color-surface-2)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Burden x Spacing</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                {simParams.geometry.burden}m x {simParams.geometry.spacing}m
              </span>
            </div>
            <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--color-surface-2)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Holes / O₂ (kg)</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                {simParams.geometry.numberOfHoles ?? 10} / {simParams.energyModel.oxygenQuantityKg ?? 520}kg
              </span>
            </div>
            <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--color-surface-2)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>Energy Level</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                {simParams.energyModel.energyLevel}%
              </span>
            </div>
          </div>

          {/* Live ML Prediction Panel */}
          <div style={{
            background: 'rgba(37, 99, 235, 0.04)',
            border: '1px solid rgba(37, 99, 235, 0.15)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginTop: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                ML Live Prediction (LOX Model)
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                Training: {mlPrediction.trainingCasesCount} Cases
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ background: 'var(--color-surface)', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>Fragmentation</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: mlPrediction.fragmentation === 'Fine' ? '#10b981' : mlPrediction.fragmentation === 'Fine-to-Medium' ? '#3b82f6' : mlPrediction.fragmentation === 'Medium' ? '#f59e0b' : '#ef4444' }}>
                  {mlPrediction.fragmentation}
                </span>
              </div>
              <div style={{ background: 'var(--color-surface)', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>Muckpile Spread</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {mlPrediction.muckpileCoverage}
                </span>
              </div>
              <div style={{ background: 'var(--color-surface)', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>Dust Tendency</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: mlPrediction.dustTendency === 'High' ? '#ef4444' : mlPrediction.dustTendency === 'Moderate' ? '#f59e0b' : '#10b981' }}>
                  {mlPrediction.dustTendency}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.6875rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700 }}>Notice:</span> Current predictions trained on initial LOX Blast dataset (Cases 4, 5, 6). Model updates dynamically with new blast logs.
            </div>
          </div>
        </div>

        {/* Navigation & Action Bar */}
        <div className="panel" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="btn btn-secondary"
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            {step < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
              >
                Next Step ({STEPS[step].label})
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRun}
                className="btn btn-primary"
                style={{ padding: '10px 22px' }}
              >
                <Zap size={16} />
                Launch Full Simulation Workspace
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function NewSimulationPage() {
  return (
    <Suspense fallback={<div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading simulation wizard...</div>}>
      <NewSimulationInner />
    </Suspense>
  );
}
