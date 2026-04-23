import { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import MuiLink from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SCENARIOS, SCENARIO_CATEGORIES } from '../data/scenarios';
import { usePilots } from '../hooks/usePilots';
import { PageHeader } from '../components/common/PageHeader';
import { CPIBadge } from '../components/common/CPIBadge';
import { fmt1 } from '../utils/format';
import { cpiColor } from '../utils/colors';
import { palette } from '../theme/tokens';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

type SortKey = 'displayName' | 'cpi' | 'tlxScore' | 'sartScore' | 'rpsaScore';

function DifficultyDots({ level }: { level: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.4, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          sx={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            bgcolor: i <= level ? palette.accent : 'divider',
          }}
        />
      ))}
    </Box>
  );
}

export default function ScenarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scenario = SCENARIOS.find((s) => s.id === Number(id));
  const { pilots, scenarioPerformances, loading } = usePilots();

  const [sortKey, setSortKey] = useState<SortKey>('cpi');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const perfs = useMemo(
    () => scenarioPerformances.filter((sp) => sp.scenarioId === Number(id)),
    [scenarioPerformances, id]
  );

  const pilotMap = useMemo(
    () => Object.fromEntries(pilots.map((p) => [p.id, p])),
    [pilots]
  );

  const rows = useMemo(
    () =>
      perfs
        .map((sp) => ({ ...sp, displayName: pilotMap[sp.pilotId]?.displayName ?? sp.pilotId }))
        .sort((a, b) => {
          const av = a[sortKey as keyof typeof a] as number | string;
          const bv = b[sortKey as keyof typeof b] as number | string;
          if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
          return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
        }),
    [perfs, pilotMap, sortKey, sortDir]
  );

  const stats = useMemo(() => {
    if (!rows.length) return null;
    const cpis = rows.map((r) => r.cpi);
    return {
      mean: cpis.reduce((a, b) => a + b, 0) / cpis.length,
      max: Math.max(...cpis),
      min: Math.min(...cpis),
      std: Math.sqrt(cpis.map((c) => (c - cpis.reduce((a, b) => a + b, 0) / cpis.length) ** 2).reduce((a, b) => a + b, 0) / cpis.length),
    };
  }, [rows]);

  const chartData = useMemo(
    () => [...rows].sort((a, b) => b.cpi - a.cpi).map((r) => ({ name: r.displayName.split(' ')[0], cpi: r.cpi, pilotId: r.pilotId })),
    [rows]
  );

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  if (!scenario) return <Typography>Senaryo bulunamadı.</Typography>;
  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/scenarios')} size="small" sx={{ mb: 2 }}>
        Geri
      </Button>

      <PageHeader
        title={scenario.titleTr}
        breadcrumbs={[{ label: 'Senaryolar', to: '/scenarios' }, { label: scenario.code }]}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Typography
          sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.1rem', color: 'text.secondary' }}
        >
          {scenario.code}
        </Typography>
        <Chip label={SCENARIO_CATEGORIES[scenario.category]} size="small" />
        <DifficultyDots level={scenario.difficulty} />
      </Box>

      {/* Section 1 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                Operasyonel Zorluklar
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {scenario.descTr}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                Değerlendirme Hedefleri
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                {scenario.goalTr}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section 2 — Performance Distribution */}
      {stats && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
              Performans Dağılımı — Tüm Pilotlar
            </Typography>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <RechartTooltip
                  formatter={(v: number) => [fmt1(v), 'CPI']}
                  labelFormatter={(l) => l}
                />
                <ReferenceLine y={stats.mean} stroke={palette.info} strokeDasharray="4 2" />
                <Bar dataKey="cpi" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.pilotId} fill={cpiColor(entry.cpi)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
              {[
                { label: 'Ortalama', val: stats.mean },
                { label: 'En Yüksek', val: stats.max },
                { label: 'En Düşük', val: stats.min },
                { label: 'Std. Sapma', val: stats.std },
              ].map(({ label, val }) => (
                <Box key={label}>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                    {fmt1(val)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Section 3 — Pilot Rankings */}
      <Card>
        <CardContent>
          <Typography variant="caption" sx={{ mb: 1.5, display: 'block' }}>
            Pilot Sıralaması
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                {(['displayName', 'cpi', 'tlxScore', 'sartScore', 'rpsaScore'] as SortKey[]).map(
                  (key) => (
                    <TableCell key={key} sx={{ fontSize: '0.75rem' }}>
                      <TableSortLabel
                        active={sortKey === key}
                        direction={sortDir}
                        onClick={() => handleSort(key)}
                      >
                        {key === 'displayName' ? 'Pilot' : key === 'cpi' ? 'CPI' : key === 'tlxScore' ? 'TLX' : key === 'sartScore' ? 'SART' : 'RPSA'}
                      </TableSortLabel>
                    </TableCell>
                  )
                )}
                <TableCell sx={{ fontSize: '0.75rem' }}>Detay</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.pilotId} hover>
                  <TableCell sx={{ fontSize: '0.82rem' }}>{r.displayName}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        sx={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        {fmt1(r.cpi)}
                      </Typography>
                      <CPIBadge cpi={r.cpi} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
                    {fmt1(r.tlxScore)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
                    {fmt1(r.sartScore)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
                    {fmt1(r.rpsaScore)}
                  </TableCell>
                  <TableCell>
                    <MuiLink
                      component={Link}
                      to={`/flights/${r.pilotId}-s${r.scenarioId}`}
                      underline="hover"
                      sx={{ fontSize: '0.8rem' }}
                    >
                      İncele
                    </MuiLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
