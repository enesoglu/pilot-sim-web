import { useMemo } from 'react';
import type { Flight, ScenarioPerformance } from '../data/types';
import { classifyCPI } from '../theme/tokens';
import { syntheticFlightMetrics } from '../data/derive';

export function useFlights(scenarioPerformances: ScenarioPerformance[]): Flight[] {
  return useMemo(() => {
    return scenarioPerformances.map((sp) => {
      const flightId = `${sp.pilotId}-s${sp.scenarioId}`;
      const metrics = syntheticFlightMetrics(flightId);
      return {
        id: flightId,
        pilotId: sp.pilotId,
        scenarioId: sp.scenarioId,
        cpi: sp.cpi,
        cpiClass: classifyCPI(sp.cpi),
        ...metrics,
        hasTimelineData: false,
      };
    });
  }, [scenarioPerformances]);
}
