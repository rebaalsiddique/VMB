// ============================================================
// Virtual Mining Blast Lab  Demo Scenario Data
// ============================================================

import type { Scenario, SimulationParams } from '@/lib/types';

export const DEMO_PARAMS: SimulationParams = {
  rockProperties: {
    rockType: 'limestone',
    strengthIndex: 55,
    density: 2500,
    condition: 'fresh',
  },
  geologicalConditions: {
    fractureLevel: 45,
    jointOrientation: 'inclined',
    weatheringLevel: 20,
    geologicalComplexity: 50,
    waterPresence: 'dry',
  },
  geometry: {
    boreholeDiameter: 115,
    boreholeDepth: 9.0,
    chargeZoneLength: 6.5,
    burden: 3.2,
    spacing: 3.8,
    benchHeight: 9.0,
    numberOfHoles: 10,
    ft: 6.5,
  },
  energyModel: {
    energyLevel: 65,
    energyDistribution: 'uniform',
    confinementLevel: 60,
    initiationQuality: 75,
    oxygenQuantityKg: 520,
  },
  environmentalConditions: {
    temperature: 24,
    groundCondition: 'dry',
    simulationMode: 'standard',
    weather: 'Clear',
    windCondition: 'Light wind',
  },
};

export const DEMO_SCENARIO: Scenario = {
  id: 'demo_scenario_001',
  scenarioName: 'Demo Mining Scenario',
  description:
    'Built-in demonstration scenario. Uses synthetic parameter values for Granite with moderate geological complexity and standard energy configuration.',
  createdAt: '2026-08-20T06:00:00.000Z',
  updatedAt: '2026-08-20T06:00:00.000Z',
  params: DEMO_PARAMS,
  status: 'draft',
};

export const ROCK_TYPES = [
  {
    id: 'granite' as const,
    name: 'Granite',
    strength: 'Very High',
    icon: '\u{1FAA8}',
    color: '#6B7280',
    ucs: '150-250 MPa',
  },
  {
    id: 'limestone' as const,
    name: 'Limestone',
    strength: 'Medium',
    icon: '\u{1F3D4}\uFE0F',
    color: '#9CA3AF',
    ucs: '50-150 MPa',
  },
  {
    id: 'basalt' as const,
    name: 'Basalt',
    strength: 'High',
    icon: '\u2B1B',
    color: '#374151',
    ucs: '100-200 MPa',
  },
  {
    id: 'sandstone' as const,
    name: 'Sandstone',
    strength: 'Low-Medium',
    icon: '\u{1F7EB}',
    color: '#D97706',
    ucs: '20-80 MPa',
  },
  {
    id: 'quartzite' as const,
    name: 'Quartzite',
    strength: 'Extremely High',
    icon: '\u{1F48E}',
    color: '#7C3AED',
    ucs: '200-300 MPa',
  },
  {
    id: 'iron_ore' as const,
    name: 'Iron Ore',
    strength: 'High',
    icon: '\u{1F529}',
    color: '#B45309',
    ucs: '80-200 MPa',
  },
  {
    id: 'copper_ore' as const,
    name: 'Copper Ore',
    strength: 'Medium',
    icon: '\u{1F7E0}',
    color: '#B87333',
    ucs: '60-150 MPa',
  },
  {
    id: 'custom' as const,
    name: 'Custom Rock',
    strength: 'User Defined',
    icon: '\u2699\uFE0F',
    color: '#4B5563',
    ucs: 'Variable',
  },
];

export const SAMPLE_HISTORY: Scenario[] = [
  {
    id: 'hist_001',
    scenarioName: 'Granite Bench A',
    description: 'Initial test on granite formation',
    createdAt: '2026-08-15T08:30:00.000Z',
    updatedAt: '2026-08-15T09:45:00.000Z',
    params: DEMO_PARAMS,
    results: {
      intensityIndex: 74,
      fragmentationScore: 'high',
      efficiencyScore: 78,
      vibrationRiskIndex: 'medium',
      overbreakRisk: 'low',
      consistencyScore: 82,
      geologicalUncertainty: 'low',
      estimatedFragmentSize: 35,
      affectedZoneRadius: 11.2,
    },
    status: 'saved',
  },
  {
    id: 'hist_002',
    scenarioName: 'Limestone Quarry B',
    description: 'Limestone formation with high water presence',
    createdAt: '2026-08-16T10:00:00.000Z',
    updatedAt: '2026-08-16T11:20:00.000Z',
    params: {
      ...DEMO_PARAMS,
      rockProperties: { rockType: 'limestone', strengthIndex: 52, density: 2400, condition: 'moderately_weathered' },
      geologicalConditions: { ...DEMO_PARAMS.geologicalConditions, waterPresence: 'saturated', fractureLevel: 75 },
    },
    results: {
      intensityIndex: 58,
      fragmentationScore: 'medium',
      efficiencyScore: 61,
      vibrationRiskIndex: 'low',
      overbreakRisk: 'medium',
      consistencyScore: 55,
      geologicalUncertainty: 'medium',
      estimatedFragmentSize: 52,
      affectedZoneRadius: 9.8,
    },
    status: 'saved',
  },
  {
    id: 'hist_003',
    scenarioName: 'Basalt Deep Cut',
    description: 'Deep bench on basalt, high energy scenario',
    createdAt: '2026-08-17T14:00:00.000Z',
    updatedAt: '2026-08-17T15:10:00.000Z',
    params: {
      ...DEMO_PARAMS,
      rockProperties: { rockType: 'basalt', strengthIndex: 85, density: 2900, condition: 'fresh' },
      geometry: { ...DEMO_PARAMS.geometry, boreholeDepth: 18, benchHeight: 18, burden: 4.5 },
      energyModel: { ...DEMO_PARAMS.energyModel, energyLevel: 82, confinementLevel: 70 },
    },
    results: {
      intensityIndex: 88,
      fragmentationScore: 'high',
      efficiencyScore: 85,
      vibrationRiskIndex: 'high',
      overbreakRisk: 'medium',
      consistencyScore: 76,
      geologicalUncertainty: 'low',
      estimatedFragmentSize: 28,
      affectedZoneRadius: 14.5,
    },
    status: 'saved',
  },
];
