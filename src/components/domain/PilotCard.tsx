import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from 'recharts';
import { CPIBadge } from '../common/CPIBadge';
import { fmt1 } from '../../utils/format';
import { palette } from '../../theme/tokens';
import type { PilotSummary, ScenarioPerformance } from '../../data/types';
import { SCENARIOS } from '../../data/scenarios';

interface Props {
  pilot: PilotSummary;
  scenarioPerformances: ScenarioPerformance[];
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Pilot card with avatar, class badge, mean CPI, and sparkline across scenarios. */
export function PilotCard({ pilot, scenarioPerformances }: Props) {
  const navigate = useNavigate();
  const activeScenarios = SCENARIOS.filter((s) => s.active).sort((a, b) => a.id - b.id);

  const sparkData = activeScenarios.map((s) => {
    const perf = scenarioPerformances.find(
      (sp) => sp.pilotId === pilot.id && sp.scenarioId === s.id
    );
    return { code: s.code, cpi: perf?.cpi ?? null };
  });

  const shortName = pilot.displayName.split('(')[0].trim();

  return (
    <Card sx={{ '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 150ms' }}>
      <CardActionArea onClick={() => navigate(`/pilots/${pilot.id}`)}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Avatar
              sx={{
                bgcolor: palette.primary,
                width: 40,
                height: 40,
                fontSize: '0.85rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials(shortName)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap title={pilot.displayName}>
                {pilot.displayName}
              </Typography>
              <CPIBadge cpiClass={pilot.cpiClass} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 1 }}>
            <Typography
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: '1.4rem',
              }}
            >
              {fmt1(pilot.cpiMean)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ort. CPI
            </Typography>
          </Box>

          {/* Sparkline */}
          <Box sx={{ height: 36, mx: -0.5 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <ReTooltip
                  formatter={(v) => [`${(v as number).toFixed(1)}`, 'CPI']}
                  contentStyle={{ fontSize: '0.72rem' }}
                />
                <Line
                  type="monotone"
                  dataKey="cpi"
                  stroke={palette.accent}
                  strokeWidth={1.5}
                  dot={false}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {pilot.nScenarios} senaryo
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
