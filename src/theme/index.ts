import { createTheme, Theme } from '@mui/material/styles';
import { palette } from './tokens';

export function buildTheme(mode: 'light' | 'dark'): Theme {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: { main: palette.primary, light: palette.primaryLight, dark: palette.primaryDark },
      background: {
        default: isDark ? palette.bgDark : palette.bgLight,
        paper: isDark ? palette.surfaceDark : palette.surfaceLight,
      },
      text: {
        primary: isDark ? palette.textDark : palette.textLight,
        secondary: isDark ? palette.textMutedDark : palette.textMutedLight,
      },
      success: { main: palette.success },
      warning: { main: palette.warning },
      error: { main: palette.danger },
      info: { main: palette.info },
      divider: isDark ? palette.borderDark : palette.borderLight,
    },
    typography: {
      fontFamily: "'Inter', -apple-system, sans-serif",
      h1: { fontWeight: 600, letterSpacing: '-0.01em' },
      h2: { fontWeight: 600, letterSpacing: '-0.01em' },
      h3: { fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      caption: {
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontWeight: 500,
      },
    },
    components: {
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 6,
            border: `1px solid ${isDark ? palette.borderDark : palette.borderLight}`,
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 6,
            textTransform: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 4 } },
      },
    },
    shape: { borderRadius: 6 },
  });
}
