'use client';

import { Check } from 'lucide-react';
import type { RockType } from '@/lib/types';

interface RockData {
  id: RockType;
  name: string;
  strength: string;
  icon: string;
  color: string;
  ucs: string;
}

interface RockCardProps {
  rock?: RockData;
  id?: RockType;
  name?: string;
  strength?: string;
  icon?: string;
  color?: string;
  ucs?: string;
  selected: boolean;
  onClick: () => void;
}

export function RockCard(props: RockCardProps) {
  const { rock, selected, onClick } = props;
  const name = rock ? rock.name : props.name;
  const strength = rock ? rock.strength : props.strength;
  const icon = rock ? rock.icon : props.icon;
  const ucs = rock ? rock.ucs : props.ucs;
  const color = rock?.color ?? '#2563EB';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 10px',
        borderRadius: '12px',
        border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        background: selected ? 'var(--color-primary-light)' : 'var(--color-surface)',
        cursor: 'pointer',
        width: '100%',
        transition: 'all 150ms ease',
        textAlign: 'center',
        boxShadow: selected ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
      }}
    >
      {selected && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '20px',
          height: '20px',
          background: 'var(--color-primary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Check size={12} color="white" strokeWidth={3} />
        </div>
      )}
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        background: `${color}22`,
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: selected ? 'var(--color-primary)' : 'var(--color-text-primary)',
          marginBottom: '2px',
        }}>{name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{strength}</div>
        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>{ucs}</div>
      </div>
    </button>
  );
}
