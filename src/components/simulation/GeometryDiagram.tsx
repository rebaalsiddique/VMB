'use client';

import { useEffect, useRef } from 'react';
import type { Geometry } from '@/lib/types';

interface GeometryDiagramProps {
  geometry: Geometry;
  energyLevel?: number;
  showEnergyZone?: boolean;
}

export function GeometryDiagram({ geometry, energyLevel = 50, showEnergyZone = true }: GeometryDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Scale factors — map real dimensions to canvas pixels
    const maxRealW = geometry.spacing * 3 + geometry.burden * 2;
    const maxRealH = geometry.benchHeight * 1.4;
    const scaleX = (W - 60) / maxRealW;
    const scaleY = (H - 60) / maxRealH;
    const scale = Math.min(scaleX, scaleY);

    const groundY = 45;
    const benchBottom = groundY + geometry.benchHeight * scale;

    // Ground/sky gradient (Light mode sky)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, 'rgba(241, 245, 249, 0)');
    skyGrad.addColorStop(1, 'rgba(226, 232, 240, 0.4)');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, groundY);

    // Rock bench (Light mode rock mass)
    const rockGrad = ctx.createLinearGradient(0, groundY, 0, benchBottom);
    rockGrad.addColorStop(0, '#cbd5e1'); // Slate 300
    rockGrad.addColorStop(0.4, '#94a3b8'); // Slate 400
    rockGrad.addColorStop(1, '#64748b'); // Slate 500
    ctx.fillStyle = rockGrad;
    ctx.fillRect(0, groundY, W, benchBottom - groundY);

    // Rock texture dots (Dark dots for light mode)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
    for (let i = 0; i < 40; i++) {
      const rx = Math.sin(i * 13.7) * W * 0.45 + W / 2;
      const ry = Math.sin(i * 7.3) * (benchBottom - groundY) * 0.45 + groundY + (benchBottom - groundY) * 0.5;
      ctx.beginPath();
      ctx.arc(rx, ry, 3 + Math.sin(i) * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground surface line
    ctx.strokeStyle = '#475569'; // Slate 600
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(W, groundY);
    ctx.stroke();

    // Floor line
    ctx.strokeStyle = '#94a3b8'; // Slate 400
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, benchBottom);
    ctx.lineTo(W, benchBottom);
    ctx.stroke();

    // Free face (right side)
    ctx.strokeStyle = '#475569'; // Slate 600
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W - 12, groundY);
    ctx.lineTo(W - 12, benchBottom);
    ctx.stroke();

    // Draw boreholes (3 visible)
    const numHoles = 3;
    const startX = 40;
    const holeSpacing = geometry.spacing * scale;

    for (let i = 0; i < numHoles; i++) {
      const hx = startX + i * holeSpacing;
      if (hx > W - 30) continue;

      const holeDepth = geometry.boreholeDepth * scale;
      const chargeLen = geometry.chargeZoneLength * scale;
      const holeRadius = Math.max(3, (geometry.boreholeDiameter / 300) * 8);
      const holeTop = groundY;
      const holeBottom = Math.min(holeTop + holeDepth, benchBottom - 4);
      const chargeBottom = holeBottom;
      const chargeTop = Math.max(holeTop + 2, chargeBottom - chargeLen);

      // Borehole shaft
      ctx.fillStyle = '#f8fafc'; // Slate 50
      ctx.fillRect(hx - holeRadius / 2, holeTop, holeRadius, holeBottom - holeTop);
      ctx.strokeStyle = '#475569'; // Slate 600
      ctx.lineWidth = 0.5;
      ctx.strokeRect(hx - holeRadius / 2, holeTop, holeRadius, holeBottom - holeTop);

      // Energy zone (charge column)
      if (showEnergyZone) {
        const energyAlpha = 0.4 + (energyLevel / 100) * 0.5;
        const energyGrad = ctx.createLinearGradient(hx, chargeTop, hx, chargeBottom);
        energyGrad.addColorStop(0, `rgba(245, 158, 11, ${energyAlpha * 0.6})`); // Amber 500
        energyGrad.addColorStop(0.5, `rgba(234, 88, 12, ${energyAlpha})`); // Orange 600
        energyGrad.addColorStop(1, `rgba(220, 38, 38, ${energyAlpha * 0.8})`); // Red 600
        ctx.fillStyle = energyGrad;
        ctx.fillRect(hx - holeRadius / 2 + 1, chargeTop, holeRadius - 2, chargeBottom - chargeTop);

        // Glow
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 4;
        ctx.fillStyle = `rgba(245,158,11,${energyAlpha * 0.2})`;
        ctx.fillRect(hx - holeRadius * 1.5, chargeTop, holeRadius * 3, chargeBottom - chargeTop);
        ctx.shadowBlur = 0;
      }

      // Stemming (top gray fill)
      const stemmingLen = (holeBottom - holeTop) - (chargeBottom - chargeTop);
      if (stemmingLen > 0) {
        ctx.fillStyle = 'rgba(71, 85, 105, 0.4)'; // Slate 600 40%
        ctx.fillRect(hx - holeRadius / 2 + 1, holeTop, holeRadius - 2, stemmingLen);
      }
    }

    // Burden arrow
    const lastHoleX = startX + (numHoles - 1) * holeSpacing;
    const arrowY = groundY + 18;
    if (lastHoleX + geometry.burden * scale < W - 20) {
      const burdenEnd = W - 12;
      ctx.strokeStyle = '#0284c7'; // Light blue 600
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(lastHoleX, arrowY);
      ctx.lineTo(burdenEnd, arrowY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#0369a1'; // Sky 700
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`B: ${geometry.burden}m`, (lastHoleX + burdenEnd) / 2, arrowY - 5);
    }

    // Bench height label
    ctx.strokeStyle = '#059669'; // Emerald 600
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(8, groundY);
    ctx.lineTo(8, benchBottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#047857'; // Emerald 700
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(8, (groundY + benchBottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`H: ${geometry.benchHeight}m`, 0, -8);
    ctx.restore();

    // Spacing label between holes 0 and 1
    if (numHoles >= 2 && holeSpacing < W) {
      const sx = startX + holeSpacing / 2;
      const sy = groundY + 30;
      ctx.fillStyle = '#6366f1'; // Indigo 500
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`S: ${geometry.spacing}m`, sx, sy);
    }

    // Labels
    ctx.fillStyle = '#94a3b8'; // Slate 400
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Virtual Simulation — No Real-World Control', 10, H - 8);

  }, [geometry, energyLevel, showEnergyZone]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={480}
        height={320}
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}
