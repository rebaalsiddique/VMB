// ============================================================
// Virtual Mining Blast Lab — State Store (localStorage)
// ============================================================

import type { Scenario, SimulationParams, SimulationResults } from './types';
import { runSimulation } from './simulation-engine';
import { SAMPLE_HISTORY, DEMO_SCENARIO, DEMO_PARAMS } from '@/data/demo-scenario';

const STORAGE_KEY = 'vmbl_scenarios';
const SETTINGS_KEY = 'vmbl_settings';

export interface AppSettings {
  units: 'metric' | 'imperial';
  animationSpeed: 'normal' | 'fast' | 'smooth';
  autoSave: boolean;
  theme: 'light';
}

export const DEFAULT_SETTINGS: AppSettings = {
  units: 'metric',
  animationSpeed: 'normal',
  autoSave: true,
  theme: 'light',
};

function generateId(): string {
  return `sc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function loadScenarios(): Scenario[] {
  if (typeof window === 'undefined') return SAMPLE_HISTORY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_HISTORY));
      return SAMPLE_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_HISTORY));
    return SAMPLE_HISTORY;
  } catch {
    return SAMPLE_HISTORY;
  }
}

export function saveScenarios(scenarios: Scenario[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch (e) {
    console.error('Failed to save scenarios to localStorage', e);
  }
}

export function createScenario(
  name: string,
  description: string,
  params: SimulationParams
): Scenario {
  const now = new Date().toISOString();
  const scenario: Scenario = {
    id: generateId(),
    scenarioName: name.trim() || `Scenario ${Date.now()}`,
    description: description.trim() || 'Custom mining simulation scenario.',
    createdAt: now,
    updatedAt: now,
    params,
    status: 'draft',
  };
  const all = loadScenarios();
  all.unshift(scenario);
  saveScenarios(all);
  return scenario;
}

export function updateScenario(id: string, updates: Partial<Scenario>): Scenario | null {
  const all = loadScenarios();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const updated: Scenario = {
    ...all[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  saveScenarios(all);
  return updated;
}
export function saveScenario(scenario: Scenario): Scenario | null {
  const all = loadScenarios();
  const idx = all.findIndex((s) => s.id === scenario.id);
  if (idx === -1) return null;
  all[idx] = { ...scenario, updatedAt: new Date().toISOString() };
  saveScenarios(all);
  return all[idx];
}


export function simulateScenario(id: string): Scenario | null {
  const all = loadScenarios();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const results = runSimulation(all[idx].params);
  const updated: Scenario = {
    ...all[idx],
    results,
    status: 'simulated',
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  saveScenarios(all);
  return updated;
}

export function duplicateScenario(id: string): Scenario | null {
  const all = loadScenarios();
  const original = all.find((s) => s.id === id);
  if (!original) return null;
  const now = new Date().toISOString();
  const copy: Scenario = {
    ...original,
    id: generateId(),
    scenarioName: `${original.scenarioName} (Copy)`,
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    results: original.results ? { ...original.results } : undefined,
  };
  all.unshift(copy);
  saveScenarios(all);
  return copy;
}

export function deleteScenario(id: string): void {
  const all = loadScenarios().filter((s) => s.id !== id);
  saveScenarios(all);
}

export function getScenario(id: string): Scenario | null {
  const all = loadScenarios();
  const found = all.find((s) => s.id === id);
  if (found) return found;
  if (id === DEMO_SCENARIO.id) return DEMO_SCENARIO;
  const demoHist = SAMPLE_HISTORY.find((s) => s.id === id);
  if (demoHist) return demoHist;
  return null;
}

export function resetToDemo(): Scenario[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_HISTORY));
  }
  return SAMPLE_HISTORY;
}

export function clearAllScenarios(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
}

export function runQuickSimulation(params: SimulationParams): SimulationResults {
  return runSimulation(params);
}

// Settings management
export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = loadSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }
  return updated;
}
