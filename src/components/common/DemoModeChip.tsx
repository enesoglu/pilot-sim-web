
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { palette } from '../../theme/tokens';

export function DemoModeChip() {
  return (
    <Tooltip title="Bu sürüm gerçek pilot verileriyle çalışan bir prototiptir.">
      <Chip
        label="DEMO"
        size="small"
        sx={{
          height: 20,
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          bgcolor: palette.accent,
          color: '#fff',
          borderRadius: 1,
          cursor: 'default',
        }}
      />
    </Tooltip>
  );
}
