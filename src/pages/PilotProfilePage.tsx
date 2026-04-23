import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import MuiLink from '@mui/material/Link';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { usePilots } from '../hooks/usePilots';
import { useInstructorNotes } from '../hooks/useInstructorNotes';
import { useAuth } from '../auth/AuthContext';
import { SCENARIOS } from '../data/scenarios';
import { PageHeader } from '../components/common/PageHeader';
import { CPIBadge } from '../components/common/CPIBadge';
import { EmptyState } from '../components/common/EmptyState';
import { NoteCard } from '../components/domain/NoteCard';
import { NoteForm } from '../components/domain/NoteForm';
import { fmt1 } from '../utils/format';
import { cpiColor } from '../utils/colors';
import { palette } from '../theme/tokens';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartTooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function CapacityBar({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption">{label}</Typography>
        <Typography variant="caption" fontFamily="'JetBrains Mono', monospace" fontWeight={600}>
          {fmt1(value)}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, value)}
        sx={{ height: 6, borderRadius: 3, bgcolor: 'divider' }}
      />
    </Box>
  );
}

export default function PilotProfilePage() {
  const { pilotId } = useParams<{ pilotId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { pilots, scenarioPerformances, loading } = usePilots();
  const { notes, addNote, deleteNote } = useInstructorNotes(pilotId ?? '');

  const pilot = pilots.find((p) => p.id === pilotId);
  const perfs = useMemo(
    () => scenarioPerformances.filter((sp) => sp.pilotId === pilotId),
    [scenarioPerformances, pilotId]
  );

  const scenarioMap = useMemo(
    () => Object.fromEntries(SCENARIOS.map((s) => [s.id, s])),
    []
  );

  const chartData = useMemo(() => {
    return SCENARIOS.filter((s) => s.active).map((s) => {
      const perf = perfs.find((p) => p.scenarioId === s.id);
      return { code: s.code, cpi: perf?.cpi ?? null, scenarioId: s.id };
    });
  }, [perfs]);

  const meanCPI = useMemo(() => {
    const vals = perfs.map((p) => p.cpi).filter((v) => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [perfs]);

  const sorted = useMemo(() => [...perfs].sort((a, b) => a.cpi - b.cpi), [perfs]);
  const worst2 = sorted.slice(0, 2);
  const best2 = sorted.slice(-2).reverse();

  if (loading) return <CircularProgress />;
  if (!pilot) return <Typography>Pilot bulunamadı.</Typography>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pilots')} size="small" sx={{ mb: 2 }}>
        Geri
      </Button>

      <PageHeader
        breadcrumbs={[{ label: 'Pilotlar', to: '/pilots' }, { label: pilot.displayName }]}
        title=""
      />

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar sx={{ bgcolor: palette.primary, width: 56, height: 56, fontSize: '1.1rem', fontWeight: 700 }}>
          {initials(pilot.displayName)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            {pilot.displayName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <CPIBadge cpiClass={pilot.cpiClass} />
            <Chip label={`${notes.length} not`} size="small" variant="outlined" />
          </Box>
        </Box>
      </Box>

      {/* Section 1 — Performance Snapshot */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
                Senaryo Bazlı CPI Performansı
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="code" tick={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace" }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <RechartTooltip formatter={(v) => [v != null ? fmt1(v as number) : '—', 'CPI']} />
                  <ReferenceLine y={meanCPI} stroke={palette.info} strokeDasharray="4 2" label={{ value: `Ort. ${fmt1(meanCPI)}`, fontSize: 10, fill: palette.info }} />
                  <Bar dataKey="cpi" radius={[2, 2, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.code} fill={entry.cpi != null ? cpiColor(entry.cpi) : '#ccc'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
                Bireysel Kapasite Puanları
              </Typography>
              <CapacityBar label="ERS" value={pilot.ersScore} />
              <CapacityBar label="SE" value={pilot.seScore} />
              <CapacityBar label="AvRes" value={pilot.avResScore} />
              <CapacityBar label="SysRes" value={pilot.sysResScore} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section 2 — Strengths & Weaknesses */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: `1px solid ${palette.success}` }}>
            <CardContent>
              <Typography variant="caption" sx={{ mb: 1, display: 'block', color: palette.success }}>
                Güçlü Olduğu Senaryolar
              </Typography>
              {best2.map((p) => (
                <Box key={p.scenarioId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{scenarioMap[p.scenarioId]?.titleTr ?? `Senaryo ${p.scenarioId}`}</Typography>
                  <Typography variant="body2" fontFamily="'JetBrains Mono', monospace" fontWeight={600}>
                    {fmt1(p.cpi)}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: `1px solid ${palette.danger}` }}>
            <CardContent>
              <Typography variant="caption" sx={{ mb: 1, display: 'block', color: palette.danger }}>
                Geliştirilmesi Gereken Senaryolar
              </Typography>
              {worst2.map((p) => (
                <Box key={p.scenarioId} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">{scenarioMap[p.scenarioId]?.titleTr ?? `Senaryo ${p.scenarioId}`}</Typography>
                  <Typography variant="body2" fontFamily="'JetBrains Mono', monospace" fontWeight={600}>
                    {fmt1(p.cpi)}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section 3 — Flight History */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="caption" sx={{ mb: 1.5, display: 'block' }}>
            Uçuş Geçmişi
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: '0.75rem' }}>Senaryo</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>CPI</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>TLX</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>SART</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>RPSA</TableCell>
                <TableCell sx={{ fontSize: '0.75rem' }}>Detay</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {perfs.map((p) => (
                <TableRow key={p.scenarioId} hover>
                  <TableCell sx={{ fontSize: '0.82rem' }}>
                    <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem' }}>
                      {scenarioMap[p.scenarioId]?.code}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {scenarioMap[p.scenarioId]?.titleTr}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: '0.85rem' }}>
                        {fmt1(p.cpi)}
                      </Typography>
                      <CPIBadge cpi={p.cpi} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>{fmt1(p.tlxScore)}</TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>{fmt1(p.sartScore)}</TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>{fmt1(p.rpsaScore)}</TableCell>
                  <TableCell>
                    <MuiLink component={Link} to={`/flights/${p.pilotId}-s${p.scenarioId}`} underline="hover" sx={{ fontSize: '0.8rem' }}>
                      İncele
                    </MuiLink>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Section 4 — Eğitmen Notları */}
      <Card>
        <CardContent>
          <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
            Eğitmen Notları
          </Typography>
          {notes.length === 0 ? (
            <EmptyState title="Bu pilot için henüz not eklenmedi." />
          ) : (
            notes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} />
            ))
          )}
          <NoteForm onAdd={(text) => addNote(text, currentUser?.name ?? 'Eğitmen')} />
        </CardContent>
      </Card>
    </Box>
  );
}
