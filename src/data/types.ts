import { SCENARIO_CATEGORIES } from './scenarios';

export type Role = 'pilot' | 'instructor';

export interface User {
  id: string;
  name: string;
  role: Role;
  crew?: number;
  seat?: 'left' | 'right';
}

export interface Scenario {
  id: number;
  code: string;
  titleTr: string;
  category: keyof typeof SCENARIO_CATEGORIES;
  difficulty: number;
  descTr: string;
  goalTr: string;
  active: boolean;
}

export type CPIClass = 'Yüksek' | 'Orta' | 'Gelişim Gerekli';

export interface PilotSummary {
  id: string;
  crew: number;
  seat: 'left' | 'right';
  displayName: string;
  cpiMean: number;
  cpiMin: number;
  cpiMax: number;
  cpiStd: number;
  nScenarios: number;
  ersScore: number | null;
  seScore: number | null;
  avResScore: number | null;
  sysResScore: number | null;
  cpiClass: CPIClass;
}

export interface ScenarioPerformance {
  pilotId: string;
  scenarioId: number;
  cpi: number;
  tlxScore: number;
  sartScore: number;
  rpsaScore: number;
  ersScore: number;
  seScore: number;
  avResScore: number;
}

export interface Flight {
  id: string;
  pilotId: string;
  scenarioId: number;
  cpi: number;
  cpiClass: CPIClass;
  peakStressPct: number;
  highStressDurationPct: number;
  avgCognitiveLoadPct: number;
  hasTimelineData: boolean;
}

export interface EpochRow {
  crew: number;
  seat: number;
  scenario: number;
  epochIndex: number;
  eventLabel: 0 | 1;
  features: Record<string, number>;
}

export interface FlightAnalysis {
  flightId: string;
  epochs: EpochRow[];
  stressProbability: number[];
  cognitiveLoadProbability: number[];
}

export interface InstructorNote {
  id: string;
  pilotId: string;
  authorName: string;
  timestamp: string;
  text: string;
}
