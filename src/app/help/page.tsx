'use client';

import { HelpCircle, ShieldAlert, BookOpen, Layers } from 'lucide-react';

const FAQS = [
  { q: 'What is the Virtual Mining Blast Lab?', a: 'An educational and engineering decision-support simulation environment designed for exploring virtual bench blast physics, fracture mechanics, and geometric parameter sensitivities. It does not interface with or trigger physical machinery.' },
  { q: 'How is fragmentation sizing estimated?', a: 'The engine applies an adapted Kuz-Ram fragmentation model parameterized by rock compressive strength index, specific drill hole charge length, bench burden/spacing aspect ratio, and simulated explosive confinement quality.' },
  { q: 'What does the Energy Level parameter represent?', a: 'Energy Level is a dimensionless mathematical simulation parameter (0–100) scaled to represent relative energetic potential. It allows comparative evaluation between light toe-trimming cuts and deep production bench shots.' },
  { q: 'Can I export scenarios and reports?', a: 'Yes. Any evaluated scenario can be exported as a structured report or compared against up to 3 alternate configurations via the Multivariate Compare module.' },
  { q: 'How does groundwater affect the simulation?', a: 'Water presence increases ground acoustic impedance coupling, elevating vibration risk ratings while modifying gas pressure retention efficiency.' },
  { q: 'How do I load pre-configured benchmarks?', a: 'Click \"Load Demo\" on the main Dashboard to immediately instantiate a calibrated Granite benchmark bench model.' },
];

export default function HelpPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div>
          <span className="text-eyebrow">User Guide &amp; Reference</span>
          <h1 className="h2" style={{ margin: '4px 0 6px' }}>Documentation &amp; Formulae</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Overview of empirical physics assumptions, terminology definitions, and computational boundaries.
          </p>
        </div>
      </div>

      {/* Safety Warning */}
      <div className="info-panel info-panel-amber">
        <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ display: 'block', marginBottom: '2px' }}>Operational Safety Disclaimer</strong>
          <span style={{ fontSize: '0.8125rem' }}>
            Virtual Mining Blast Lab is strictly for educational simulation and qualitative engineering comparison. Never apply raw numerical outputs directly to commercial explosives loading or field blast design without licensed engineer sign-off.
          </span>
        </div>
      </div>

      {/* FAQs */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <h2 className="section-title-strong" style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} color="var(--color-primary)" />
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {FAQS.map(({ q, a }) => (
            <div
              key={q}
              style={{
                padding: '16px 18px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
              }}
            >
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--color-text-primary)' }}>
                {q}
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
