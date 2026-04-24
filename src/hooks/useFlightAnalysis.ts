import { useState, useEffect } from 'react';
import { loadFlightAnalysis } from '../data/loaders';
import type { FlightAnalysis } from '../data/types';

interface State {
  analysis: FlightAnalysis | null;
  loading: boolean;
  error: string | null;
}

export function useFlightAnalysis(flightId: string): State {
  const [state, setState] = useState<State>({ analysis: null, loading: false, error: null });

  useEffect(() => {
    if (!flightId) {
      setState({ analysis: null, loading: false, error: null });
      return;
    }
    setState({ analysis: null, loading: true, error: null });
    loadFlightAnalysis(flightId)
      .then((analysis) => setState({ analysis, loading: false, error: null }))
      .catch((err: unknown) =>
        setState({ analysis: null, loading: false, error: String(err) })
      );
  }, [flightId]);

  return state;
}
