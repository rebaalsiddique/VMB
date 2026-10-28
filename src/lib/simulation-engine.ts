// ============================================================
// Virtual Mining Blast Lab — Simulation Engine
// ============================================================
import type {
  SimulationParams,
  SimulationResults,
  RiskLevel,
  FragmentationScore,
  RockType,
  WaterPresence,
} from './types';
import { predictBlastOutcomes } from './ml-pipeline';

const normalize = (val: number, min: number, max: number): number =>
  Math.max(0, Math.min(1, (val - min) / (max - min)));

const clamp = (val: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, val));

const ROCK_HARDNESS: Record<RockType, number> = {
  granite: 0.90,
  quartzite: 0.95,
  basalt: 0.80,
  iron_ore: 0.75,
  limestone: 0.55,
  sandstone: 0.45,
  copper_ore: 0.60,
  custom: 0.65,
};

function fractureFactor(level: number): number {
  return 1 - (level / 100) * 0.65;
}

const WATER_FACTOR: Record<WaterPresence, number> = {
  dry: 1.0,
  damp: 0.92,
  wet: 0.80,
  saturated: 0.65,
};

const GROUND_FACTOR: Record<string, number> = {
  dry: 1.0,
  damp: 0.85,
  wet: 0.85,
  frozen: 0.95,
};

const MODE_FACTOR: Record<string, number> = {
  standard: 1.0,
  conservative: 0.85,
  research: 1.15,
};

const DIST_FACTOR: Record<string, number> = {
  uniform: 1.0,
  concentrated: 1.2,
  graduated: 0.9,
};

const toRisk = (val: number): RiskLevel => {
  if (val < 33) return 'low';
  if (val < 66) return 'medium';
  return 'high';
};

const toFragmentation = (val: number): FragmentationScore => {
  if (val < 33) return 'low';
  if (val < 66) return 'medium';
  return 'high';
};

export function runSimulation(params: SimulationParams): SimulationResults {
  const { rockProperties, geologicalConditions, geometry, energyModel, environmentalConditions } = params;

  const rockHardness = ROCK_HARDNESS[rockProperties.rockType];
  const strengthNorm = normalize(rockProperties.strengthIndex, 0, 100);
  const densityNorm = normalize(rockProperties.density, 1500, 3500);
  const conditionFactor =
    rockProperties.condition === 'fresh'
      ? 1.0
      : rockProperties.condition === 'moderately_weathered'
      ? 0.75
      : 0.50;

  const ff = fractureFactor(geologicalConditions.fractureLevel);
  const weatheringNorm = normalize(geologicalConditions.weatheringLevel, 0, 100);
  const complexityNorm = normalize(geologicalConditions.geologicalComplexity, 0, 100);
  const waterFactor = WATER_FACTOR[geologicalConditions.waterPresence] ?? 1.0;
  const distFactor = DIST_FACTOR[energyModel.energyDistribution] ?? 1.0;

  const energyNorm = normalize(energyModel.energyLevel, 0, 100);
  const chargeRatio = geometry.chargeZoneLength / Math.max(1, geometry.boreholeDepth);
  const chargeNorm = normalize(chargeRatio, 0, 1);
  const diamNorm = normalize(geometry.boreholeDiameter, 50, 300);
  const initiationNorm = normalize(energyModel.initiationQuality, 0, 100);
  const confinementNorm = normalize(energyModel.confinementLevel, 0, 100);

  const burdenNorm = normalize(geometry.burden, 1, 8);
  const spacingNorm = normalize(geometry.spacing, 1, 10);
  const depthNorm = normalize(geometry.boreholeDepth, 2, 25);
  const benchNorm = normalize(geometry.benchHeight, 5, 30);

  const tempNorm = normalize(environmentalConditions.temperature, -30, 50);
  const groundFactor = GROUND_FACTOR[environmentalConditions.groundCondition] ?? 1.0;
  const modeFactor = MODE_FACTOR[environmentalConditions.simulationMode] ?? 1.0;

  const complexityFactor = 1 - complexityNorm * 0.4;
  const rockResistance =
    (rockHardness * 0.35 +
      strengthNorm * 0.3 +
      densityNorm * 0.2 +
      (1 - weatheringNorm) * 0.15) *
    conditionFactor *
    ff;

  const effectiveEnergy =
    energyNorm * 0.4 + chargeNorm * 0.25 + diamNorm * 0.15 + initiationNorm * 0.2;
  const deliveredEnergy =
    effectiveEnergy * distFactor * waterFactor * (1.05 - tempNorm * 0.1) * groundFactor * modeFactor;

  const intensityIndex = clamp(
    Math.round((deliveredEnergy * 0.65 + (1 - rockResistance) * 0.35) * 100)
  );

  const geometryScore =
    (1 - Math.abs(burdenNorm - 0.4)) * 0.35 +
    (1 - Math.abs(spacingNorm / Math.max(0.1, burdenNorm) - 1.25)) * 0.25 +
    depthNorm * 0.2 +
    benchNorm * 0.2;

  const fragmentationIndex = clamp(
    Math.round(
      (deliveredEnergy / Math.max(0.1, rockResistance)) * 40 +
        geometryScore * 35 +
        complexityFactor * 25
    )
  );
  const fragmentationScore = toFragmentation(fragmentationIndex);

  const efficiencyScore = clamp(
    Math.round(
      (initiationNorm * 0.25 +
        distFactor * 0.2 +
        geometryScore * 0.3 +
        (1 - confinementNorm * 0.15) * 0.15 +
        complexityFactor * 0.1) *
        100
    )
  );

  const vibrationRiskIndex = toRisk(
    clamp(
      Math.round(
        energyNorm * 40 +
          (1 - burdenNorm) * 30 +
          (1 - confinementNorm) * 20 +
          (1 - ff) * 10
      )
    )
  );

  const overbreakRisk = toRisk(
    clamp(
      Math.round(
        energyNorm * 30 +
          (1 - geometryScore) * 35 +
          (1 - complexityFactor * waterFactor) * 20 +
          (1 - conditionFactor) * 15
      )
    )
  );

  const consistencyScore = clamp(
    Math.round(
      initiationNorm * 30 +
        distFactor * 25 +
        complexityFactor * 25 +
        (1 - weatheringNorm) * 20
    )
  );

  const geologicalUncertainty = toRisk(
    clamp(
      Math.round(
        (1 - complexityFactor) * 40 +
          weatheringNorm * 30 +
          (1 - ff) * 30
      )
    )
  );

  const estimatedFragmentSize = clamp(
    Math.round((rockResistance * 80) / Math.max(0.1, deliveredEnergy * geometryScore)),
    5,
    200
  );

  const affectedZoneRadius = parseFloat(
    (geometry.burden * 1.5 + energyNorm * geometry.boreholeDepth * 0.4).toFixed(1)
  );

  return {
    intensityIndex,
    fragmentationScore,
    efficiencyScore,
    vibrationRiskIndex,
    overbreakRisk,
    consistencyScore,
    geologicalUncertainty,
    estimatedFragmentSize,
    affectedZoneRadius,
    mlPrediction: predictBlastOutcomes(params),
  };
}
