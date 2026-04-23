import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FlightOutlinedIcon from '@mui/icons-material/FlightOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { palette } from '../theme/tokens';

export default function LoginPage() {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (role: 'pilot' | 'instructor') => {
    loginAs(role);
    navigate('/dashboard');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left 60% */}
      <Box
        sx={{
          width: '60%',
          bgcolor: palette.primary,
          display: 'flex',
          flexDirection: 'column',
          p: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlightOutlinedIcon sx={{ color: palette.accent, fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            Pilot Performans Platformu
          </Typography>
        </Box>

        {/* Cockpit silhouette SVG */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.12,
          }}
        >
          <svg viewBox="0 0 400 300" width="380" height="280" fill="white">
            {/* Stylized cockpit/aircraft geometric silhouette */}
            <polygon points="200,20 380,180 200,150 20,180" />
            <rect x="80" y="160" width="240" height="80" rx="4" />
            <rect x="120" y="180" width="60" height="40" rx="2" />
            <rect x="220" y="180" width="60" height="40" rx="2" />
            <rect x="185" y="155" width="30" height="90" rx="2" />
            <ellipse cx="200" cy="145" rx="30" ry="12" />
            <polygon points="20,180 0,240 80,200" />
            <polygon points="380,180 400,240 320,200" />
          </svg>
        </Box>

        {/* Tagline */}
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 480, lineHeight: 1.6 }}
        >
          NASA SOTERIA veri seti üzerinde çalışan, yapay zekâ destekli pilot performans
          değerlendirme platformu.
        </Typography>
      </Box>

      {/* Right 40% */}
      <Box
        sx={{
          width: '40%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Card sx={{ width: 340, p: 1 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 0.5 }}>
              Giriş Yap
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Demo amaçlı rol seçimi
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<FlightOutlinedIcon />}
              sx={{ mb: 1.5, py: 1.2 }}
              onClick={() => handleLogin('pilot')}
            >
              Pilot Olarak Gir
            </Button>

            <Button
              variant="outlined"
              fullWidth
              color="secondary"
              startIcon={<SchoolOutlinedIcon />}
              sx={{ py: 1.2 }}
              onClick={() => handleLogin('instructor')}
            >
              Eğitmen Olarak Gir
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 3, textAlign: 'center', textTransform: 'none' }}
            >
              Üretim sürümünde yetkili kullanıcı girişi yapılacaktır.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
