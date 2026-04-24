import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Divider from '@mui/material/Divider';
import { usePilots } from '../hooks/usePilots';
import { useFlights } from '../hooks/useFlights';
import { useFlightAnalysis } from '../hooks/useFlightAnalysis';
import { SyncedTimeline } from '../components/charts/SyncedTimeline';
import { SubScoreBars, type SubScore } from '../components/charts/SubScoreBars';
import { ScoreTile } from '../components/common/ScoreTile';
import { CPIBadge } from '../components/common/CPIBadge';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { SCENARIOS } from '../data/scenarios';
import type { Flight, FlightAnalysis, ScenarioPerformance } from '../data/types';
import { fmt1 } from '../utils/format';
import { deriveFlightSummary } from '../data/derive';
import { palette } from '../theme/tokens';

// ─── FlightColumn ──────────────────────────────────────────────────────────

interface GlanceMetrics {
  cpi: number;
  peakStressPct: number;
  highStressDurationPct: number;
  avgCognitiveLoadPct: number;
}

interface ColumnProps {
  label: 'A' | 'B';
  flight: Flight | undefined;
  analysis: FlightAnalysis | null;
  loading: boolean;
  scenarioPerf: ScenarioPerformance | undefined;
  pilotName: string;
  scenarioCode: string;
  refMetrics: GlanceMetrics | null; // column A metrics for delta display
}

function DeltaChip({ delta, unit = '' }: { delta: number; unit?: string }) {
  const isPos = delta > 0;
  const color = isPos ? palette.success : palette.danger;
  return (
    <Typography
      component="span"
      sx={{ fontSize: '0.78rem', fontWeight: 600, color, ml: 0.75 }}
    >
      {isPos ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}{unit}
    </Typography>
  );
}

function FlightColumn({ label, flight, analysis, loading, scenarioPerf, pilotName, scenarioCode, refMetrics }: ColumnProps) {
  const glance = useMemo(() => (analysis ? deriveFlightSummary(analysis) : null), [analysis]);

  const subScores: SubScore[] = scenarioPerf
    ? [
        { label: 'TLX', value: scenarioPerf.tlxScore },
        { label: 'SART', value: scenarioPerf.sartScore },
        { label: 'RPSA', value: scenarioPerf.rpsaScore },
        { label: 'ERS', value: scenarioPerf.ersScore },
        { label: 'SE', value: scenarioPerf.seScore },
        { label: 'AvRes', value: scenarioPerf.avResScore },
      ]
    : [];

  const labelColor = label === 'A' ? palette.info : palette.accent;

  return (
    <Box>
      {/* Column header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2,
          pb: 1.5,
          borderBottom: `2px solid ${labelColor}`,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: labelColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>
            {label}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {pilotName || 'Pilot seçilmedi'}
          </Typography>
          {scenarioCode && (
            <Typography
              variant="caption"
              sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'primary.main' }}
            >
              {scenarioCode}
            </Typography>
          )}
        </Box>
      </Box>

      {!flight ? (
        <EmptyState
          title="Uçuş seçilmedi"
          description="Yukarıdan bir uçuş seçin."
        />
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <>
          {/* Summary card */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              {/* CPI + glance tiles */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 700,
                        fontSize: '2rem',
                        lineHeight: 1,
                      }}
                    >
                      {fmt1(flight.cpi)}
                    </Typography>
                    {refMetrics && (
                      <DeltaChip delta={flight.cpi - refMetrics.cpi} />
                    )}
                  </Box>
                  <CPIBadge cpiClass={flight.cpiClass} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    CPI
                  </Typography>
                </Box>

                {glance && (
                  <>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <ScoreTile
                          value={fmt1(glance.peakStressPct)}
                          label="Tepe Stres"
                          variant="percent"
                          size="sm"
                        />
                        {refMetrics && (
                          <DeltaChip
                            delta={glance.peakStressPct - refMetrics.peakStressPct}
                            unit="%"
                          />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <ScoreTile
                          value={fmt1(glance.avgCognitiveLoadPct)}
                          label="Ort. Bilişsel Yük"
                          variant="percent"
                          size="sm"
                        />
                        {refMetrics && (
                          <DeltaChip
                            delta={glance.avgCognitiveLoadPct - refMetrics.avgCognitiveLoadPct}
                            unit="%"
                          />
                        )}
                      </Box>
                    </Box>
                  </>
                )}
              </Box>

              {/* Sub-score mini bars */}
              {subScores.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Divider sx={{ mb: 1.5 }} />
                  <SubScoreBars scores={subScores} title="Alt Skorlar" />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Independent timeline */}
          {analysis && (
            <Card>
              <CardContent sx={{ pt: 2 }}>
                <SyncedTimeline
                  epochs={analysis.epochs}
                  derivedSeries={{
                    stress: analysis.stressProbability,
                    load: analysis.cognitiveLoadProbability,
                  }}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function FlightComparePage() {
  const [flightAId, setFlightAId] = useState('');
  const [flightBId, setFlightBId] = useState('');

  const { pilots, scenarioPerformances, loading } = usePilots();
  const allFlights = useFlights(scenarioPerformances);

  const { analysis: analysisA, loading: loadA } = useFlightAnalysis(flightAId);
  const { analysis: analysisB, loading: loadB } = useFlightAnalysis(flightBId);

  const flightOptions = useMemo(() => {
    return allFlights.map((f) => {
      const pilot = pilots.find((p) => p.id === f.pilotId);
      const sc = SCENARIOS.find((s) => s.id === f.scenarioId);
      const name = pilot?.displayName.split('(')[0].trim() ?? f.pilotId;
      return { id: f.id, label: `${name} — ${sc?.code ?? ''}` };
    });
  }, [allFlights, pilots]);

  function swap() {
    setFlightAId(flightBId);
    setFlightBId(flightAId);
  }

  function getPilotName(flightId: string) {
    const f = allFlights.find((fl) => fl.id === flightId);
    if (!f) return '';
    return pilots.find((p) => p.id === f.pilotId)?.displayName.split('(')[0].trim() ?? '';
  }

  function getScenarioCode(flightId: string) {
    const f = allFlights.find((fl) => fl.id === flightId);
    if (!f) return '';
    return SCENARIOS.find((s) => s.id === f.scenarioId)?.code ?? '';
  }

  function getScenarioPerf(flightId: string) {
    const f = allFlights.find((fl) => fl.id === flightId);
    if (!f) return undefined;
    return scenarioPerformances.find(
      (sp) => sp.pilotId === f.pilotId && sp.scenarioId === f.scenarioId
    );
  }

  const glanceA = useMemo(
    () =>
      flightAId && analysisA
        ? {
            cpi: allFlights.find((f) => f.id === flightAId)?.cpi ?? 0,
            ...deriveFlightSummary(analysisA),
          }
        : null,
    [flightAId, analysisA, allFlights]
  );

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      <PageHeader title="Uçuş Karşılaştırma" subtitle="İki uçuşu yan yana analiz edin." />

      {/* ─── Flight selectors ─── */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
            <FormControl sx={{ minWidth: 280 }} size="small">
              <InputLabel>Uçuş A</InputLabel>
              <Select
                value={flightAId}
                label="Uçuş A"
                onChange={(e) => setFlightAId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Seçin...</em>
                </MenuItem>
                {flightOptions.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: '0.85rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Yer Değiştir">
              <IconButton onClick={swap} size="small">
                <SwapHorizIcon />
              </IconButton>
            </Tooltip>

            <FormControl sx={{ minWidth: 280 }} size="small">
              <InputLabel>Uçuş B</InputLabel>
              <Select
                value={flightBId}
                label="Uçuş B"
                onChange={(e) => setFlightBId(e.target.value)}
              >
                <MenuItem value="">
                  <em>Seçin...</em>
                </MenuItem>
                {flightOptions.map((opt) => (
                  <MenuItem key={opt.id} value={opt.id} sx={{ fontSize: '0.85rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {(flightAId || flightBId) && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ▲ / ▼ farklar B'nin A'ya göre sapmasını gösterir.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ─── Two-column comparison ─── */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FlightColumn
            label="A"
            flight={allFlights.find((f) => f.id === flightAId)}
            analysis={analysisA}
            loading={loadA}
            scenarioPerf={getScenarioPerf(flightAId)}
            pilotName={getPilotName(flightAId)}
            scenarioCode={getScenarioCode(flightAId)}
            refMetrics={null}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FlightColumn
            label="B"
            flight={allFlights.find((f) => f.id === flightBId)}
            analysis={analysisB}
            loading={loadB}
            scenarioPerf={getScenarioPerf(flightBId)}
            pilotName={getPilotName(flightBId)}
            scenarioCode={getScenarioCode(flightBId)}
            refMetrics={glanceA}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
