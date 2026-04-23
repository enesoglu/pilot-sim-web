export const palette = {
  primary: '#112D4E',
  primaryLight: '#1E3A5F',
  primaryDark: '#0A1F38',
  accent: '#B47B3A',

  bgLight: '#F5F7FA',
  surfaceLight: '#FFFFFF',
  borderLight: '#E2E8F0',
  textLight: '#1E293B',
  textMutedLight: '#64748B',

  bgDark: '#0A1929',
  surfaceDark: '#102841',
  borderDark: '#1E3556',
  textDark: '#E5EAF2',
  textMutedDark: '#8B9BB4',

  success: '#2E7D32',
  warning: '#B7791F',
  danger: '#B91C1C',
  info: '#1565C0',
} as const;

export type CPIClass = 'Yüksek' | 'Orta' | 'Gelişim Gerekli';

export function classifyCPI(cpi: number): CPIClass {
  if (cpi >= 70) return 'Yüksek';
  if (cpi >= 55) return 'Orta';
  return 'Gelişim Gerekli';
}

export function cpiToColor(cpi: number): string {
  const cls = classifyCPI(cpi);
  if (cls === 'Yüksek') return palette.success;
  if (cls === 'Orta') return palette.warning;
  return palette.danger;
}
