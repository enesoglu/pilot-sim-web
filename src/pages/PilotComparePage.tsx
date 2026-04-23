import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { PageHeader } from '../components/common/PageHeader';
import { CPIBadge } from '../components/common/CPIBadge';
import { EmptyState } from '../components/common/EmptyState';
import { GroupedCPIBars, type GroupedBarEntry } from '../components/charts/ScenarioComparisonBars';
import { usePilots } from '../hooks/usePilots';
import { SCENARIOS } from '../data/scenarios';
import { fmt1 } from '../utils/format';
import type { PilotSummary } from '../data/types';

/** Five distinct colors for up to 5 compared pilots. */
const COMPARE_COLORS = [
  '#1565C0',
  '#B47B3A',
  '#2E7D32',
  '#B91C1C',
  '#6A1B9A',
];

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface CapacityBarProps {
  label: string;
  value: number | null;
}

function CapacityBar({ label, value }: CapacityBarProps) {
  const v = value ?? 0;
  return (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}
        >
          {value != null ? fmt1(v) : '—'}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, v)}
        sx={{ height: 5, borderRadius: 2, bgcolor: 'action.disabledBackground' }}
      />
    </Box>
  );
}

interface PilotCompareCardProps {
  pilot: PilotSummary;
  color: string;
}

function PilotCompareCard({ pilot, color }: PilotCompareCardProps) {
  const shortName = pilot.displayName.split('(')[0].trim();
  return (
    <Card sx={{ border: `2px solid ${color}`, height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar sx={{ bgcolor: color, width: 44, height: 44, fontSize: '0.9rem', fontWeight: 700 }}>
            {initials(shortName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap title={pilot.displayName}>
              {shortName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {pilot.displayName.match(/\(([^)]+)\)/)?.[1] ?? ''}
            </Typography>
          </Box>
        </Box>

        <CPIBadge cpiClass={pilot.cpiClass} />

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1.5, mb: 2 }}>
          <Typography
            sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '1.6rem' }}
          >
            {fmt1(pilot.cpiMean)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ort. CPI
          </Typography>
        </Box>

        <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          KAPASİTE PUANLARI
        </Typography>
        <CapacityBar label="ERS" value={pilot.ersScore} />
        <CapacityBar label="SE" value={pilot.seScore} />
        <CapacityBar label="AvRes" value={pilot.avResScore} />
        <CapacityBar label="SysRes" value={pilot.sysResScore} />
      </CardContent>
    </Card>
  );
}

export default function PilotComparePage() {
  const { pilots, scenarioPerformances, loading } = usePilots();
  const [selected, setSelected] = useState<PilotSummary[]>([]);

  const activeScenarios = useMemo(
    () => SCENARIOS.filter((s) => s.active).sort((a, b) => a.id - b.id),
    []
  );

  const groupedData = useMemo<GroupedBarEntry[]>(() => {
    return activeScenarios.map((s) => {
      const entry: GroupedBarEntry = { code: s.code };
      selected.forEach((pilot) => {
        const perf = scenarioPerformances.find(
          (sp) => sp.pilotId === pilot.id && sp.scenarioId === s.id
        );
        if (perf) entry[pilot.id] = perf.cpi;
      });
      return entry;
    });
  }, [selected, activeScenarios, scenarioPerformances]);

  const pilotChartMeta = useMemo(
    () =>
      selected.map((p, i) => ({
        id: p.id,
        shortName: p.displayName.split('(')[0].trim(),
        color: COMPARE_COLORS[i % COMPARE_COLORS.length],
      })),
    [selected]
  );

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <PageHeader
        title="Pilot Karşılaştırma"
        subtitle="2–5 pilot seçerek karşılaştırmalı analiz yapın"
      />

      {/* Pilot Picker */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Autocomplete
            multiple
            options={pilots}
            getOptionLabel={(p) => p.displayName}
            value={selected}
            onChange={(_, newVal) => {
              if (newVal.length <= 5) setSelected(newVal);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Karşılaştırılacak pilotları seçin (maks. 5)"
                placeholder="Pilot adı veya ekip numarası..."
                size="small"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((pilot, index) => {
                const tagProps = getTagProps({ index });
                return (
                  <Chip
                    {...tagProps}
                    key={pilot.id}
                    label={pilot.displayName.split('(')[0].trim()}
                    size="small"
                    sx={{ bgcolor: COMPARE_COLORS[index % COMPARE_COLORS.length], color: '#fff', fontWeight: 600 }}
                  />
                );
              })
            }
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
          />
          {selected.length > 0 && selected.length < 2 && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.75, display: 'block' }}>
              Karşılaştırma için en az 2 pilot seçin.
            </Typography>
          )}
        </CardContent>
      </Card>

      {selected.length === 0 && (
        <EmptyState
          title="Pilot seçilmedi"
          description="Yukarıdaki arama kutusundan 2–5 pilot seçerek karşılaştırmayı başlatın."
        />
      )}

      {selected.length >= 1 && (
        <>
          {/* Section 1 — Side-by-side cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {selected.map((pilot, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={pilot.id}>
                <PilotCompareCard pilot={pilot} color={COMPARE_COLORS[i % COMPARE_COLORS.length]} />
              </Grid>
            ))}
          </Grid>

          {/* Section 2 — Grouped bar chart */}
          {selected.length >= 2 && (
            <Card>
              <CardContent>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontSize: '0.68rem', letterSpacing: '0.08em', display: 'block', mb: 1 }}
                >
                  Senaryo Bazlı CPI Karşılaştırması
                </Typography>
                <GroupedCPIBars data={groupedData} pilots={pilotChartMeta} />

                {/* Per-scenario winner table */}
                <Box sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem' }}>Senaryo</TableCell>
                        {selected.map((p, i) => (
                          <TableCell key={p.id} sx={{ fontWeight: 600, fontSize: '0.72rem' }}>
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-block',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: COMPARE_COLORS[i % COMPARE_COLORS.length],
                                mr: 0.5,
                              }}
                            />
                            {p.displayName.split('(')[0].trim()}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeScenarios.map((s) => {
                        const perfs = selected.map((pilot) =>
                          scenarioPerformances.find(
                            (sp) => sp.pilotId === pilot.id && sp.scenarioId === s.id
                          )
                        );
                        const maxCpi = Math.max(
                          ...perfs.map((p) => p?.cpi ?? -Infinity)
                        );
                        return (
                          <TableRow key={s.id} hover>
                            <TableCell>
                              <Typography
                                component="span"
                                sx={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: 'primary.main',
                                  mr: 0.5,
                                }}
                              >
                                {s.code}
                              </Typography>
                            </TableCell>
                            {perfs.map((perf, i) => (
                              <TableCell
                                key={selected[i].id}
                                sx={{
                                  fontFamily: "'JetBrains Mono', monospace",
                                  fontSize: '0.82rem',
                                  fontWeight: perf?.cpi === maxCpi ? 700 : 400,
                                  color: perf?.cpi === maxCpi ? 'success.main' : 'text.primary',
                                }}
                              >
                                {perf ? fmt1(perf.cpi) : '—'}
                                {perf?.cpi === maxCpi && selected.length >= 2 && ' ★'}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}
