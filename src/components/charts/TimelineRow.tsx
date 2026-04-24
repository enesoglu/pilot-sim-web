import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface SeriesConfig {
  key: string;
  color: string;
  label: string;
}

export type TimelineRowType = 'lines' | 'probability' | 'event_band';

export interface TimelineRowConfig {
  id: string;
  label: string;
  height: number;
  type: TimelineRowType;
  series?: SeriesConfig[];
  yDomain?: [number, number] | 'auto';
}

/** Width reserved for the YAxis tick labels inside Recharts, used to align event band. */
export const YAXIS_W = 36;

interface Props {
  config: TimelineRowConfig;
  data: Record<string, number>[];
  syncId: string;
  showXAxisLabels: boolean;
  showZLabel: boolean;
  labelWidth: number;
}

/** One row in SyncedTimeline — a line/area chart or the CSS event-band strip. */
export function TimelineRow({
  config,
  data,
  syncId,
  showXAxisLabels,
  showZLabel,
  labelWidth,
}: Props) {
  const { label, height, type, series = [], yDomain = 'auto' } = config;

  // Event band: pure CSS flex strip, no Recharts needed.
  if (type === 'event_band') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
        <Box sx={{ width: labelWidth, flexShrink: 0, pr: 1, textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            {label}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            height,
            display: 'flex',
            overflow: 'hidden',
            borderRadius: '2px',
            ml: `${YAXIS_W}px`,
            mr: '8px',
          }}
        >
          {data.map((pt, i) => (
            <Box
              key={i}
              title={
                pt['eventLabel'] === 1
                  ? `Epoch ${pt['x']}: Stres Olayı`
                  : `Epoch ${pt['x']}: Normal`
              }
              sx={{
                flex: 1,
                bgcolor:
                  pt['eventLabel'] === 1
                    ? 'rgba(185,28,28,0.78)'
                    : 'rgba(128,128,128,0.1)',
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  const isProbability = type === 'probability';
  const domain: [number | string, number | string] = isProbability
    ? [0, 1]
    : yDomain === 'auto'
    ? ['auto', 'auto']
    : yDomain;

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
      {/* Row label */}
      <Box sx={{ width: labelWidth, flexShrink: 0, pt: 1, pr: 1, textAlign: 'right' }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: '0.68rem', display: 'block', lineHeight: 1.4 }}
        >
          {label}
        </Typography>
        {isProbability ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.60rem', display: 'block', opacity: 0.5 }}
          >
            [0–1]
          </Typography>
        ) : (
          showZLabel && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '0.60rem', display: 'block', opacity: 0.5 }}
            >
              [z-skoru]
            </Typography>
          )
        )}
      </Box>

      {/* Chart */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} syncId={syncId} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(128,128,128,0.12)"
            />
            <XAxis
              dataKey="x"
              hide={!showXAxisLabels}
              tick={{ fontSize: 10, fill: 'currentColor' }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              domain={domain}
              tick={{ fontSize: 9, fill: 'currentColor' }}
              axisLine={false}
              tickLine={false}
              width={YAXIS_W}
              tickCount={isProbability ? 3 : 4}
              tickFormatter={(v: number) => v.toFixed(isProbability ? 1 : 1)}
            />
            <Tooltip
              contentStyle={{
                fontSize: '0.72rem',
                fontFamily: 'Inter, sans-serif',
                padding: '6px 10px',
                borderRadius: '4px',
              }}
              formatter={(value: unknown, name: string) => {
                const s = series.find((sr) => sr.key === name);
                const numVal =
                  typeof value === 'number' ? value.toFixed(3) : String(value);
                return [numVal, s?.label ?? name];
              }}
              labelFormatter={(lbl: unknown) => `Epoch ${lbl}`}
            />

            {series.map((s) =>
              isProbability ? (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  fill={s.color}
                  fillOpacity={0.13}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              ) : (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              )
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
