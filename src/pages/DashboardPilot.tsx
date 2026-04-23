import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import MuiLink from '@mui/material/Link';
import { Link } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { useAuth } from '../auth/AuthContext';
import { usePilots } from '../hooks/usePilots';
import { useFlights } from '../hooks/useFlights';
import { ScoreTile } from '../components/common/ScoreTile';
import { CPIBadge } from '../components/common/CPIBadge';
import { HeatmapGrid } from '../components/domain/HeatmapGrid';
import { EmptyState } from '../components/common/EmptyState';
import { SCENARIOS } from '../data/scenarios';
import { fmt1 } from '../utils/format';
import { palette } from '../theme/tokens';
import FlightIcon from '@mui/icons-material/FlightOutlined';

export default function DashboardPilot() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { pilots, scenarioPerformances, loading } = usePilots();
  const flights = useFlights(scenarioPerformances);

  const pilotId = currentUser
    ? `${currentUser.crew}-${currentUser.seat}`
    : null;

  const pilot = useMemo(
    () => pilots.find((p) => p.id === pilotId),
    [pilots, pilotId]
  );

  const myFlights = useMemo(
    () => (pilotId ? flights.filter((f) => f.pilotId === pilotId) : []),
    [flights, pilotId]
  );

  const activeScenarios = useMemo(
    () => SCENARIOS.filter((s) => s.active).sort((a, b) => a.id - b.id),
    []
  );

  const latestFlight = useMemo(() => {
    if (!myFlights.length) return null;
    return [...myFlights].sort((a, b) => b.scenarioId - a.scenarioId)[0];
  }, [myFlights]);

  const latestScenario = useMemo(
    () => SCENARIOS.find((s) => s.id === latestFlight?.scenarioId),
    [latestFlight]
  );

  const sparkData = useMemo(() => {
    return activeScenarios.map((s) => {
      const f = myFlights.find((fl) => fl.scenarioId === s.id);
      return { code: s.code, cpi: f?.cpi ?? null };
    });
  }, [activeScenarios, myFlights]);

  const heatmapRows = useMemo(() => {
    if (!pilot) return [];
    return [
      {
        id: pilot.id,
        label: pilot.displayName.split('(')[0].trim(),
        values: activeScenarios.map((s) => {
          const f = myFlights.find((fl) => fl.scenarioId === s.id);
          return f?.cpi ?? null;
        }),
      },
    ];
  }, [pilot, activeScenarios, myFlights]);

  const heatmapCols = useMemo(
    () => activeScenarios.map((s) => ({ id: s.id, label: s.code })),
    [activeScenarios]
  );

  if (loading) return <CircularProgress />;
  if (!pilot)
    return (
      <EmptyState
        title="Pilot profili bulunamadı"
        description="Oturum bilgileri eksik olabilir."
      />
    );

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Gösterge Paneli
      </Typography>

      {/* Row 1 — Hero */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: '0.08em', fontSize: '0.72rem' }}
          >
            Son Uçuşunuz
          </Typography>

          {latestFlight && latestScenario ? (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 3,
                mt: 1,
              }}
            >
              <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'primary.main',
                    mb: 0.5,
                  }}
                >
                  {latestScenario.code}
                </Typography>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                  {latestScenario.titleTr}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  flex: '0 0 auto',
                  alignItems: 'flex-start',
                }}
              >
                <ScoreTile
                  value={fmt1(latestFlight.cpi)}
                  label="CPI"
                  variant="cpi"
                  cpiClass={latestFlight.cpiClass}
                  size="lg"
                />
                <ScoreTile
                  value={fmt1(latestFlight.peakStressPct)}
                  label="Tepe Stres"
                  variant="percent"
                  size="lg"
                />
                <ScoreTile
                  value={fmt1(latestFlight.avgCognitiveLoadPct)}
                  label="Ort. Bilişsel Yük"
                  variant="percent"
                  size="lg"
                />
              </Box>

              <Box sx={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<FlightIcon />}
                  onClick={() => navigate(`/flights/${latestFlight.id}`)}
                >
                  Detayı İncele
                </Button>
              </Box>
            </Box>
          ) : (
            <EmptyState title="Uçuş kaydı yok" description="Henüz tamamlanmış senaryo bulunamadı." />
          )}
        </CardContent>
      </Card>

      {/* Row 2 — Mini Trend + Heatmap */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Mini Trend */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                CPI Trendi
              </Typography>
              <Box sx={{ height: 100, mt: 1 }}>
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
                      strokeWidth={2}
                      dot={{ r: 3, fill: palette.accent }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: '1.6rem',
                  }}
                >
                  {fmt1(pilot.cpiMean)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ortalama CPI
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Heatmap */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                Senaryo Performansı
              </Typography>
              <Box sx={{ mt: 1 }}>
                <HeatmapGrid
                  rows={heatmapRows}
                  columns={heatmapCols}
                  onCellClick={(_, colId) => {
                    const flight = myFlights.find((f) => f.scenarioId === colId);
                    if (flight) navigate(`/flights/${flight.id}`);
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 3 — Recent Flights Table */}
      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Uçuş Geçmişi
            </Typography>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem' }}>Senaryo</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem' }}>CPI</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem' }}>Tepe Stres</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem' }}>Bilişsel Yük</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.72rem' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myFlights.map((flight) => {
                const sc = SCENARIOS.find((s) => s.id === flight.scenarioId);
                return (
                  <TableRow key={flight.id} hover>
                    <TableCell>
                      <Typography
                        component="span"
                        sx={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'primary.main',
                          mr: 0.75,
                        }}
                      >
                        {sc?.code}
                      </Typography>
                      <Typography component="span" variant="caption" color="text.secondary">
                        {sc?.titleTr}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', fontWeight: 700 }}>
                          {fmt1(flight.cpi)}
                        </Typography>
                        <CPIBadge cpiClass={flight.cpiClass} />
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
                      %{fmt1(flight.peakStressPct)}
                    </TableCell>
                    <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
                      %{fmt1(flight.avgCognitiveLoadPct)}
                    </TableCell>
                    <TableCell>
                      <MuiLink
                        component={Link}
                        to={`/flights/${flight.id}`}
                        sx={{ fontSize: '0.78rem' }}
                        underline="hover"
                      >
                        İncele
                      </MuiLink>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
