import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import type {
  PilotSummary,
  ScenarioPerformance,
  EpochRow,
  FlightAnalysis,
} from './types';
import { pilotIdOf, pilotDisplayName, ALL_CREW_IDS } from './pilotProfiles';
import { classifyCPI } from '../theme/tokens';
import { deriveStressProbability, deriveCognitiveLoadProbability } from './derive';

// Module-level cache
let pilotsCache: { pilots: PilotSummary[]; scenarioPerformances: ScenarioPerformance[] } | null =
  null;
let epochCache: EpochRow[] | null = null;

export async function loadPilotData(): Promise<{
  pilots: PilotSummary[];
  scenarioPerformances: ScenarioPerformance[];
}> {
  if (pilotsCache) return pilotsCache;

  const resp = await fetch('/mocks/pilot_performans_sonuclari.xlsx');
  const arrayBuffer = await resp.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // --- Genel_CPI sheet ---
  const genelSheet = workbook.Sheets['Genel_CPI'];
  const genelRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(genelSheet);

  // --- Senaryo_CPI sheet ---
  const senaryoSheet = workbook.Sheets['Senaryo_CPI'];
  const senaryoRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(senaryoSheet);

  const pilots: PilotSummary[] = genelRows.map((row) => {
    const crew = Number(row['Crew']);
    const seatRaw = String(row['Seat'] ?? '').toLowerCase();
    const seat = seatRaw === 'left' || seatRaw === 'l' ? 'left' : 'right';
    const id = pilotIdOf(crew, seat);
    const cpiMean = Number(row['CPI_mean'] ?? 0);

    return {
      id,
      crew,
      seat,
      displayName: pilotDisplayName(crew, seat),
      cpiMean,
      cpiMin: Number(row['CPI_min'] ?? cpiMean),
      cpiMax: Number(row['CPI_max'] ?? cpiMean),
      cpiStd: Number(row['CPI_std'] ?? 0),
      nScenarios: Number(row['n_scenarios'] ?? 6),
      ersScore: row['ERS_score'] != null ? Number(row['ERS_score']) : null,
      seScore: row['SE_score'] != null ? Number(row['SE_score']) : null,
      avResScore: row['AvRes_score'] != null ? Number(row['AvRes_score']) : null,
      sysResScore: row['SysRes_score'] != null ? Number(row['SysRes_score']) : null,
      cpiClass: classifyCPI(cpiMean),
    };
  });

  // Fill missing pilots (ensure all 24 appear)
  const presentIds = new Set(pilots.map((p) => p.id));
  for (const crew of ALL_CREW_IDS) {
    for (const seat of ['left', 'right'] as const) {
      const id = pilotIdOf(crew, seat);
      if (!presentIds.has(id)) {
        pilots.push({
          id,
          crew,
          seat,
          displayName: pilotDisplayName(crew, seat),
          cpiMean: 55,
          cpiMin: 50,
          cpiMax: 60,
          cpiStd: 3,
          nScenarios: 6,
          ersScore: null,
          seScore: null,
          avResScore: null,
          sysResScore: null,
          cpiClass: 'Orta',
        });
      }
    }
  }

  const scenarioPerformances: ScenarioPerformance[] = senaryoRows.map((row) => {
    const crew = Number(row['Crew']);
    const seatRaw = String(row['Seat'] ?? '').toLowerCase();
    const seat = seatRaw === 'left' || seatRaw === 'l' ? 'left' : 'right';
    return {
      pilotId: pilotIdOf(crew, seat),
      scenarioId: Number(row['Scenario ID']),
      cpi: Number(row['CPI'] ?? 0),
      tlxScore: Number(row['TLX_score'] ?? 0),
      sartScore: Number(row['SART_score'] ?? 0),
      rpsaScore: Number(row['RPSA_score'] ?? 0),
      ersScore: Number(row['ERS_score'] ?? 0),
      seScore: Number(row['SE_score'] ?? 0),
      avResScore: Number(row['AvRes_score'] ?? 0),
    };
  });

  pilotsCache = { pilots, scenarioPerformances };
  console.log('[loaders] Loaded pilots:', pilots.length, 'scenario rows:', scenarioPerformances.length);
  return pilotsCache;
}

async function loadEpochData(): Promise<EpochRow[]> {
  if (epochCache) return epochCache;

  const resp = await fetch('/mocks/v15_champion_dataset.csv');
  const text = await resp.text();

  const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });

  const metaCols = new Set(['crew', 'seat', 'scenario', 'epoch_index', 'event_label']);

  epochCache = result.data.map((row) => {
    const features: Record<string, number> = {};
    for (const [key, val] of Object.entries(row)) {
      if (!metaCols.has(key)) {
        features[key] = parseFloat(val) || 0;
      }
    }
    return {
      crew: Number(row['crew']),
      seat: Number(row['seat']),
      scenario: Number(row['scenario']),
      epochIndex: Number(row['epoch_index']),
      eventLabel: (Number(row['event_label']) === 1 ? 1 : 0) as 0 | 1,
      features,
    };
  });

  console.log('[loaders] Loaded epochs:', epochCache.length);
  return epochCache;
}

// PROTOTYPE: all flightIds return same parsed CSV with adjusted flightId
export async function loadFlightAnalysis(flightId: string): Promise<FlightAnalysis> {
  const epochs = await loadEpochData();
  const stressProbability = epochs.map(deriveStressProbability);
  const cognitiveLoadProbability = epochs.map(deriveCognitiveLoadProbability);
  return { flightId, epochs, stressProbability, cognitiveLoadProbability };
}
