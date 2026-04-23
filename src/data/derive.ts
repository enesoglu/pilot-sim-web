import type { EpochRow, FlightAnalysis } from './types';

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// PROTOTYPE: synthetic derivation, not real model inference
export function deriveStressProbability(epoch: EpochRow): number {
  const f = epoch.features;
  const topFeatures = [
    f['beats_per_min_anchored_grad_z'] ?? 0,
    f['hr_var_anchored_grad_z'] ?? 0,
    f['engagement_index_spec_anchored_grad_z'] ?? 0,
    f['hr_hrv_ratio_anchored_grad_z'] ?? 0,
    f['taskLoad_index_spec_anchored_grad_z'] ?? 0,
  ];
  const avg = topFeatures.reduce((a, b) => a + Math.abs(b), 0) / topFeatures.length;
  let prob = sigmoid(avg * 1.5 - 0.5);

  if (epoch.eventLabel === 1) {
    prob = 0.7 + Math.random() * 0.2;
  }
  return Math.max(0, Math.min(1, prob));
}

// PROTOTYPE: synthetic derivation, not real model inference
export function deriveCognitiveLoadProbability(epoch: EpochRow): number {
  const f = epoch.features;
  const signal =
    (f['taskLoad_index_spec_anchored_z'] ?? 0) * 0.6 +
    (f['engagement_index_spec_anchored_z'] ?? 0) * 0.4;
  return Math.max(0, Math.min(1, sigmoid(signal)));
}

export function deriveFlightSummary(analysis: FlightAnalysis) {
  const { stressProbability, cognitiveLoadProbability } = analysis;
  const peak = Math.max(...stressProbability) * 100;
  const high =
    (stressProbability.filter((p) => p > 0.5).length / stressProbability.length) * 100;
  const avgLoad =
    (cognitiveLoadProbability.reduce((a, b) => a + b, 0) / cognitiveLoadProbability.length) * 100;
  return {
    peakStressPct: peak,
    highStressDurationPct: high,
    avgCognitiveLoadPct: avgLoad,
  };
}

/** Deterministic pseudo-random from string hash — for flights without real timeline data. */
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function syntheticFlightMetrics(flightId: string) {
  const h = hashCode(flightId);
  const peakStressPct = 40 + (h % 50);
  const highStressDurationPct = 10 + ((h >> 4) % 40);
  const avgCognitiveLoadPct = 30 + ((h >> 8) % 45);
  return { peakStressPct, highStressDurationPct, avgCognitiveLoadPct };
}
