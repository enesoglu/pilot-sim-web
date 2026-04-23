import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { ComposedChart, Area, XAxis, YAxis, Brush, ResponsiveContainer } from 'recharts';
import type { EpochRow } from '../../data/types';
import { TimelineRow, type TimelineRowConfig, YAXIS_W } from './TimelineRow';

const SYNC_ID = 'flight-timeline';
const LABEL_WIDTH = 100;

interface ChartPoint {
  x: number;
  eventLabel: number;
  hr: number;
  hrv: number;
  pupil: number;
  gaze: number;
  taskLoad: number;
  engagement: number;
  stressProbability: number;
  cognitiveLoadProbability: number;
  [key: string]: number;
}

const ROW_CONFIGS: TimelineRowConfig[] = [
  {
    id: 'cardiac',
    label: 'Fizyolojik — Kalp',
    height: 120,
    type: 'lines',
    series: [
      { key: 'hr', color: '#ef5350', label: 'Kalp Hızı' },
      { key: 'hrv', color: '#ff8a65', label: 'KKD (HRV)' },
    ],
  },
  {
    id: 'eye',
    label: 'Fizyolojik — Göz',
    height: 120,
    type: 'lines',
    series: [
      { key: 'pupil', color: '#ab47bc', label: 'Pupil Çapı' },
      { key: 'gaze', color: '#7e57c2', label: 'Bakış Varyansı' },
    ],
  },
  {
    id: 'cognitive',
    label: 'Bilişsel',
    height: 120,
    type: 'lines',
    series: [
      { key: 'taskLoad', color: '#26c6da', label: 'İş Yükü Endeksi' },
      { key: 'engagement', color: '#66bb6a', label: 'Katılım Endeksi' },
    ],
  },
  {
    id: 'model',
    label: 'Model Çıktıları',
    height: 100,
    type: 'probability',
    series: [
      { key: 'stressProbability', color: '#c62828', label: 'Stres Olasılığı' },
      { key: 'cognitiveLoadProbability', color: '#1565c0', label: 'Bilişsel Yük Olasılığı' },
    ],
  },
  {
    id: 'events',
    label: 'Olay Bandı',
    height: 32,
    type: 'event_band',
  },
];

// All series labels for the legend (excludes event_band)
const LEGEND_ITEMS = ROW_CONFIGS.flatMap((r) => r.series ?? []);

interface Props {
  epochs: EpochRow[];
  derivedSeries: {
    stress: number[];
    load: number[];
  };
}

/** Multi-row synchronized timeline with shared crosshair, brush zoom, and mode toggle. */
export function SyncedTimeline({ epochs, derivedSeries }: Props) {
  const [mode, setMode] = useState<'z' | 'raw'>('z');
  const [brushStart, setBrushStart] = useState(0);
  const [brushEnd, setBrushEnd] = useState(() => Math.max(0, epochs.length - 1));

  // Build full dataset once from epochs + derived model outputs
  const fullData: ChartPoint[] = useMemo(
    () =>
      epochs.map((epoch, i) => ({
        x: epoch.epochIndex,
        eventLabel: epoch.eventLabel,
        // Cardiac — prefer level z-score, fall back to gradient z-score
        hr:
          epoch.features['beats_per_min_anchored_z'] ??
          epoch.features['beats_per_min_anchored_grad_z'] ??
          0,
        hrv:
          epoch.features['hr_var_anchored_z'] ??
          epoch.features['hr_var_anchored_grad_z'] ??
          0,
        // Eye
        pupil:
          epoch.features['pupilD_avg_anchored_z'] ??
          epoch.features['pupilD_avg_z'] ??
          0,
        gaze:
          epoch.features['gaze_variance_anchored_z'] ??
          epoch.features['gaze_var_anchored_z'] ??
          0,
        // Cognitive
        taskLoad: epoch.features['taskLoad_index_spec_anchored_z'] ?? 0,
        engagement: epoch.features['engagement_index_spec_anchored_z'] ?? 0,
        // Model outputs (synthetic derived probabilities)
        stressProbability: derivedSeries.stress[i] ?? 0,
        cognitiveLoadProbability: derivedSeries.load[i] ?? 0,
      })),
    [epochs, derivedSeries]
  );

  // Sliced display data based on brush position
  const displayData: Record<string, number>[] = useMemo(
    () => fullData.slice(brushStart, brushEnd + 1),
    [fullData, brushStart, brushEnd]
  );

  function handleBrushChange(range: { startIndex?: number; endIndex?: number }) {
    if (range.startIndex != null) setBrushStart(range.startIndex);
    if (range.endIndex != null) setBrushEnd(range.endIndex);
  }

  return (
    <Box>
      {/* Mode toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v: 'z' | 'raw' | null) => v && setMode(v)}
          size="small"
          sx={{ '& .MuiToggleButton-root': { fontSize: '0.72rem', py: 0.5, px: 1.5 } }}
        >
          <ToggleButton value="z">Sapma (z-skoru)</ToggleButton>
          <ToggleButton value="raw">Ham Değerler</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Data rows — all share syncId for crosshair sync */}
      <Box>
        {ROW_CONFIGS.map((config, i) => (
          <TimelineRow
            key={config.id}
            config={config}
            // Display data is sliced by brush; all rows get same length → syncId works
            data={displayData}
            syncId={SYNC_ID}
            // Show X-axis epoch labels only on the row just above the event band
            showXAxisLabels={i === ROW_CONFIGS.length - 2}
            showZLabel={mode === 'z'}
            labelWidth={LABEL_WIDTH}
          />
        ))}
      </Box>

      {/*
       * Brush context chart — separate from display rows.
       * Shows FULL data so user sees the complete time range while dragging.
       * No syncId: prevents hover interference with the main rows.
       */}
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
        <Box sx={{ width: LABEL_WIDTH, flexShrink: 0, pr: 1, textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            Yakınlaştır
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ResponsiveContainer width="100%" height={64}>
            <ComposedChart data={fullData} margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
              <XAxis dataKey="x" hide />
              <YAxis domain={[0, 1]} hide width={YAXIS_W} />
              {/* Stress probability as context sparkline */}
              <Area
                type="monotone"
                dataKey="stressProbability"
                stroke="rgba(185,28,28,0.45)"
                fill="rgba(185,28,28,0.08)"
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
              <Brush
                dataKey="x"
                height={28}
                stroke="rgba(128,128,128,0.4)"
                onChange={handleBrushChange}
                travellerWidth={7}
                fill="rgba(128,128,128,0.07)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Color legend */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mt: 1.5,
          pl: `${LABEL_WIDTH + YAXIS_W}px`,
        }}
      >
        {LEGEND_ITEMS.map((s) => (
          <Box key={s.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 14,
                height: 2,
                bgcolor: s.color,
                borderRadius: 1,
                flexShrink: 0,
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Caption */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          mt: 1.5,
          pl: `${LABEL_WIDTH + YAXIS_W}px`,
          fontSize: '0.68rem',
          fontStyle: 'italic',
          opacity: 0.75,
        }}
      >
        Her epoch bir uçuş olayı penceresidir (sabit süreli değil). Z-skorlar pilotun kendi
        taban çizgisinden sapmayı gösterir.
      </Typography>
    </Box>
  );
}
