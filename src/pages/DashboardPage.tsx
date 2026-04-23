
import { useAuth } from '../auth/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
        Gösterge Paneli
      </Typography>
      <Typography color="text.secondary">
        Hoş geldiniz, {currentUser?.name}. (Phase 2'de tamamlanacak)
      </Typography>
    </Box>
  );
}
