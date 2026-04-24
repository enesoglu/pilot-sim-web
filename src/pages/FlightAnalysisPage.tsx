import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import MuiLink from '@mui/material/Link';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import TimelineIcon from '@mui/icons-material/Timeline';
import { usePilots } from '../hooks/usePilots';
import { useFlights } from '../hooks/useFlights';
import { useFlightAnalysis } from '../hooks/useFlightAnalysis';
import { SyncedTimeline } from '../components/charts/SyncedTimeline';
import { SubScoreBars, type SubScore } from '../components/charts/SubScoreBars';
import { ScoreTile } from '../components/common/ScoreTile';
import { DataQualityBadge } from '../components/common/DataQualityBadge';
import { CPIBadge } from '../components/common/CPIBadge';
import { EmptyState } from '../components/common/EmptyState';
import { SCENARIOS } from '../data/scenarios';
import type { EpochRow, FlightAnalysis, ScenarioPerformance } from '../data/types';
import { fmt1 } from '../utils/format';
import { deriveFlightSummary } from '../data/derive';
import { palette } from '../theme/tokens';

// ─── helpers ───────────────────────────────────────────────────────────────

function parseFlightId(flightId: string): { pilotId: string; scenarioId: number } {
  const idx = flightId.lastIndexOf('-s');
  if (idx === -1) return { pilotId: flightId, scenarioId: 0 };
  return {
    pilotId: flightId.substring(0, idx),
    scenarioId: parseInt(flightId.substring(idx + 2), 10),
  };
}

function feat(epoch: EpochRow, key: string, fallback = key + '_grad_z'): number {
  return epoch.features[key] ?? epoch.features[fallback] ?? 0;
}

// PROTOTYPE: all metrics derived from z-scored features, not real sensor units.
function computeMetrics(epochs: EpochRow[], analysis: FlightAnalysis) {
  const n = epochs.length;
  if (n === 0) return null;

  const bpmZ = epochs.map((e) => feat(e, 'beats_per_min_anchored_z'));
  const hrvZ = epochs.map((e) => feat(e, 'hr_var_anchored_z'));
  const pupilZ = epochs.map((e) => feat(e, 'pupilD_avg_anchored_z'));
  const gazeZ = epochs.map((e) => feat(e, 'gaze_variance_anchored_z'));
  const taskZ = epochs.map((e) => feat(e, 'taskLoad_index_spec_anchored_z'));
  const engZ = epochs.map((e) => feat(e, 'engagement_index_spec_anchored_z'));

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const peak = (arr: number[]) => Math.max(...arr);

  // Scale z-scores to plausible physiological units (synthetic)
  return {
    avgBpm: Math.round(72 + avg(bpmZ) * 8),
    peakBpm: Math.round(72 + peak(bpmZ) * 8),
    hrvSdnn: Math.max(18, Math.round(45 + avg(hrvZ) * 12)),
    avgPupilMm: (3.5 + avg(pupilZ) * 0.4).toFixed(2),
    gazeVariance: avg(gazeZ).toFixed(3),
    gazeSpeed: (peak(gazeZ) * 18 + 120).toFixed(1),
    avgTaskLoad: avg(taskZ).toFixed(3),
    avgEngagement: avg(engZ).toFixed(3),
    stressEventCount: analysis.stressProbability.filter((p) => p > 0.5).length,
    ...deriveFlightSummary(analysis),
  };
}

// ─── Tab 2 — Özet Metrikler ────────────────────────────────────────────────

interface SummaryTabProps {
  epochs: EpochRow[];
  analysis: FlightAnalysis;
  scenarioPerf: ScenarioPerformance | undefined;
}

function SummaryMetricsTab({ epochs, analysis, scenarioPerf }: SummaryTabProps) {
  const m = computeMetrics(epochs, analysis);
  if (!m) return <EmptyState title="Metrik hesaplanamadı" />;

  const MetricGroup = ({
    title,
    items,
  }: {
    title: string;
    items: { label: string; value: string; unit?: string }[];
  }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 2,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid item xs={6} sm={4} md={3} key={item.label}>
              <ScoreTile
                value={`${item.value}${item.unit ? ' ' + item.unit : ''}`}
                label={item.label}
                size="sm"
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const subScores: SubScore[] = scenarioPerf
    ? [
        { label: 'TLX — İş Yükü', value: scenarioPerf.tlxScore },
        { label: 'SART — Durum. Farkındalık', value: scenarioPerf.sartScore },
        { label: 'RPSA — Güven', value: scenarioPerf.rpsaScore },
        { label: 'ERS — Hata Kurtarma', value: scenarioPerf.ersScore },
        { label: 'SE — Durum Değ.', value: scenarioPerf.seScore },
        { label: 'AvRes — Kullanılabilirlik', value: scenarioPerf.avResScore },
      ]
    : [];

  return (
    <Grid container spacing={3} sx={{ mt: 0 }}>
      <Grid item xs={12} md={8}>
        <MetricGroup
          title="Kardiyak"
          items={[
            { label: 'Ort. Kalp Hızı', value: String(m.avgBpm), unit: 'bpm' },
            { label: 'HRV SDNN', value: String(m.hrvSdnn), unit: 'ms' },
            { label: 'BPM Tepe', value: String(m.peakBpm), unit: 'bpm' },
          ]}
        />
        <MetricGroup
          title="Göz Takibi"
          items={[
            { label: 'Ort. Pupil Çapı', value: m.avgPupilMm, unit: 'mm' },
            { label: 'Bakış Varyansı', value: m.gazeVariance },
            { label: 'Bakış Hızı', value: m.gazeSpeed, unit: '°/s' },
          ]}
        />
        <MetricGroup
          title="Bilişsel (EEG)"
          items={[
            { label: 'Ort. İş Yükü Endeksi', value: m.avgTaskLoad },
            { label: 'Ort. Katılım Endeksi', value: m.avgEngagement },
          ]}
        />
        <MetricGroup
          title="Model Çıktıları"
          items={[
            { label: 'Tepe Stres', value: fmt1(m.peakStressPct), unit: '%' },
            { label: 'Yüksek Stres Süresi', value: fmt1(m.highStressDurationPct), unit: '%' },
            { label: 'Ort. Bilişsel Yük', value: fmt1(m.avgCognitiveLoadPct), unit: '%' },
            { label: 'Stres Olay Sayısı', value: String(m.stressEventCount) },
          ]}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        {scenarioPerf ? (
          <Card>
            <CardContent>
              <SubScoreBars scores={subScores} title="CPI Alt Skorlar" />
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="Alt skor verisi yok"
            description="Bu uçuş için senaryo verisi bulunamadı."
          />
        )}
      </Grid>
    </Grid>
  );
}

// ─── Tab 3 — Olaylar ──────────────────────────────────────────────────────

interface EventsTabProps {
  analysis: FlightAnalysis;
  onShowInTimeline: () => void;
}

function EventsTab({ analysis, onShowInTimeline }: EventsTabProps) {
  const eventEpochs = analysis.epochs
    .map((e, i) => ({ epoch: e, stress: analysis.stressProbability[i], load: analysis.cognitiveLoadProbability[i] }))
    .filter((row) => row.epoch.eventLabel === 1);

  if (eventEpochs.length === 0) {
    return (
      <EmptyState
        title="Etiketli stres olayı bulunamadı"
        description="Bu uçuşta kayıtlı olay bulunmuyor."
      />
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {eventEpochs.length} stres olayı tespit edildi (event_label = 1).
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Epoch #</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Stres Olasılığı</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Bilişsel Yük Olas.</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {eventEpochs.map(({ epoch, stress, load }) => (
            <TableRow key={epoch.epochIndex} hover>
              <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
                {epoch.epochIndex}
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: stress > 0.7 ? palette.danger : palette.warning,
                    }}
                  >
                    {(stress * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
                {(load * 100).toFixed(1)}%
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<TimelineIcon fontSize="small" />}
                  onClick={onShowInTimeline}
                  sx={{ fontSize: '0.72rem', textTransform: 'none' }}
                >
                  Zaman Çizelgesinde Göster
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export default function FlightAnalysisPage() {
  const { flightId = '' } = useParams<{ flightId: string }>();
  const [activeTab, setActiveTab] = useState(0);

  const { pilotId, scenarioId } = useMemo(() => parseFlightId(flightId), [flightId]);

  const { pilots, scenarioPerformances, loading: pilotsLoading } = usePilots();
  const allFlights = useFlights(scenarioPerformances);
  const { analysis, loading: analysisLoading, error: analysisError } = useFlightAnalysis(flightId);

  const pilot = useMemo(() => pilots.find((p) => p.id === pilotId), [pilots, pilotId]);
  const scenario = useMemo(() => SCENARIOS.find((s) => s.id === scenarioId), [scenarioId]);
  const scenarioPerf = useMemo(
    () =>
      scenarioPerformances.find(
        (sp) => sp.pilotId === pilotId && sp.scenarioId === scenarioId
      ),
    [scenarioPerformances, pilotId, scenarioId]
  );
  const flight = useMemo(() => allFlights.find((f) => f.id === flightId), [allFlights, flightId]);

  const isLoading = pilotsLoading || (analysisLoading && !analysis);

  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (analysisError)
    return <EmptyState title="Uçuş verisi yüklenemedi" description={analysisError} />;

  if (!analysis || !flight)
    return (
      <EmptyState
        title="Uçuş bulunamadı"
        description={`Uçuş ID: ${flightId}`}
      />
    );

  const glance = deriveFlightSummary(analysis);

  return (
    <Box>
      {/* ─── Header ─── */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <MuiLink
            component={Link}
            to="/dashboard"
            underline="hover"
            color="text.secondary"
            sx={{ fontSize: '0.8rem' }}
          >
            Uçuşlar
          </MuiLink>
          {pilot && (
            <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {pilot.displayName.split('(')[0].trim()}
            </Typography>
          )}
          <Typography color="text.primary" sx={{ fontSize: '0.8rem' }}>
            {scenario?.code ?? flightId}
          </Typography>
        </Breadcrumbs>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          {/* Left: pilot + scenario info */}
          <Box>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
              {pilot?.displayName.split('(')[0].trim() ?? pilotId}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'primary.main',
                mb: 0.25,
              }}
            >
              {scenario?.code}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {scenario?.titleTr}
            </Typography>
          </Box>

          {/* Right: CPI + glance tiles */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
            <ScoreTile
              value={fmt1(flight.cpi)}
              label="CPI"
              variant="cpi"
              cpiClass={flight.cpiClass}
              size="lg"
            />
            <ScoreTile
              value={fmt1(glance.peakStressPct)}
              label="Tepe Stres"
              variant="percent"
              size="md"
            />
            <ScoreTile
              value={fmt1(glance.highStressDurationPct)}
              label="Yüksek Stres Süresi"
              variant="percent"
              size="md"
            />
            <ScoreTile
              value={fmt1(glance.avgCognitiveLoadPct)}
              label="Ort. Bilişsel Yük"
              variant="percent"
              size="md"
            />
          </Box>
        </Box>

        {/* Data quality badges */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          <DataQualityBadge label="EEG Kalitesi" quality="good" />
          <DataQualityBadge label="EKG Kalitesi" quality="good" />
          <DataQualityBadge label="Göz Takibi" quality="good" />
          <CPIBadge cpiClass={flight.cpiClass} />
        </Box>
      </Box>

      {/* ─── Tabs ─── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v: number) => setActiveTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.9rem' } }}
        >
          <Tab label="Zaman Çizelgesi" />
          <Tab label="Özet Metrikler" />
          <Tab label="Olaylar" />
        </Tabs>
      </Box>

      <Divider />

      {/* ─── Tab 1: Zaman Çizelgesi ─── */}
      {activeTab === 0 && (
        <Card sx={{ mt: 2 }}>
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

      {/* ─── Tab 2: Özet Metrikler ─── */}
      {activeTab === 1 && (
        <Box sx={{ mt: 2 }}>
          <SummaryMetricsTab
            epochs={analysis.epochs}
            analysis={analysis}
            scenarioPerf={scenarioPerf}
          />
        </Box>
      )}

      {/* ─── Tab 3: Olaylar ─── */}
      {activeTab === 2 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <EventsTab
              analysis={analysis}
              onShowInTimeline={() => setActiveTab(0)}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
