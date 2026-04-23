import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { SCENARIOS, SCENARIO_CATEGORIES } from '../data/scenarios';
import { usePilots } from '../hooks/usePilots';
import { PageHeader } from '../components/common/PageHeader';
import { fmt1 } from '../utils/format';
import { palette } from '../theme/tokens';

const DIFFICULTY_LABELS: Record<number, string> = { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' };

function DifficultyDots({ level }: { level: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: i <= level ? palette.accent : 'divider',
          }}
        />
      ))}
    </Box>
  );
}

export default function ScenarioLibraryPage() {
  const navigate = useNavigate();
  const { scenarioPerformances } = usePilots();
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);
  const [showCancelled, setShowCancelled] = useState(false);

  const scenarioStats = useMemo(() => {
    const map: Record<number, { count: number; avgCpi: number }> = {};
    for (const sp of scenarioPerformances) {
      if (!map[sp.scenarioId]) map[sp.scenarioId] = { count: 0, avgCpi: 0 };
      map[sp.scenarioId].count += 1;
      map[sp.scenarioId].avgCpi += sp.cpi;
    }
    for (const id in map) {
      map[id].avgCpi /= map[id].count;
    }
    return map;
  }, [scenarioPerformances]);

  const filtered = useMemo(() => {
    return SCENARIOS.filter((s) => {
      if (!showCancelled && !s.active) return false;
      if (difficultyFilter !== null && s.difficulty !== difficultyFilter) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(s.category)) return false;
      const q = search.toLowerCase();
      if (q && !s.code.toLowerCase().includes(q) && !s.titleTr.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [search, selectedCategories, difficultyFilter, showCancelled]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <Box>
      <PageHeader title="Senaryo Kütüphanesi" subtitle="NASA SOTERIA simülatör senaryoları" />

      {/* Filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Senaryo ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ width: 220 }}
        />

        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          {Object.entries(SCENARIO_CATEGORIES)
            .filter(([k]) => k !== 'cancelled')
            .map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                size="small"
                onClick={() => toggleCategory(key)}
                color={selectedCategories.includes(key) ? 'primary' : 'default'}
                variant={selectedCategories.includes(key) ? 'filled' : 'outlined'}
              />
            ))}
        </Box>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={difficultyFilter}
          onChange={(_, v) => setDifficultyFilter(v)}
        >
          {[1, 2, 3, 4, 5].map((d) => (
            <ToggleButton key={d} value={d} sx={{ px: 1.5, fontSize: '0.75rem' }}>
              {DIFFICULTY_LABELS[d]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
            />
          }
          label={<Typography variant="caption">İptal edileni göster</Typography>}
        />
      </Box>

      {/* Grid */}
      <Grid container spacing={2}>
        {filtered.map((scenario) => {
          const stats = scenarioStats[scenario.id];
          return (
            <Grid item xs={12} sm={6} md={4} key={scenario.id}>
              <Card
                sx={{
                  height: '100%',
                  opacity: scenario.active ? 1 : 0.6,
                  '&:hover': { borderColor: 'primary.main' },
                  transition: 'border-color 150ms',
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/scenarios/${scenario.id}`)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {scenario.code}
                    </Typography>

                    <Tooltip title={scenario.titleTr}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{
                          mt: 0.5,
                          mb: 1,
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                          overflow: 'hidden',
                        }}
                      >
                        {scenario.titleTr}
                      </Typography>
                    </Tooltip>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Chip
                        label={SCENARIO_CATEGORIES[scenario.category]}
                        size="small"
                        sx={{ height: 20, fontSize: '0.68rem' }}
                      />
                      <DifficultyDots level={scenario.difficulty} />
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {stats
                        ? `${stats.count} pilot uçtu • Ort. CPI: ${fmt1(stats.avgCpi)}`
                        : 'Veri yok'}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
