import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import { usePilots } from '../hooks/usePilots';
import { PageHeader } from '../components/common/PageHeader';
import { CPIBadge } from '../components/common/CPIBadge';
import { fmt1 } from '../utils/format';
import { palette } from '../theme/tokens';
import type { CPIClass } from '../data/types';

type SortOption = 'cpi_desc' | 'cpi_asc' | 'name' | 'crew';

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export default function PilotListPage() {
  const navigate = useNavigate();
  const { pilots, loading } = usePilots();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState<CPIClass | 'all'>('all');
  const [sort, setSort] = useState<SortOption>('cpi_desc');

  const filtered = useMemo(() => {
    return pilots
      .filter((p) => {
        if (classFilter !== 'all' && p.cpiClass !== classFilter) return false;
        const q = search.toLowerCase();
        return !q || p.displayName.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sort === 'cpi_desc') return b.cpiMean - a.cpiMean;
        if (sort === 'cpi_asc') return a.cpiMean - b.cpiMean;
        if (sort === 'name') return a.displayName.localeCompare(b.displayName);
        return a.crew - b.crew;
      });
  }, [pilots, search, classFilter, sort]);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <PageHeader title="Pilot Listesi" subtitle={`${pilots.length} pilot • Ekip karşılaştırması`} />

      {/* Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Pilot ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 200 }}
        />

        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {(['all', 'Yüksek', 'Orta', 'Gelişim Gerekli'] as const).map((cls) => (
            <Chip
              key={cls}
              label={cls === 'all' ? 'Tümü' : cls}
              size="small"
              onClick={() => setClassFilter(cls)}
              color={classFilter === cls ? 'primary' : 'default'}
              variant={classFilter === cls ? 'filled' : 'outlined'}
            />
          ))}
        </Box>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={sort}
          onChange={(_, v) => v && setSort(v)}
        >
          <ToggleButton value="cpi_desc" sx={{ fontSize: '0.72rem', px: 1.2 }}>CPI ↓</ToggleButton>
          <ToggleButton value="cpi_asc" sx={{ fontSize: '0.72rem', px: 1.2 }}>CPI ↑</ToggleButton>
          <ToggleButton value="name" sx={{ fontSize: '0.72rem', px: 1.2 }}>A-Z</ToggleButton>
          <ToggleButton value="crew" sx={{ fontSize: '0.72rem', px: 1.2 }}>Ekip No.</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={2}>
        {filtered.map((pilot) => (
          <Grid item xs={12} sm={6} md={4} key={pilot.id}>
            <Card sx={{ '&:hover': { borderColor: 'primary.main' }, transition: 'border-color 150ms' }}>
              <CardActionArea onClick={() => navigate(`/pilots/${pilot.id}`)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Avatar
                      sx={{
                        bgcolor: palette.primary,
                        width: 40,
                        height: 40,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      {initials(pilot.displayName)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        title={pilot.displayName}
                      >
                        {pilot.displayName}
                      </Typography>
                      <CPIBadge cpiClass={pilot.cpiClass} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
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
                  <Typography variant="caption" color="text.secondary">
                    {pilot.nScenarios} senaryo
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
