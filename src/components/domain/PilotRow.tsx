import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { CPIBadge } from '../common/CPIBadge';
import { fmt1 } from '../../utils/format';
import { palette } from '../../theme/tokens';
import type { PilotSummary } from '../../data/types';

interface Props {
  pilot: PilotSummary;
  rank?: number;
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Compact horizontal row — used in top/bottom pilot panels. */
export function PilotRow({ pilot, rank }: Props) {
  const navigate = useNavigate();
  const shortName = pilot.displayName.split('(')[0].trim();

  return (
    <ButtonBase
      onClick={() => navigate(`/pilots/${pilot.id}`)}
      sx={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.5,
        py: 1,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
        transition: 'background-color 150ms',
      }}
    >
      {rank != null && (
        <Typography
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
            color: 'text.disabled',
            width: 16,
            textAlign: 'right',
            flexShrink: 0,
          }}
        >
          {rank}
        </Typography>
      )}
      <Avatar
        sx={{
          bgcolor: palette.primary,
          width: 28,
          height: 28,
          fontSize: '0.7rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {initials(shortName)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" fontWeight={600} noWrap display="block">
          {shortName}
        </Typography>
        <CPIBadge cpiClass={pilot.cpiClass} />
      </Box>
      <Typography
        sx={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.85rem',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {fmt1(pilot.cpiMean)}
      </Typography>
    </ButtonBase>
  );
}
