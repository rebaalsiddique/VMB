'use client';

import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Layers,
  Cpu,
  BookOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Search,
  Sliders,
  Download,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  OBSERVED_RECORDS,
  SYNTHETIC_RECORDS,
  ALL_RECORDS,
  DATA_DICTIONARY_ENTRIES,
  README_NOTES,
  type BlastDatasetRecord,
} from '@/data/virtual-blast-dataset';
import {
  TRAINED_MODEL_METADATA,
  predictOxygenRequirement,
  type OxygenPredictionResult,
} from '@/lib/trained-model';

type TabKey = 'observed' | 'synthetic' | 'all' | 'dictionary' | 'model';

export default function DatasetPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('observed');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'observed' | 'synthetic'>('all');

  // Interactive Live Model Inference Playground State
  const [testHoles, setTestHoles] = useState(10);
  const [testDepth, setTestDepth] = useState(9.0);
  const [testTube, setTestTube] = useState<number | ''>(6.5);

  const interactivePrediction: OxygenPredictionResult = useMemo(() => {
    return predictOxygenRequirement({
      numberOfHoles: testHoles,
      depthM: testDepth,
      tubeLengthM: testTube === '' ? null : Number(testTube),
    });
  }, [testHoles, testDepth, testTube]);

  // Filtered dataset records
  const filteredRecords = useMemo(() => {
    let source = ALL_RECORDS;
    if (activeTab === 'observed') source = OBSERVED_RECORDS;
    else if (activeTab === 'synthetic') source = SYNTHETIC_RECORDS;
    else if (activeTab === 'all') {
      if (sourceFilter === 'observed') source = OBSERVED_RECORDS;
      else if (sourceFilter === 'synthetic') source = SYNTHETIC_RECORDS;
    }

    if (!searchQuery.trim()) return source;
    const q = searchQuery.toLowerCase();
    return source.filter(
      (r) =>
        r.recordId.toString().includes(q) ||
        (r.date && r.date.toLowerCase().includes(q)) ||
        r.dataSource.toLowerCase().includes(q) ||
        r.numberOfHoles.toString().includes(q) ||
        r.depthM.toString().includes(q)
    );
  }, [activeTab, searchQuery, sourceFilter]);

  const handleExportCSV = (records: BlastDatasetRecord[], filename: string) => {
    const headers = [
      'Record_ID',
      'Date',
      'No_of_Holes',
      'Depth_m',
      'Tube_Length_m',
      'Oxygen_kg',
      'Total_Depth_m',
      'Price_PKR',
      'Data_Source',
    ];
    const rows = records.map((r) => [
      r.recordId,
      r.date ?? '',
      r.numberOfHoles,
      r.depthM,
      r.tubeLengthM ?? '',
      r.oxygenKg,
      r.totalDepthM,
      r.pricePkr,
      r.dataSource,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header Card */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="text-eyebrow" style={{ margin: 0 }}>Ground Truth &amp; Training Corpus</span>
              <span className="badge badge-blue" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Excel Unmodified
              </span>
            </div>
            <h1 className="h2" style={{ margin: '4px 0 6px', fontSize: '1.5rem' }}>
              Mining Blast ML Dataset &amp; Model Architecture
            </h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Source: <code style={{ color: 'var(--color-primary)', background: 'var(--color-surface-2)', padding: '2px 6px', borderRadius: '4px' }}>
                Virtual_Mining_Blast_ML_Dataset.xlsx
              </code> — Strict partitioning between field-observed blasts and synthetic development cases.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Corpus Total</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>
                {TRAINED_MODEL_METADATA.totalRecords} Blasts
              </div>
            </div>
            <div style={{ height: '32px', width: '1px', background: 'var(--color-border)' }} />
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="badge badge-green" style={{ fontSize: '11px' }}>
                {TRAINED_MODEL_METADATA.observedCount} Observed
              </span>
              <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                {TRAINED_MODEL_METADATA.syntheticCount} Synthetic
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Provenance Alert Notice */}
      <div className="info-panel info-panel-blue" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#38bdf8' }} />
        <div style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
          <strong>Dataset Provenance &amp; Target Integrity:</strong> 20 observed records were transcribed directly from physical field blast reports (Aug 10 – Sep 25, 2026).
          200 synthetic records were generated strictly for ML development and generalization benchmarking.
          Synthetic records are explicitly distinguished with <code style={{ color: '#f59e0b' }}>Data_Source = synthetic</code> and are never represented as physical field measurements.
        </div>
      </div>

      {/* Tab Navigation Navigation Bar */}
      <div className="panel" style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('observed'); setSearchQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.8125rem',
                fontWeight: activeTab === 'observed' ? 700 : 500,
                background: activeTab === 'observed' ? '#166534' : 'transparent',
                color: activeTab === 'observed' ? '#ffffff' : 'var(--color-text-secondary)',
                border: activeTab === 'observed' ? '1px solid #22c55e' : '1px solid transparent',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={14} />
              Observed Data ({OBSERVED_RECORDS.length})
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('synthetic'); setSearchQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.8125rem',
                fontWeight: activeTab === 'synthetic' ? 700 : 500,
                background: activeTab === 'synthetic' ? '#854d0e' : 'transparent',
                color: activeTab === 'synthetic' ? '#ffffff' : 'var(--color-text-secondary)',
                border: activeTab === 'synthetic' ? '1px solid #eab308' : '1px solid transparent',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <Layers size={14} />
              Synthetic Data ({SYNTHETIC_RECORDS.length})
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.8125rem',
                fontWeight: activeTab === 'all' ? 700 : 500,
                background: activeTab === 'all' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'all' ? '#ffffff' : 'var(--color-text-secondary)',
                border: activeTab === 'all' ? '1px solid var(--color-primary)' : '1px solid transparent',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <FileSpreadsheet size={14} />
              All Data (220)
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('model'); setSearchQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.8125rem',
                fontWeight: activeTab === 'model' ? 700 : 500,
                background: activeTab === 'model' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                color: activeTab === 'model' ? '#60a5fa' : 'var(--color-text-secondary)',
                border: activeTab === 'model' ? '1px solid #3b82f6' : '1px solid transparent',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <Cpu size={14} />
              Trained ML Models &amp; Benchmarks
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('dictionary'); setSearchQuery(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.8125rem',
                fontWeight: activeTab === 'dictionary' ? 700 : 500,
                background: activeTab === 'dictionary' ? 'var(--color-surface-2)' : 'transparent',
                color: activeTab === 'dictionary' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                border: activeTab === 'dictionary' ? '1px solid var(--color-border)' : '1px solid transparent',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <BookOpen size={14} />
              Data Dictionary &amp; README
            </button>
          </div>

          {(activeTab === 'observed' || activeTab === 'synthetic' || activeTab === 'all') && (
            <button
              type="button"
              onClick={() => handleExportCSV(filteredRecords, `${activeTab}_blasts_export.csv`)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
            >
              <Download size={13} />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT: OBSERVED, SYNTHETIC, OR ALL DATA TABLES */}
      {(activeTab === 'observed' || activeTab === 'synthetic' || activeTab === 'all') && (
        <div className="panel" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 className="section-title-strong" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                {activeTab === 'observed' && <CheckCircle2 size={18} color="#22c55e" />}
                {activeTab === 'synthetic' && <Layers size={18} color="#eab308" />}
                {activeTab === 'all' && <FileSpreadsheet size={18} color="var(--color-primary)" />}
                {activeTab === 'observed' && 'Observed Field Blast Records (Sheet: Observed_Data)'}
                {activeTab === 'synthetic' && 'Synthetic Development Records (Sheet: Synthetic_Data)'}
                {activeTab === 'all' && 'Combined Blast Records (Sheet: All_Data)'}
              </h2>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Showing {filteredRecords.length} records • Target: Liquid Oxygen requirement (Oxygen_kg)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {activeTab === 'all' && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setSourceFilter('all')}
                    className={`btn btn-sm ${sourceFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    All (220)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceFilter('observed')}
                    className={`btn btn-sm ${sourceFilter === 'observed' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    Observed (20)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceFilter('synthetic')}
                    className={`btn btn-sm ${sourceFilter === 'synthetic' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '11px', padding: '4px 8px' }}
                  >
                    Synthetic (200)
                  </button>
                </div>
              )}

              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                  style={{ paddingLeft: '30px', fontSize: '0.8125rem', height: '34px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)', maxHeight: '600px', overflowY: 'auto' }}>
            <table className="data-table" style={{ fontSize: '0.8125rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--color-surface-2)', zIndex: 10 }}>
                <tr>
                  <th>Record ID</th>
                  <th>Date</th>
                  <th>Holes</th>
                  <th>Depth (m)</th>
                  <th>Tube Length (m)</th>
                  <th>Oxygen (kg)</th>
                  <th>Total Depth (m)</th>
                  <th>Contract Price</th>
                  <th>Data Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => {
                  const isObs = r.dataSource === 'observed';
                  return (
                    <tr key={r.recordId} style={{ background: isObs ? 'rgba(34, 197, 94, 0.02)' : undefined }}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: isObs ? '#22c55e' : '#eab308' }}>
                          #{r.recordId}
                        </strong>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: r.date ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                        {r.date ?? '—'}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.numberOfHoles}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.depthM.toFixed(1)} m</td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {r.tubeLengthM != null ? (
                          `${r.tubeLengthM.toFixed(1)} m`
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                            {(r.depthM * TRAINED_MODEL_METADATA.imputerTubeToDepthRatio).toFixed(1)} m (imputed)
                          </span>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: '#38bdf8' }}>
                          {r.oxygenKg} kg
                        </strong>
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>{r.totalDepthM.toFixed(1)} m</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                        PKR {Math.round(r.pricePkr).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge ${isObs ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                          {r.dataSource.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TRAINED ML MODELS & BENCHMARKS */}
      {activeTab === 'model' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Model Metric Overview */}
          <div className="panel" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 className="section-title-strong" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Cpu size={18} color="var(--color-primary)" />
                  Trained ML Model Architecture &amp; Benchmarks
                </h2>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Evaluated across 5-fold cross-validation and strict synthetic-to-field domain transfer.
                </p>
              </div>
              <span className="badge badge-green" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Model Weights Active in Simulation
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'var(--color-surface-2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  Field Generalization R²
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e', fontFamily: 'monospace' }}>
                  0.9674
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Gradient Boosting (Trained Syn → Tested Obs)
                </span>
              </div>

              <div style={{ background: 'var(--color-surface-2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  Field Error (MAE)
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                  ±23.2 kg
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Random Forest Mean Absolute Error on real blasts
                </span>
              </div>

              <div style={{ background: 'var(--color-surface-2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  Physics Imputer Ratio
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', fontFamily: 'monospace' }}>
                  0.7222
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  Tube Length / Depth physical median ratio
                </span>
              </div>

              <div style={{ background: 'var(--color-surface-2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  Total Training Cases
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                  220
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  20 Field Records + 200 Synthetic Cases
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Live Inference Tester */}
          <div className="panel" style={{ padding: '20px 24px', background: 'rgba(37, 99, 235, 0.03)', border: '1px solid rgba(37, 99, 235, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="var(--color-primary)" />
                  Live Trained Model Inference Sandbox
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  Execute real-time client inference directly against the trained regression formulation.
                </span>
              </div>
              <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                Zero-Latency Client ML
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="label">Number of Holes ({testHoles})</label>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={testHoles}
                  onChange={(e) => setTestHoles(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="label">Borehole Depth ({testDepth.toFixed(1)} m)</label>
                <input
                  type="range"
                  min={3}
                  max={15}
                  step={0.5}
                  value={testDepth}
                  onChange={(e) => setTestDepth(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label className="label">Tube Length (m, optional)</label>
                <input
                  type="number"
                  placeholder="Auto-impute if blank"
                  value={testTube}
                  onChange={(e) => setTestTube(e.target.value === '' ? '' : Number(e.target.value))}
                  className="input"
                  style={{ height: '34px', fontSize: '0.8125rem' }}
                />
              </div>
            </div>

            {/* Prediction Output Display */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', background: 'var(--color-surface)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  Predicted Oxygen Requirement
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                  {interactivePrediction.predictedOxygenKg} kg
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  90% Interval: [{interactivePrediction.confidenceLowerKg} - {interactivePrediction.confidenceUpperKg} kg]
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  Specific O₂ per Hole / Meter
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                  {interactivePrediction.specificOxygenPerHole} kg/hole
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  {interactivePrediction.specificOxygenPerMeter} kg/meter drilled
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  Derived Blast Price (Contract)
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22c55e', fontFamily: 'monospace' }}>
                  PKR {interactivePrediction.estimatedPricePkr.toLocaleString()}
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  Total Depth: {interactivePrediction.totalDrillDepthM} m
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase' }}>
                  Model Confidence
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: interactivePrediction.modelConfidence === 'High' ? '#22c55e' : '#f59e0b', fontFamily: 'monospace' }}>
                  {interactivePrediction.modelConfidence}
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  {interactivePrediction.wasImputed ? 'Tube length was imputed' : 'Field geometry within envelope'}
                </span>
              </div>
            </div>
          </div>

          {/* Model Performance Comparison Table */}
          <div className="panel" style={{ padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700 }}>
              Cross-Validation Performance by Data Partition
            </h3>

            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)', marginBottom: '20px' }}>
              <table className="data-table" style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Model Architecture</th>
                    <th>Observed Only (N=20) R²</th>
                    <th>Observed MAE (kg)</th>
                    <th>Synthetic (N=200) R²</th>
                    <th>Combined (N=220) R²</th>
                    <th>Generalization R² (Syn→Obs)</th>
                    <th>Field Generalization MAE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Gradient Boosting</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>0.756 ± 0.16</td>
                    <td style={{ fontFamily: 'monospace' }}>51.0 kg</td>
                    <td style={{ fontFamily: 'monospace' }}>0.839 ± 0.06</td>
                    <td style={{ fontFamily: 'monospace' }}>0.861 ± 0.03</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#22c55e' }}>0.9674</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#22c55e' }}>24.65 kg</td>
                  </tr>
                  <tr>
                    <td><strong>Random Forest</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>0.791 ± 0.16</td>
                    <td style={{ fontFamily: 'monospace' }}>55.3 kg</td>
                    <td style={{ fontFamily: 'monospace' }}>0.852 ± 0.06</td>
                    <td style={{ fontFamily: 'monospace' }}>0.864 ± 0.04</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#22c55e' }}>0.9633</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#22c55e' }}>23.22 kg</td>
                  </tr>
                  <tr>
                    <td><strong>Ridge Regression</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>0.609 ± 0.27</td>
                    <td style={{ fontFamily: 'monospace' }}>68.5 kg</td>
                    <td style={{ fontFamily: 'monospace' }}>0.796 ± 0.04</td>
                    <td style={{ fontFamily: 'monospace' }}>0.804 ± 0.03</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>0.8681</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>49.98 kg</td>
                  </tr>
                  <tr>
                    <td><strong>Linear Regression</strong></td>
                    <td style={{ fontFamily: 'monospace', color: '#ef4444' }}>-2.527 (overfit)</td>
                    <td style={{ fontFamily: 'monospace' }}>210.7 kg</td>
                    <td style={{ fontFamily: 'monospace' }}>0.796 ± 0.04</td>
                    <td style={{ fontFamily: 'monospace' }}>0.802 ± 0.03</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>0.8668</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>49.73 kg</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Feature Importance Rankings */}
            <h3 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 700 }}>
              Physical Feature Importance Rankings (Tree Ensemble)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
              {Object.entries(TRAINED_MODEL_METADATA.featureImportance).map(([feat, imp], idx) => {
                const pct = (imp * 100).toFixed(1);
                return (
                  <div key={feat} style={{ background: 'var(--color-surface-2)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {idx + 1}. <code>{feat}</code>
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                        {pct}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DATA DICTIONARY & README */}
      {activeTab === 'dictionary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Data Dictionary */}
          <div className="panel" style={{ padding: '20px 24px' }}>
            <h2 className="section-title-strong" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <BookOpen size={18} color="var(--color-primary)" />
              Dataset Parameter Dictionary (Sheet: Data_Dictionary)
            </h2>
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <table className="data-table" style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>Engineering Meaning</th>
                    <th>Usage &amp; Modeling Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_DICTIONARY_ENTRIES.map((entry) => (
                    <tr key={entry.column}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                          {entry.column}
                        </strong>
                      </td>
                      <td style={{ fontWeight: 500 }}>{entry.meaning}</td>
                      <td style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* README Guidance */}
          <div className="panel" style={{ padding: '20px 24px' }}>
            <h2 className="section-title-strong" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Info size={18} color="#38bdf8" />
              Dataset Notes &amp; Provenance Guidelines (Sheet: README)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {README_NOTES.map((note, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '10px 14px',
                    background: 'var(--color-surface-2)',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {idx + 1}.
                  </span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
