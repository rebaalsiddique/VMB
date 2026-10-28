'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadScenarios, duplicateScenario, createScenario } from '@/lib/store';
import { DEMO_PARAMS } from '@/data/demo-scenario';
import type { Scenario } from '@/lib/types';
import {
  Zap, BarChart2, FileText, Database, HelpCircle,
  Copy, ExternalLink, GitCompare, TrendingUp, Activity, Target, Layers
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  const simulated = scenarios.filter((s) => s.results != null);
  const avgEff = simulated.length
    ? Math.round(simulated.reduce((a, s) => a + (s.results?.efficiencyScore ?? 0), 0) / simulated.length)
    : 0;
  const avgIntensity = simulated.length
    ? Math.round(simulated.reduce((a, s) => a + (s.results?.intensityIndex ?? 0), 0) / simulated.length)
    : 0;

  const recentScenarios = scenarios.slice(0, 6);

  function handleLoadDemo() {
    const demo = createScenario(
      'Granite Bench Demo Model',
      'Automated baseline benchmark with high-strength granite and standard burden geometry.',
      DEMO_PARAMS
    );
    router.push(`/simulation/${demo.id}?autorun=true`);
  }

  function handleDuplicate(id: string) {
    duplicateScenario(id);
    setScenarios(loadScenarios());
  }

  const kpiCards = [
    { label: 'Total Scenarios', value: scenarios.length, sub: 'all saved models', icon: Layers, color: '#2563EB', bg: '#DBEAFE' },
    { label: "Simulated Models", value: simulated.length, sub: (scenarios.length > 0 ? String(Math.round((simulated.length / scenarios.length) * 100)) : "0") + "% complete", icon: Activity, color: "#0D9488", bg: "#CCFBF1" },
    { label: "Avg. Efficiency", value: String(avgEff) + "%", sub: "across simulations", icon: TrendingUp, color: "#16A34A", bg: "#DCFCE7" },
    { label: 'Avg. Intensity', value: avgIntensity, sub: 'relative index /100', icon: Target, color: '#D97706', bg: '#FEF3C7' },
  ];

  const quickActions = [
    { href: '/simulation/new', icon: Zap, label: 'New Simulation', desc: '5-step geological & geometry wizard', color: '#2563EB', bg: '#DBEAFE' },
    { href: '/compare', icon: GitCompare, label: 'Compare Models', desc: 'Side-by-side scenario analysis', color: '#0D9488', bg: '#CCFBF1' },
    { href: '/reports', icon: FileText, label: 'Technical Reports', desc: 'Export dataset summaries as PDF', color: '#7C3AED', bg: '#EDE9FE' },
    { href: '/dataset', icon: Database, label: 'Rock Properties', desc: 'UCS, density, and blastability table', color: '#D97706', bg: '#FEF3C7' },
    { href: '/history', icon: BarChart2, label: 'History', desc: 'Browse and manage saved scenarios', color: '#16A34A', bg: '#DCFCE7' },
    { href: '/help', icon: HelpCircle, label: 'Documentation', desc: 'Engineering terms and model limits', color: '#64748B', bg: '#F1F5F9' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero */}
      <div className="page-hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <span className="text-eyebrow">Engineering Simulation Platform</span>
            <h1 className="page-title">Virtual Mining Blast Lab</h1>
            <p className="page-subtitle">
              Model virtual rock bench fracture, energy propagation, and fragmentation mechanics.
              Adjust geological, geometrical, and energetic parameters to evaluate simulated blast efficiency and safety envelopes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
            <Link href="/simulation/new" className="btn btn-primary">
              <Zap size={15} />
              New Simulation
            </Link>
            <button type="button" onClick={handleLoadDemo} className="btn btn-secondary">
              Load Demo
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="kpi-card">
              <div className="kpi-icon" style={{ background: kpi.bg }}>
                <Icon size={22} color={kpi.color} />
              </div>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="kpi-sub">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Quick Actions */}
        <div className="panel">
          <h3 className="section-title" style={{ marginBottom: '14px' }}>Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="quick-action-card">
                  <div className="quick-action-icon" style={{ background: action.bg }}>
                    <Icon size={18} color={action.color} />
                  </div>
                  <div>
                    <div className="quick-action-title">{action.label}</div>
                    <div className="quick-action-desc">{action.desc}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Scenarios */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Recent Scenarios</h3>
            <Link href="/history" className="btn btn-ghost btn-sm">
              View all ({scenarios.length}) →
            </Link>
          </div>

          {recentScenarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-muted)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No simulation scenarios found.</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8125rem' }}>
                <Link href="/simulation/new" style={{ color: 'var(--color-primary)' }}>Create your first model</Link>
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentScenarios.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.scenarioName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {s.params.rockProperties.rockType.replace('_', ' ')} · {s.params.geometry.benchHeight}m bench
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                    {s.results ? (
                      <span className="badge badge-green">{s.results.efficiencyScore}% eff.</span>
                    ) : (
                      <span className="badge badge-gray">Draft</span>
                    )}
                    <Link href={"/simulation/" + s.id} className="btn btn-ghost btn-sm" style={{ padding: "4px 8px" }}>
                      <ExternalLink size={13} />
                    </Link>
                    <button type="button" onClick={() => handleDuplicate(s.id)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="info-panel info-panel-amber">
        <span style={{ fontSize: '1rem' }}>⚠️</span>
        <p style={{ margin: 0, fontSize: '0.8125rem' }}>
          <strong>Educational Simulation Environment:</strong> All calculations and visualizations use abstract engineering approximations.
          This software is strictly for training and scenario evaluation. Never use for field explosives loading or blasting execution.
        </p>
      </div>
    </div>
  );
}
