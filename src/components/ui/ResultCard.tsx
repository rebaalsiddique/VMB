'use client';

import type { RiskLevel, FragmentationScore } from '@/lib/types';

interface ResultCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  highlight?: boolean;
  accentColor?: string;
}

export function ResultCard({ title, value, unit, subtitle, accentColor = 'var(--color-primary)' }: ResultCardProps) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '16px 18px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '8px',
      }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: accentColor,
          lineHeight: 1,
        }}>{value}</span>
        {unit && <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{unit}</span>}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{subtitle}</div>
      )}
    </div>
  );
}

interface RiskBadgeProps {
  level: RiskLevel | FragmentationScore | string;
  label?: string;
}

export function RiskBadge({ level, label }: RiskBadgeProps) {
  const norm = String(level).toLowerCase();
  const displayLabel = label ?? String(level);

  const colorMap: Record<string, string> = {
    low: 'badge-green',
    medium: 'badge-amber',
    high: 'badge-red',
    critical: 'risk-badge-critical',
  };
  const cls = colorMap[norm] ?? 'badge-gray';

  return <span className={`badge ${cls}`}>{displayLabel}</span>;
}

interface ScoreRingProps {
  value: number;
  max?: number;
  size?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
}

export function ScoreRing({ value, max = 100, label, showValue = true, color = 'var(--color-primary)' }: ScoreRingProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const r = 36;
  const circ = 2 * Math.PI * r;
  const stroke = circ * (1 - pct / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div style={{ position: 'relative', width: '90px', height: '90px' }}>
        <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="45" cy="45" r={r} fill="none" stroke="var(--color-border)" strokeWidth="7" />
          <circle
            cx="45" cy="45" r={r} fill="none"
            stroke={color} strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={stroke}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 600ms ease' }}
          />
        </svg>
        {showValue && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color,
          }}>
            {Math.round(value)}
          </div>
        )}
      </div>
      {label && <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center' }}>{label}</span>}
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ value, max = 100, color = 'var(--color-primary)', height = 6, showLabel, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
          {showLabel && <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{ width: '100%', height: `${height}px`, background: 'var(--color-surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 400ms ease' }} />
      </div>
    </div>
  );
}