'use client';

import { HelpCircle } from 'lucide-react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  tooltip?: string;
  onChange: (val: number) => void;
  formatValue?: (val: number) => string;
  lowLabel?: string;
  highLabel?: string;
  colorClass?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  tooltip,
  onChange,
  formatValue,
  lowLabel = 'Low',
  highLabel = 'High',
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : `${value}${unit}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label className="label" style={{ margin: 0 }}>{label}</label>
          {tooltip && (
            <div className="tooltip-container">
              <HelpCircle size={14} style={{ color: 'var(--color-text-muted)', cursor: 'help' }} />
              <div className="tooltip-content">{tooltip}</div>
            </div>
          )}
        </div>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--color-primary)',
          fontFamily: 'monospace',
          background: 'var(--color-primary-light)',
          padding: '2px 8px',
          borderRadius: '6px',
        }}>{display}</span>
      </div>

      <div style={{ position: 'relative', paddingBottom: '2px' }}>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', height: '6px', margin: 0 }}
        />
      </div>

      {(lowLabel || highLabel) && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{lowLabel}</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{highLabel}</span>
        </div>
      )}
    </div>
  );
}