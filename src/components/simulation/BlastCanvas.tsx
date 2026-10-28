'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import type { SimulationParams, SimulationResults, SimulationStage } from '@/lib/types';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface BlastCanvasProps {
  params: SimulationParams;
  results?: SimulationResults;
  stage?: SimulationStage;
  onStageChange?: (stage: SimulationStage) => void;
  autoPlay?: boolean;
}

const STAGE_MAP: Record<number, SimulationStage> = {
  1: 'stage1_intact',
  2: 'stage2_energy',
  3: 'stage3_cracks',
  4: 'stage4_fragmentation',
  5: 'stage5_result',
};

const STAGE_TO_NUM: Record<SimulationStage, number> = {
  idle: 1,
  stage1_intact: 1,
  stage2_energy: 2,
  stage3_cracks: 3,
  stage4_fragmentation: 4,
  stage5_result: 5,
};

// Rock type specific visual style definitions
interface RockVisualTheme {
  primary: string;
  secondary: string;
  accent: string;
  specular: string;
  grainDensity: number;
  patternType: 'crystalline' | 'columnar' | 'layered' | 'granular' | 'banded' | 'metallic';
  label: string;
}

const ROCK_THEMES: Record<string, RockVisualTheme> = {
  granite: {
    primary: '#475569',
    secondary: '#334155',
    accent: '#94a3b8',
    specular: '#cbd5e1',
    grainDensity: 45,
    patternType: 'crystalline',
    label: 'Granite (Igneous Crystalline)',
  },
  basalt: {
    primary: '#1e293b',
    secondary: '#0f172a',
    accent: '#334155',
    specular: '#64748b',
    grainDensity: 30,
    patternType: 'columnar',
    label: 'Basalt (Dense Volcanic)',
  },
  limestone: {
    primary: '#64748b',
    secondary: '#475569',
    accent: '#cbd5e1',
    specular: '#f1f5f9',
    grainDensity: 35,
    patternType: 'layered',
    label: 'Limestone (Sedimentary Carbonate)',
  },
  sandstone: {
    primary: '#78350f',
    secondary: '#92400e',
    accent: '#d97706',
    specular: '#fde68a',
    grainDensity: 55,
    patternType: 'granular',
    label: 'Sandstone (Sedimentary Quartz)',
  },
  quartzite: {
    primary: '#475569',
    secondary: '#64748b',
    accent: '#e2e8f0',
    specular: '#ffffff',
    grainDensity: 40,
    patternType: 'crystalline',
    label: 'Quartzite (Metamorphic Dense)',
  },
  iron_ore: {
    primary: '#451a03',
    secondary: '#271005',
    accent: '#b45309',
    specular: '#f59e0b',
    grainDensity: 50,
    patternType: 'metallic',
    label: 'Iron Ore (Banded Hematite/Magnetite)',
  },
  copper_ore: {
    primary: '#14532d',
    secondary: '#1e293b',
    accent: '#059669',
    specular: '#34d399',
    grainDensity: 45,
    patternType: 'banded',
    label: 'Copper Ore (Disseminated Sulfide)',
  },
};

export function BlastCanvas({
  params,
  stage = 'stage1_intact',
  onStageChange,
  autoPlay = false,
}: BlastCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation & Stage States
  const [currentStage, setCurrentStage] = useState<number>(() => STAGE_TO_NUM[stage] || 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stageProgress, setStageProgress] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showMesh, setShowMesh] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);

  // Generate deterministic particles for Stage 4 & 5
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 64; i++) {
      const angle = (Math.random() * 0.8 - 0.2) * Math.PI; // eject forward and upward
      const speed = 60 + Math.random() * 120;
      const vx = Math.cos(angle) * speed;
      const vy = -Math.abs(Math.sin(angle) * speed);
      const rotSpeed = (Math.random() - 0.5) * 8;
      const verticesCount = 4 + Math.floor(Math.random() * 3);
      const poly = [];
      const baseR = 7 + Math.random() * 9;
      for (let v = 0; v < verticesCount; v++) {
        const theta = (v / verticesCount) * Math.PI * 2;
        const rad = baseR * (0.7 + Math.random() * 0.6);
        poly.push({ x: Math.cos(theta) * rad, y: Math.sin(theta) * rad });
      }
      arr.push({
        id: i,
        relX: (i % 8) / 8,
        relY: Math.floor(i / 8) / 8,
        vx,
        vy,
        rotSpeed,
        poly,
      });
    }
    return arr;
  }, []);

  // Synchronize when external stage prop changes
  useEffect(() => {
    if (stage) {
      const num = STAGE_TO_NUM[stage] || 1;
      setCurrentStage(num);
      setStageProgress(0);
    }
  }, [stage]);

  // Synchronize autoPlay
  useEffect(() => {
    if (autoPlay) {
      setCurrentStage(1);
      setStageProgress(0);
      setIsPlaying(true);
    }
  }, [autoPlay]);

  const handleStageSelect = (stg: number) => {
    setCurrentStage(stg);
    setStageProgress(0);
    setIsPlaying(false);
    onStageChange?.(STAGE_MAP[stg] || 'stage1_intact');
  };

  // Main Render Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Normalizing parameters
    const geometry = {
      benchHeight: params.geometry?.benchHeight || 12,
      burden: params.geometry?.burden || 3.5,
      spacing: params.geometry?.spacing || 4.2,
      boreholeDepth: params.geometry?.boreholeDepth || 14,
      chargeZoneLength: params.geometry?.chargeZoneLength || 9,
      boreholeDiameter: params.geometry?.boreholeDiameter || 115,
    };

    const rockKey = (params.rockProperties?.rockType || 'granite').toLowerCase();
    const rockTheme = ROCK_THEMES[rockKey] || ROCK_THEMES.granite;
    const strengthIdx = params.rockProperties?.strengthIndex ?? 70;

    const jointOrient = params.geologicalConditions?.jointOrientation || 'random';
    const fractureLevel = params.geologicalConditions?.fractureLevel ?? 50;
    const waterPresence = params.geologicalConditions?.waterPresence || 'dry';

    const render = (now: number) => {
      const width = canvas.width || 800;
      const height = canvas.height || 460;

      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      if (isPlaying) {
        setStageProgress((prev) => {
          const next = prev + dt * 0.45 * speedMultiplier;
          if (next >= 1.0) {
            if (currentStage < 5) {
              const nextStage = currentStage + 1;
              setCurrentStage(nextStage);
              onStageChange?.(STAGE_MAP[nextStage]);
              return 0;
            } else {
              setIsPlaying(false);
              return 1.0;
            }
          }
          return next;
        });
      }

      // Draw background
      ctx.clearRect(0, 0, width, height);

      // Gradient background with moisture tint
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (waterPresence === 'saturated') {
        bgGrad.addColorStop(0, '#060d1a');
        bgGrad.addColorStop(1, '#0b1e36');
      } else if (waterPresence === 'wet') {
        bgGrad.addColorStop(0, '#080e1d');
        bgGrad.addColorStop(1, '#0f172a');
      } else {
        bgGrad.addColorStop(0, '#080c14');
        bgGrad.addColorStop(1, '#0e1626');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Engineering grid mesh
      if (showMesh) {
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.2)';
        ctx.lineWidth = 1;
        const gridSize = 25;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Coordinates and scaling
      const padLeft = 40;
      const padTop = 45;
      const viewH = height - padTop - 50;

      // Scale calculations: bench height in pixels
      const bHeightPx = Math.min(viewH * 0.72, Math.max(140, geometry.benchHeight * 16));
      const benchTopY = padTop + (viewH - bHeightPx) * 0.4;
      const benchFloorY = benchTopY + bHeightPx;
      const benchLeftX = padLeft + 20;
      const freeFaceX = width - 140; // The front cliff face
      const toeX = freeFaceX + 25; // Toe slope

      // STAGE 1, 2, 3: INTACT / CONTINUOUS ROCK MASS
      if (currentStage <= 3) {
        // 1. Draw Rock Mass polygon
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(benchLeftX, benchTopY);
        ctx.lineTo(freeFaceX, benchTopY);
        ctx.lineTo(toeX, benchFloorY);
        ctx.lineTo(benchLeftX, benchFloorY);
        ctx.closePath();
        ctx.clip();

        // Base Rock Gradient
        const rockGrad = ctx.createLinearGradient(benchLeftX, benchTopY, freeFaceX, benchFloorY);
        rockGrad.addColorStop(0, rockTheme.primary);
        rockGrad.addColorStop(0.7, rockTheme.secondary);
        rockGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = rockGrad;
        ctx.fillRect(benchLeftX, benchTopY, freeFaceX - benchLeftX + 40, bHeightPx);

        // Procedural Textures based on lithology
        if (rockTheme.patternType === 'layered') {
          // Sedimentary bedding planes
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1.5;
          const layerCount = Math.floor(bHeightPx / 18);
          for (let l = 1; l < layerCount; l++) {
            ctx.beginPath();
            ctx.moveTo(benchLeftX, benchTopY + l * 18);
            ctx.lineTo(freeFaceX + 30, benchTopY + l * 18 + Math.sin(l) * 4);
            ctx.stroke();
          }
        } else if (rockTheme.patternType === 'columnar') {
          // Basaltic vertical columnar jointing
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
          ctx.lineWidth = 2;
          for (let cx = benchLeftX + 20; cx < freeFaceX; cx += 22) {
            ctx.beginPath();
            ctx.moveTo(cx, benchTopY);
            ctx.lineTo(cx + 4, benchFloorY);
            ctx.stroke();
          }
        } else if (rockTheme.patternType === 'crystalline') {
          // Granite/Quartzite crystalline speckles
          ctx.fillStyle = rockTheme.specular;
          for (let s = 0; s < rockTheme.grainDensity; s++) {
            const rx = benchLeftX + (s * 37) % (freeFaceX - benchLeftX);
            const ry = benchTopY + (s * 29) % bHeightPx;
            ctx.fillRect(rx, ry, 2.5, 2.5);
          }
        } else if (rockTheme.patternType === 'metallic' || rockTheme.patternType === 'banded') {
          // Ore mineral veins
          ctx.strokeStyle = rockTheme.accent;
          ctx.lineWidth = 3;
          for (let b = 0; b < 4; b++) {
            ctx.beginPath();
            ctx.moveTo(benchLeftX, benchTopY + 30 + b * 40);
            ctx.quadraticCurveTo(
              benchLeftX + 200, benchTopY + 15 + b * 40,
              freeFaceX, benchTopY + 45 + b * 40
            );
            ctx.stroke();
          }
        }

        // Structural Geological Discontinuities / Joints
        const jointCount = fractureLevel > 65 ? 18 : fractureLevel > 35 ? 10 : 4;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = fractureLevel > 60 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.2)';

        for (let j = 0; j < jointCount; j++) {
          const jx = benchLeftX + 40 + j * 32;
          ctx.beginPath();
          if (jointOrient === 'vertical') {
            ctx.moveTo(jx, benchTopY + 5);
            ctx.lineTo(jx + 5, benchFloorY - 5);
          } else if (jointOrient === 'horizontal') {
            const jy = benchTopY + 15 + j * (bHeightPx / jointCount);
            ctx.moveTo(benchLeftX + 10, jy);
            ctx.lineTo(freeFaceX - 10, jy + (j % 2 === 0 ? 4 : -4));
          } else if (jointOrient === 'inclined') {
            ctx.moveTo(jx, benchTopY + 5);
            ctx.lineTo(jx - 45, benchFloorY - 5);
          } else {
            // Random
            ctx.moveTo(jx, benchTopY + 10 + (j % 3) * 15);
            ctx.lineTo(jx + (j % 2 === 0 ? 30 : -25), benchFloorY - 10);
          }
          ctx.stroke();
        }

        // Groundwater moisture saturation zone
        if (waterPresence !== 'dry') {
          const moistureHeight = waterPresence === 'saturated' ? 0.55 : waterPresence === 'wet' ? 0.35 : 0.2;
          const waterY = benchFloorY - bHeightPx * moistureHeight;
          const waterGrad = ctx.createLinearGradient(0, waterY, 0, benchFloorY);
          waterGrad.addColorStop(0, 'rgba(37, 99, 235, 0.05)');
          waterGrad.addColorStop(1, 'rgba(37, 99, 235, 0.35)');
          ctx.fillStyle = waterGrad;
          ctx.fillRect(benchLeftX, waterY, freeFaceX - benchLeftX + 40, bHeightPx * moistureHeight);

          // Water level dashed line
          ctx.strokeStyle = '#60a5fa';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(benchLeftX, waterY);
          ctx.lineTo(freeFaceX + 20, waterY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();

        // Intact Rock Boundary Outline
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(benchLeftX, benchTopY);
        ctx.lineTo(freeFaceX, benchTopY);
        ctx.lineTo(toeX, benchFloorY);
        ctx.lineTo(benchLeftX, benchFloorY);
        ctx.stroke();

        // Floor ground continuation
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(toeX, benchFloorY);
        ctx.lineTo(width - 15, benchFloorY);
        ctx.stroke();

        // Boreholes Placement
        const burdenPx = Math.min(110, Math.max(50, geometry.burden * 18));
        const spacingPx = Math.min(120, Math.max(55, geometry.spacing * 18));

        const bh1X = freeFaceX - burdenPx;
        const bh2X = bh1X - spacingPx;
        const bh3X = bh2X - spacingPx;

        const boreholes = [
          { x: bh1X, id: 'BH-01 (Front/Crest)' },
          { x: bh2X, id: 'BH-02 (Mid Row)' },
          { x: bh3X, id: 'BH-03 (Buffer)' },
        ].filter((bh) => bh.x > benchLeftX + 30);

        const totalDepthPx = Math.min(bHeightPx + 20, (geometry.boreholeDepth / geometry.benchHeight) * bHeightPx);
        const chargeLenPx = Math.min(totalDepthPx * 0.85, (geometry.chargeZoneLength / geometry.boreholeDepth) * totalDepthPx);
        const stemmingLenPx = totalDepthPx - chargeLenPx;

        boreholes.forEach((bh) => {
          const bhWidth = 10;
          const bhTop = benchTopY;
          const bhBottom = bhTop + totalDepthPx;
          const chargeTop = bhTop + stemmingLenPx;

          // Borehole casing/cavity
          ctx.fillStyle = '#090d16';
          ctx.fillRect(bh.x - bhWidth / 2, bhTop, bhWidth, totalDepthPx);
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.strokeRect(bh.x - bhWidth / 2, bhTop, bhWidth, totalDepthPx);

          // Stemming column (inert gravel/clay)
          ctx.fillStyle = '#64748b';
          ctx.fillRect(bh.x - bhWidth / 2 + 1, bhTop + 1, bhWidth - 2, stemmingLenPx);

          // Explosive charge column
          const chargeGrad = ctx.createLinearGradient(bh.x, chargeTop, bh.x, bhBottom);
          chargeGrad.addColorStop(0, '#f59e0b');
          chargeGrad.addColorStop(1, '#ef4444');
          ctx.fillStyle = chargeGrad;
          ctx.fillRect(bh.x - bhWidth / 2 + 1, chargeTop, bhWidth - 2, chargeLenPx);

          // Borehole collar label
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px Inter, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(bh.id.split(' ')[0], bh.x, bhTop - 8);

          // Detonation point (booster/primer)
          const primerY = bhBottom - 8;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(bh.x, primerY, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        // STAGE 2: VIRTUAL DETONATION & SHOCKWAVE PROPAGATION
        if (currentStage === 2) {
          boreholes.forEach((bh) => {
            const primerY = benchTopY + totalDepthPx - 8;
            const shockRadius = stageProgress * (burdenPx * 2.4);

            // Primary shock wave front
            ctx.beginPath();
            ctx.arc(bh.x, primerY, shockRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(245, 158, 11, ${Math.max(0, 1 - stageProgress * 0.7)})`;
            ctx.lineWidth = 4;
            ctx.stroke();

            // Reflected tensile wave near free face
            if (shockRadius > burdenPx) {
              const reflectProgress = (shockRadius - burdenPx) / burdenPx;
              ctx.beginPath();
              ctx.arc(freeFaceX, benchTopY + bHeightPx * 0.5, reflectProgress * burdenPx * 1.5, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(59, 130, 246, ${Math.max(0, 0.8 - reflectProgress)})`;
              ctx.lineWidth = 2.5;
              ctx.stroke();
            }

            // High pressure gaseous plasma core
            const coreRadius = Math.min(shockRadius * 0.45, 30);
            const coreGrad = ctx.createRadialGradient(bh.x, primerY, 2, bh.x, primerY, coreRadius);
            coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            coreGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.7)');
            coreGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(bh.x, primerY, coreRadius, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // STAGE 3: GAS EXPANSION & RADIAL CRACK NETWORK
        if (currentStage === 3) {
          boreholes.forEach((bh) => {
            const primerY = benchTopY + totalDepthPx - 8;
            const maxCrackLen = burdenPx * 1.6 * stageProgress;
            const numCracks = fractureLevel > 60 ? 18 : fractureLevel > 30 ? 12 : 8;

            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;

            for (let c = 0; c < numCracks; c++) {
              const angle = (c / numCracks) * Math.PI * 2 + (c % 2 === 0 ? 0.1 : -0.1);
              ctx.beginPath();
              ctx.moveTo(bh.x, primerY);
              // Multi-segment jagged crack
              const seg1X = bh.x + Math.cos(angle) * (maxCrackLen * 0.5) + (Math.random() - 0.5) * 4;
              const seg1Y = primerY + Math.sin(angle) * (maxCrackLen * 0.5) + (Math.random() - 0.5) * 4;
              const seg2X = bh.x + Math.cos(angle) * maxCrackLen;
              const seg2Y = primerY + Math.sin(angle) * maxCrackLen;
              ctx.lineTo(seg1X, seg1Y);
              ctx.lineTo(seg2X, seg2Y);
              ctx.stroke();
            }
          });
        }
      }

      // STAGE 4: BALLISTIC FLIGHT & FRAGMENTATION HEAVE
      if (currentStage === 4) {
        // Draw remaining bench foundation
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(benchLeftX, benchTopY);
        ctx.lineTo(benchLeftX + 80, benchTopY);
        ctx.lineTo(benchLeftX + 80, benchFloorY);
        ctx.lineTo(benchLeftX, benchFloorY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        // Floor
        ctx.beginPath();
        ctx.moveTo(benchLeftX, benchFloorY);
        ctx.lineTo(width - 15, benchFloorY);
        ctx.stroke();

        // Flyrock / Fragment trajectory
        particles.forEach((p) => {
          const t = stageProgress;
          const initialX = benchLeftX + 90 + p.relX * (freeFaceX - benchLeftX - 90);
          const initialY = benchTopY + p.relY * bHeightPx;

          const curX = initialX + p.vx * t * 1.8;
          const curY = Math.min(benchFloorY - 6, initialY + p.vy * t * 1.5 + 0.5 * 240 * t * t);

          ctx.save();
          ctx.translate(curX, curY);
          ctx.rotate(p.rotSpeed * t);

          ctx.fillStyle = p.id % 2 === 0 ? rockTheme.primary : rockTheme.secondary;
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;

          ctx.beginPath();
          p.poly.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.restore();
        });

        // Dust & Blast cloud
        const cloudRadius = stageProgress * 140;
        const cloudGrad = ctx.createRadialGradient(freeFaceX - 30, benchTopY + bHeightPx * 0.4, 10, freeFaceX - 30, benchTopY + bHeightPx * 0.4, cloudRadius);
        cloudGrad.addColorStop(0, 'rgba(203, 213, 225, 0.45)');
        cloudGrad.addColorStop(0.6, 'rgba(148, 163, 184, 0.2)');
        cloudGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(freeFaceX - 30, benchTopY + bHeightPx * 0.4, cloudRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // STAGE 5: SETTLED MUCKPILE & POST-BLAST ANALYSIS
      if (currentStage === 5) {
        // Intact remnant bench
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(benchLeftX, benchTopY);
        ctx.lineTo(benchLeftX + 90, benchTopY);
        ctx.lineTo(benchLeftX + 90, benchFloorY);
        ctx.lineTo(benchLeftX, benchFloorY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        // Floor
        ctx.beginPath();
        ctx.moveTo(benchLeftX, benchFloorY);
        ctx.lineTo(width - 15, benchFloorY);
        ctx.stroke();

        // Settled Muckpile geometry (Angle of repose ~ 36-38 deg)
        const muckpileStartX = benchLeftX + 85;
        const muckpilePeakX = muckpileStartX + (freeFaceX - muckpileStartX) * 0.45;
        const muckpilePeakY = benchTopY + bHeightPx * 0.35;
        const muckpileToeX = width - 40;

        ctx.fillStyle = rockTheme.secondary;
        ctx.beginPath();
        ctx.moveTo(muckpileStartX, benchFloorY);
        ctx.lineTo(muckpileStartX, benchTopY + 20);
        ctx.quadraticCurveTo(muckpilePeakX, muckpilePeakY, muckpileToeX, benchFloorY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Settled rocks on surface of muckpile
        ctx.fillStyle = rockTheme.primary;
        for (let m = 0; m < 28; m++) {
          const mx = muckpileStartX + 30 + m * ((muckpileToeX - muckpileStartX - 50) / 28);
          const normX = (mx - muckpileStartX) / (muckpileToeX - muckpileStartX);
          const my = benchFloorY - Math.sin(normX * Math.PI) * (benchFloorY - muckpilePeakY) + (m % 3) * 4;
          ctx.beginPath();
          ctx.arc(mx, my, 5 + (m % 4) * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Muckpile Peak annotation
        ctx.fillStyle = '#10b981';
        ctx.font = '600 12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('✓ STABLE MUCKPILE PROFILE', muckpilePeakX - 50, muckpilePeakY - 14);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, monospace';
        ctx.fillText(`Heave Throw: ${(geometry.burden * 3.2).toFixed(1)}m | Repose: 37.5°`, muckpilePeakX - 50, muckpilePeakY - 2);
      }

      // DIMENSIONS OVERLAY
      if (showDimensions && currentStage <= 3) {
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.font = '10px Inter, monospace';
        ctx.textAlign = 'center';

        // Bench Height H Dimension Line (Right of free face)
        const dimX = width - 35;
        ctx.beginPath();
        ctx.moveTo(dimX, benchTopY);
        ctx.lineTo(dimX, benchFloorY);
        ctx.moveTo(dimX - 5, benchTopY);
        ctx.lineTo(dimX + 5, benchTopY);
        ctx.moveTo(dimX - 5, benchFloorY);
        ctx.lineTo(dimX + 5, benchFloorY);
        ctx.stroke();

        ctx.save();
        ctx.translate(dimX - 12, (benchTopY + benchFloorY) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`H = ${geometry.benchHeight.toFixed(1)}m`, 0, 0);
        ctx.restore();

        // Burden B Dimension Line
        const burdenPx = Math.min(110, Math.max(50, geometry.burden * 18));
        const bh1X = freeFaceX - burdenPx;
        const bDimY = benchTopY - 18;

        ctx.beginPath();
        ctx.moveTo(bh1X, bDimY);
        ctx.lineTo(freeFaceX, bDimY);
        ctx.moveTo(bh1X, bDimY - 4);
        ctx.lineTo(bh1X, bDimY + 4);
        ctx.moveTo(freeFaceX, bDimY - 4);
        ctx.lineTo(freeFaceX, bDimY + 4);
        ctx.stroke();
        ctx.fillText(`Burden B = ${geometry.burden.toFixed(1)}m`, (bh1X + freeFaceX) / 2, bDimY - 5);
      }

      // LIVE HUD / REAL-TIME PARAMETER BADGE OVERLAY (Top-Left)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(16, 12, 280, 26);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 12, 280, 26);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px Inter, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`LITHOLOGY: ${rockTheme.label.split(' ')[0].toUpperCase()}`, 24, 29);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, monospace';
      ctx.fillText(`UCS: ${strengthIdx}% | B: ${geometry.burden}m | S: ${geometry.spacing}m`, 140, 29);

      // Stage Title Badge (Top-Right)
      const stageTitles = [
        'Phase 1: Intact Rock Mass & Borehole Array',
        'Phase 2: Shockwave & Energy Partitioning',
        'Phase 3: Gas Expansion & Radial Cracking',
        'Phase 4: Ballistic Flight & Fragmentation Heave',
        'Phase 5: Muckpile Settlement & Repose Profile'
      ];

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(width - 320, 12, 305, 26);
      ctx.strokeStyle = currentStage === 5 ? '#10b981' : '#2563eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(width - 320, 12, 305, 26);

      ctx.fillStyle = currentStage === 5 ? '#34d399' : '#60a5fa';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(stageTitles[currentStage - 1], width - 310, 29);

      // Mandatory Engineering Disclaimer Bar
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(16, height - 32, width - 32, 22);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.strokeRect(16, height - 32, width - 32, 22);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillText('VIRTUAL SIMULATION — EDUCATIONAL PHYSICS MODEL — NO LIVE BLAST SITE CONTROL', 26, height - 17);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    currentStage,
    isPlaying,
    speedMultiplier,
    showMesh,
    showDimensions,
    params,
    particles,
    onStageChange,
  ]);

  return (
    <div style={{ backgroundColor: '#090d16', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', color: '#f8fafc', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
      {/* Viewport Canvas Container */}
      <div style={{ position: 'relative', width: '100%', background: '#090d16' }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={460}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />

        {/* Viewport Control Overlay Toggle Buttons */}
        <div style={{ position: 'absolute', bottom: 42, left: 16, display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setShowMesh(!showMesh)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '4px',
              backgroundColor: showMesh ? 'rgba(37, 99, 235, 0.3)' : 'rgba(15, 23, 42, 0.7)',
              color: showMesh ? '#60a5fa' : '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            Grid {showMesh ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={() => setShowDimensions(!showDimensions)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '4px',
              backgroundColor: showDimensions ? 'rgba(37, 99, 235, 0.3)' : 'rgba(15, 23, 42, 0.7)',
              color: showDimensions ? '#60a5fa' : '#94a3b8',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
          >
            Dimensions {showDimensions ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Physics Stage Bar & Playback Controls */}
      <div style={{ padding: '12px 16px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        {/* Phase Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { num: 1, label: '1. Intact' },
            { num: 2, label: '2. Detonation' },
            { num: 3, label: '3. Cracking' },
            { num: 4, label: '4. Heave' },
            { num: 5, label: '5. Muckpile' },
          ].map((item) => (
            <button
              key={item.num}
              type="button"
              onClick={() => handleStageSelect(item.num)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: currentStage === item.num ? 700 : 500,
                backgroundColor: currentStage === item.num ? 'var(--color-primary)' : 'var(--color-surface-2)',
                color: currentStage === item.num ? '#ffffff' : 'var(--color-text-secondary)',
                border: currentStage === item.num ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              if (currentStage === 5 && stageProgress >= 1.0) {
                setCurrentStage(1);
                setStageProgress(0);
              }
              setIsPlaying(!isPlaying);
            }}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px' }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Play Blast Sequence'}
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentStage(1);
              setStageProgress(0);
              setIsPlaying(false);
              onStageChange?.('stage1_intact');
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
          >
            <RotateCcw size={14} />
            Reset
          </button>

          <button
            type="button"
            onClick={() => setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '12px', padding: '6px 10px', color: 'var(--color-text-muted)' }}
          >
            {speedMultiplier}x Speed
          </button>
        </div>
      </div>
    </div>
  );
}
