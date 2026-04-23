import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Box from '@mui/material/Box';
import { cpiColor } from '../../utils/colors';

interface ScenarioBar {
  code: string;
  label: string;
  avgCpi: number;
}

interface Props {
  data: ScenarioBar[];
  height?: number;
}

/** Vertical bar chart — one bar per scenario, colored by average CPI. */
export function ScenarioComparisonBars({ data, height = 220 }: Props) {
  return (
    <Box>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
          <XAxis
            dataKey="code"
            tick={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fill: 'currentColor',
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            formatter={(v) => [`${(v as number).toFixed(1)}`, 'Ort. CPI']}
            labelFormatter={(label) => {
              const item = data.find((d) => d.code === label);
              return item ? `${item.code} — ${item.label}` : label;
            }}
            contentStyle={{
              fontSize: '0.78rem',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <ReferenceLine y={70} strokeDasharray="4 2" stroke="rgba(46,125,50,0.5)" />
          <ReferenceLine y={55} strokeDasharray="4 2" stroke="rgba(183,121,31,0.5)" />
          <Bar dataKey="avgCpi" radius={[3, 3, 0, 0]} maxBarSize={56}>
            {data.map((entry, i) => (
              <Cell key={i} fill={cpiColor(entry.avgCpi)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

/** Grouped multi-pilot CPI bar chart for PilotComparePage. */
export interface GroupedBarEntry {
  code: string;
  [pilotId: string]: string | number;
}

interface GroupedProps {
  data: GroupedBarEntry[];
  pilots: { id: string; shortName: string; color: string }[];
  height?: number;
}

export function GroupedCPIBars({ data, pilots, height = 280 }: GroupedProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
        <XAxis
          dataKey="code"
          tick={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fill: 'currentColor',
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: 'currentColor' }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          contentStyle={{ fontSize: '0.78rem', fontFamily: 'Inter, sans-serif' }}
          formatter={(v, name) => {
            const pilot = pilots.find((p) => p.id === name);
            return [`${(v as number).toFixed(1)}`, pilot?.shortName ?? String(name)];
          }}
        />
        <ReferenceLine y={70} strokeDasharray="4 2" stroke="rgba(46,125,50,0.4)" />
        <ReferenceLine y={55} strokeDasharray="4 2" stroke="rgba(183,121,31,0.4)" />
        {pilots.map((p) => (
          <Bar key={p.id} dataKey={p.id} name={p.id} fill={p.color} radius={[2, 2, 0, 0]} maxBarSize={28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
