// ============================================================
// Virtual Mining Blast Lab  TypeScript Type Definitions
// ============================================================

export type RockType =
  | 'granite'
  | 'limestone'
  | 'basalt'
  | 'sandstone'
  | 'quartzite'
  | 'iron_ore'
  | 'copper_ore'
  | 'custom';

export type RockCondition = 'fresh' | 'moderately_weathered' | 'highly_weathered';
export type JointOrientation = 'horizontal' | 'vertical' | 'inclined' | 'random';
export type WaterPresence = 'dry' | 'damp' | 'wet' | 'saturated';
export type GroundCondition = 'dry' | 'damp' | 'wet';
export type EnergyDistribution = 'uniform' | 'concentrated' | 'graduated';
export type SimulationMode = 'standard' | 'conservative' | 'research';
export type RiskLevel = 'low' | 'medium' | 'high';
export type FragmentationScore = 'low' | 'medium' | 'high';

export interface RockProperties {
  rockType: RockType;
  strengthIndex: number; // 0-100
  density: number; // kg/m3, 1500-3500
  condition: RockCondition;
}

export interface GeologicalConditions {
  fractureLevel: number; // 0-100 (0=massive, 100=highly fractured)
  jointOrientation: JointOrientation;
  weatheringLevel: number; // 0-100
  geologicalComplexity: number; // 0-100
  waterPresence: WaterPresence;
}

export interface Geometry {
  boreholeDiameter: number; // mm, 50-300
  boreholeDepth: number; // m, 2-25
  chargeZoneLength: number; // m, 1-20
  burden: number; // m, 1-8
  spacing: number; // m, 1-10
  benchHeight: number; // m, 5-30
  numberOfHoles?: number; // count, 1-50
  ft?: number; // field-note depth / parameter (m), 1-20
}

export interface EnergyModel {
  energyLevel: number; // 0-100
  energyDistribution: EnergyDistribution;
  confinementLevel: number; // 0-100
  initiationQuality: number; // 0-100
  oxygenQuantityKg?: number; // kg, e.g. 200 - 1500
}

export interface EnvironmentalConditions {
  temperature: number; // degrees C, -30 to 50
  groundCondition: GroundCondition;
  simulationMode: SimulationMode;
  weather?: string; // 'Clear', 'Partly Cloudy', 'Overcast', etc.
  windCondition?: string; // 'Light Wind', 'Calm', 'Moderate Breeze', etc.
}

export interface SimulationParams {
  rockProperties: RockProperties;
  geologicalConditions: GeologicalConditions;
  geometry: Geometry;
  energyModel: EnergyModel;
  environmentalConditions: EnvironmentalConditions;
}

export interface MLPrediction {
  fragmentation: 'Fine' | 'Fine-to-Medium' | 'Medium' | 'Coarse';
  fragmentationScore: FragmentationScore;
  muckpileCoverage: 'Small' | 'Moderate' | 'Larger' | 'High';
  dustTendency: 'Low' | 'Low-to-Moderate' | 'Moderate' | 'High';
  modelStatus: 'Demo / Training Data Limited' | 'Active Pipeline' | 'Trained on LOX Dataset';
  trainingCasesCount: number;
  observedCasesCount?: number;
  syntheticCasesCount?: number;
  confidence: 'Preliminary / Assumed Basis' | 'Standard' | 'Experimental' | 'Trained Field Regression';
  isDemoWarning: boolean;
  predictedOxygenKg?: number;
  oxygenConfidenceInterval?: [number, number];
  imputedTubeLengthM?: number;
  modelGeneralizationR2?: number;
  derivedPricePkr?: number;
  featureVector: {
    depth: number;
    ft: number;
    numberOfHoles: number;
    oxygenKg: number;
    rockType: string;
    rockDensity: number;
    waterCondition: string;
    weather: string;
    windCondition: string;
    jointIntensity: number;
    fractureLevel: number;
  };
}

export interface LOXDatasetRecord {
  caseId: string;
  dataType: string;
  depthM: number;
  ftM: number;
  numberOfHoles: number;
  oxygenKg: number;
  rockType: string;
  rockDensityTpm3: number;
  waterCondition: string;
  weather: string;
  windCondition: string;
  fragmentationObservation: string;
  dustObservation: string;
  groundVibrationObservation: string;
  airblastObservation: string;
  muckpileObservation: string;
  notes: string;
  source: string;
}

export interface SimulationResults {
  intensityIndex: number; // 0-100
  fragmentationScore: FragmentationScore;
  efficiencyScore: number; // 0-100
  vibrationRiskIndex: RiskLevel;
  overbreakRisk: RiskLevel;
  consistencyScore: number; // 0-100
  geologicalUncertainty: RiskLevel;
  estimatedFragmentSize: number; // cm average
  affectedZoneRadius: number; // m relative
  mlPrediction?: MLPrediction;
}

export interface Scenario {
  id: string;
  scenarioName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  params: SimulationParams;
  results?: SimulationResults;
  status: 'draft' | 'simulated' | 'saved';
}

export type SimulationStage =
  | 'idle'
  | 'stage1_intact'
  | 'stage2_energy'
  | 'stage3_cracks'
  | 'stage4_fragmentation'
  | 'stage5_result';

