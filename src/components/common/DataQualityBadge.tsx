
import Chip from '@mui/material/Chip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { palette } from '../../theme/tokens';

interface Props {
  label: string;
  quality: 'good' | 'fair' | 'poor';
}

const CONFIG = {
  good: { color: palette.success, icon: <CheckCircleOutlineIcon fontSize="small" />, text: 'İyi' },
  fair: { color: palette.warning, icon: <WarningAmberOutlinedIcon fontSize="small" />, text: 'Orta' },
  poor: { color: palette.danger, icon: <ErrorOutlineIcon fontSize="small" />, text: 'Zayıf' },
};

export function DataQualityBadge({ label, quality }: Props) {
  const { color, icon, text } = CONFIG[quality];
  return (
    <Chip
      icon={icon}
      label={`${label}: ${text}`}
      size="small"
      variant="outlined"
      sx={{ borderColor: color, color, fontSize: '0.72rem', height: 24 }}
    />
  );
}
