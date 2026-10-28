'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Zap, History, BarChart2, FileText,
  Database, HelpCircle, Settings, X
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'WORKSPACE',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/simulation/new', label: 'New Simulation', icon: Zap },
      { href: '/history', label: 'History', icon: History },
    ],
  },
  {
    label: 'ANALYSIS',
    items: [
      { href: '/compare', label: 'Compare', icon: BarChart2 },
      { href: '/reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    label: 'REFERENCE',
    items: [
      { href: '/dataset', label: 'Dataset', icon: Database },
      { href: '/help', label: 'Help & Docs', icon: HelpCircle },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`app-sidebar${isOpen ? ' open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ flex: 1 }}>
          <div className="sidebar-logo-text">⚡ Blast Lab</div>
          <span className="sidebar-logo-sub">Simulation Platform</span>
        </div>
        <button
          onClick={onClose}
          type="button"
          aria-label="Close sidebar"
          style={{
            display: 'none',
            padding: '4px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            borderRadius: '4px',
          }}
          className="sidebar-close-btn"
        >
          <X size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <span className="sidebar-section-label">{section.label}</span>
            {section.items.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`sidebar-nav-link${isActive ? ' active' : ''}`}
                >
                  <Icon size={16} style={{ flexShrink: 0, opacity: 0.8 }} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <span className="sidebar-footer-text">Virtual Mode Only</span>
        <span className="sidebar-footer-sub">
          Educational models. Not for real-world blast operations.
        </span>
      </div>
    </aside>
  );
}
