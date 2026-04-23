import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useThemeMode } from '../../theme/ThemeContext';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { palette } from '../../theme/tokens';
import { useTheme } from '@mui/material/styles';

const TOPBAR_HEIGHT = 56;
const SIDEBAR_WIDTH = 240;

export function Topbar() {
  const { mode, toggleMode } = useThemeMode();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: SIDEBAR_WIDTH,
        width: `calc(100% - ${SIDEBAR_WIDTH}px)`,
        height: TOPBAR_HEIGHT,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${isDark ? palette.borderDark : palette.borderLight}`,
        zIndex: 99,
      }}
    >
      <Toolbar variant="dense" sx={{ minHeight: TOPBAR_HEIGHT, px: 3 }}>
        {/* Breadcrumbs placeholder — pages override via PageHeader */}
        <Breadcrumbs sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            Pilot Performans Platformu
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Demo chip */}
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
              }}
            />
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip title={mode === 'dark' ? 'Açık Mod' : 'Koyu Mod'}>
            <IconButton size="small" onClick={toggleMode} sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* User menu */}
          {currentUser && (
            <>
              <Chip
                icon={<AccountCircleOutlinedIcon />}
                label={currentUser.name}
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ cursor: 'pointer', maxWidth: 200, fontSize: '0.75rem' }}
              />
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleLogout} sx={{ gap: 1, fontSize: '0.85rem' }}>
                  <LogoutIcon fontSize="small" />
                  Çıkış Yap
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
