'use client';

import Link from 'next/link';
import { Menu, Settings } from 'lucide-react';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onMenuToggle}
          type="button"
          className="menu-toggle"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <div className="header-brand">Virtual Mining Blast Lab</div>
          <div className="header-brand-sub">Engineering Simulation Platform</div>
        </div>
      </div>

      <div className="header-status">
        <div className="status-dot" />
        <span className="header-status-text">Simulation Online</span>
        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            padding: '6px 10px',
            borderRadius: '6px',
            transition: 'background 150ms ease',
          }}
          className="btn btn-ghost btn-sm"
        >
          <Settings size={14} />
          Settings
        </Link>
      </div>
    </header>
  );
}
