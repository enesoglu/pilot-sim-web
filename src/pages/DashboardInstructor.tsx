import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import RouteIcon from '@mui/icons-material/RouteOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmberOutlined';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { usePilots } from '../hooks/usePilots';
import { useFlights } from '../hooks/useFlights';
import { KPICard } from '../components/common/KPICard';
import { HeatmapGrid } from '../components/domain/HeatmapGrid';
import { PilotRow } from '../components/domain/PilotRow';
import { ScenarioComparisonBars } from '../components/charts/ScenarioComparisonBars';
import { SCENARIOS } from '../data/scenarios';
import { fmt1 } from '../utils/format';
import { palette } from '../theme/tokens';

export default function DashboardInstructor() {
  const navigate = useNavigate();
  const { pilots, scenarioPerformances, loading } = usePilots();
  const flights = useFlights(scenarioPerformances);

  const activeScenarios = useMemo(
    () => SCENARIOS.filter((s) => s.active).sort((a, b) => a.id - b.id),
    []
  );

  const avgCpi = useMemo(() => {
    if (!pilots.length) return 0;
    return pilots.reduce((sum, p) => sum + p.cpiMean, 0) / pilots.length;
  }, [pilots]);

  const riskyCount = useMemo(
    () => pilots.filter((p) => p.cpiClass === 'Gelişim Gerekli').length,
    [pilots]
  );

  const sortedPilots = useMemo(
    () => [...pilots].sort((a, b) => b.cpiMean - a.cpiMean),
    [pilots]
  );

  const topPilots = sortedPilots.slice(0, 5);
  const bottomPilots = sortedPilots.slice(-5).reverse();

  const heatmapRows = useMemo(() => {
    return sortedPilots.map((p) => ({
      id: p.id,
      label: p.displayName.split('(')[0].trim(),
      values: activeScenarios.map((s) => {
        const f = flights.find((fl) => fl.pilotId === p.id && fl.scenarioId === s.id);
        return f?.cpi ?? null;
      }),
    }));
  }, [sortedPilots, activeScenarios, flights]);

  const heatmapCols = useMemo(
    () => activeScenarios.map((s) => ({ id: s.id, label: s.code })),
    [activeScenarios]
  );

  const scenarioBars = useMemo(() => {
    return activeScenarios.map((s) => {
      const perfs = scenarioPerformances.filter((sp) => sp.scenarioId === s.id);
      const avg = perfs.length
        ? perfs.reduce((sum, sp) => sum + sp.cpi, 0) / perfs.length
        : 0;
      return { code: s.code, label: s.titleTr, avgCpi: avg };
    });
  }, [activeScenarios, scenarioPerformances]);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Eğitmen Gösterge Paneli
      </Typography>

      {/* Row 1 — KPI Strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Toplam Pilot"
            value={pilots.length}
            subtitle="Değerlendirilen pilot sayısı"
            icon={<PeopleOutlineIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Senaryo Sayısı"
            value={activeScenarios.length}
            subtitle="Aktif senaryo"
            icon={<RouteIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Ortalama CPI"
            value={fmt1(avgCpi)}
            subtitle="Tüm pilotlar ortalaması"
            icon={<EqualizerIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Riskli Pilot"
            value={riskyCount}
            subtitle="Gelişim Gerekli sınıfı"
            icon={<WarningAmberIcon />}
          />
        </Grid>
      </Grid>

      {/* Row 2 — Full Heatmap + Top/Bottom Panels */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Heatmap */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontSize: '0.68rem', letterSpacing: '0.08em', display: 'block', mb: 1 }}
              >
                Pilot × Senaryo CPI Haritası
              </Typography>
              <HeatmapGrid
                rows={heatmapRows}
                columns={heatmapCols}
                onCellClick={(rowId, colId) => {
                  const flight = flights.find(
                    (f) => f.pilotId === rowId && f.scenarioId === colId
                  );
                  if (flight) navigate(`/flights/${flight.id}`);
                }}
                onRowLabelClick={(rowId) => navigate(`/pilots/${rowId}`)}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Top / Bottom Pilots */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
            {/* Top 5 */}
            <Card sx={{ border: `1px solid ${palette.success}`, flex: 1 }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: palette.success, fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                    EN YÜKSEK PERFORMANS
                  </Typography>
                </Box>
                <Divider />
                {topPilots.map((p, i) => (
                  <PilotRow key={p.id} pilot={p} rank={i + 1} />
                ))}
              </CardContent>
            </Card>

            {/* Bottom 5 */}
            <Card sx={{ border: `1px solid ${palette.danger}`, flex: 1 }}>
              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: palette.danger, fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                    GELİŞİM GEREKLİ
                  </Typography>
                </Box>
                <Divider />
                {bottomPilots.map((p, i) => (
                  <PilotRow key={p.id} pilot={p} rank={sortedPilots.length - 4 + i} />
                ))}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Row 3 — Scenario Difficulty Strip */}
      <Card>
        <CardContent>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontSize: '0.68rem', letterSpacing: '0.08em', display: 'block', mb: 1 }}
          >
            Senaryo Ortalama CPI Karşılaştırması
          </Typography>
          <ScenarioComparisonBars data={scenarioBars} />
          <Box sx={{ display: 'flex', gap: 2.5, mt: 1, flexWrap: 'wrap' }}>
            {scenarioBars.map((b) => (
              <Box key={b.code} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.72rem',
                    color: 'text.secondary',
                  }}
                >
                  {b.code}
                </Typography>
                <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 700 }}>
                  {fmt1(b.avgCpi)}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
