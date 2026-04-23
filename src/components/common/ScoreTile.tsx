import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CPIBadge } from './CPIBadge';
import type { CPIClass } from '../../data/types';
import { palette } from '../../theme/tokens';

interface Props {
  value: string | number;
  label: string;
  delta?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'cpi' | 'percent' | 'plain';
  cpiClass?: CPIClass;
}

export function ScoreTile({ value, label, delta, size = 'md', variant = 'plain', cpiClass }: Props) {
  const valueFontSize = size === 'lg' ? '2.2rem' : size === 'md' ? '1.6rem' : '1.2rem';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
        <Typography
          sx={{
            fontSize: valueFontSize,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1,
          }}
        >
          {value}
          {variant === 'percent' && (
            <Typography component="span" sx={{ fontSize: '1rem', ml: 0.25 }}>
              %
            </Typography>
          )}
        </Typography>
        {delta !== undefined && (
          <Typography
            component="span"
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: delta >= 0 ? palette.success : palette.danger,
            }}
          >
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}
          </Typography>
        )}
      </Box>
      {variant === 'cpi' && cpiClass && (
        <Box sx={{ mt: 0.5 }}>
          <CPIBadge cpiClass={cpiClass} />
        </Box>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  );
}
