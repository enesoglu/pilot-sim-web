
import Chip from '@mui/material/Chip';
import type { CPIClass } from '../../data/types';
import { classifyCPI } from '../../theme/tokens';
import { cpiClassColor } from '../../utils/colors';

interface Props {
  cpi?: number;
  cpiClass?: CPIClass;
  size?: 'small' | 'medium';
}

export function CPIBadge({ cpi, cpiClass, size = 'small' }: Props) {
  const cls: CPIClass = cpiClass ?? (cpi != null ? classifyCPI(cpi) : 'Orta');
  return (
    <Chip
      label={cls}
      size={size}
      sx={{
        bgcolor: cpiClassColor(cls),
        color: '#fff',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
        height: size === 'small' ? 20 : 26,
        borderRadius: 1,
      }}
    />
  );
}
