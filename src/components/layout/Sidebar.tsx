import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import FlightOutlinedIcon from '@mui/icons-material/FlightOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useAuth } from '../../auth/AuthContext';
import { palette } from '../../theme/tokens';
import { useTheme } from '@mui/material/styles';

const SIDEBAR_WIDTH = 240;

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  roles: ('pilot' | 'instructor')[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Gösterge Paneli', to: '/dashboard', icon: <DashboardOutlinedIcon />, roles: ['pilot', 'instructor'] },
  { label: 'Senaryolar', to: '/scenarios', icon: <MapOutlinedIcon />, roles: ['pilot', 'instructor'] },
  { label: 'Pilotlar', to: '/pilots', icon: <PeopleOutlineIcon />, roles: ['instructor'] },
  { label: 'Pilot Karşılaştırma', to: '/pilots/compare', icon: <PeopleOutlineIcon />, roles: ['instructor'] },
  { label: 'Uçuş Karşılaştırma', to: '/flights/compare', icon: <CompareArrowsIcon />, roles: ['pilot', 'instructor'] },
  { label: 'Simülasyon Yükle', to: '/upload', icon: <CloudUploadOutlinedIcon />, roles: ['pilot', 'instructor'] },
];

export function Sidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const visibleItems = NAV_ITEMS.filter(
    (item) => !currentUser || item.roles.includes(currentUser.role)
  );

  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderRight: `1px solid ${isDark ? palette.borderDark : palette.borderLight}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 2, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <FlightOutlinedIcon sx={{ color: palette.accent, fontSize: 22 }} />
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ color: 'text.primary', lineHeight: 1.3, fontSize: '0.8rem' }}
        >
          Pilot Performans
          <br />
          Platformu
        </Typography>
      </Box>

      <Divider />

      <List dense sx={{ pt: 1, flex: 1 }}>
        {visibleItems.map((item) => {
          const isActive =
            item.to === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.to);

          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.25,
                borderLeft: isActive ? `3px solid ${palette.primary}` : '3px solid transparent',
                bgcolor: 'transparent',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive ? palette.primary : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'text.primary' : 'text.secondary',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
