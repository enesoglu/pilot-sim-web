import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { scoreToColor } from '../../utils/colors';

export interface SubScore {
  label: string;
  value: number; // 0–100
}

interface Props {
  scores: SubScore[];
  title?: string;
}

/** Horizontal progress bars for CPI sub-scores (0–100 scale, red→yellow→green). */
export function SubScoreBars({ scores, title }: Props) {
  return (
    <Box>
      {title && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            mb: 1.5,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 500,
          }}
        >
          {title}
        </Typography>
      )}
      {scores.map(({ label, value }) => (
        <Box key={label} sx={{ mb: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              {value.toFixed(1)}
            </Typography>
          </Box>
          <Box sx={{ height: 6, borderRadius: 1, bgcolor: 'divider', overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, value))}%`,
                bgcolor: scoreToColor(value),
                borderRadius: 1,
                transition: 'width 400ms ease',
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
