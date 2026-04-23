import { useState, useEffect } from 'react';
import { loadPilotData } from '../data/loaders';
import type { PilotSummary, ScenarioPerformance } from '../data/types';

interface State {
  pilots: PilotSummary[];
  scenarioPerformances: ScenarioPerformance[];
  loading: boolean;
  error: string | null;
}

export function usePilots(): State {
  const [state, setState] = useState<State>({
    pilots: [],
    scenarioPerformances: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadPilotData()
      .then(({ pilots, scenarioPerformances }) =>
        setState({ pilots, scenarioPerformances, loading: false, error: null })
      )
      .catch((err: unknown) =>
        setState((s) => ({ ...s, loading: false, error: String(err) }))
      );
  }, []);

  return state;
}
