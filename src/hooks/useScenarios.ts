import { useMemo } from 'react';
import { SCENARIOS } from '../data/scenarios';
import type { Scenario } from '../data/types';

export function useScenarios(includeInactive = false): Scenario[] {
  return useMemo(
    () => (includeInactive ? SCENARIOS : SCENARIOS.filter((s) => s.active)),
    [includeInactive]
  );
}
