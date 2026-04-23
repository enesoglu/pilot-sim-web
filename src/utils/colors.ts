import { palette, classifyCPI } from '../theme/tokens';
import type { CPIClass } from '../data/types';

export function cpiClassColor(cls: CPIClass): string {
  if (cls === 'Yüksek') return palette.success;
  if (cls === 'Orta') return palette.warning;
  return palette.danger;
}

export function cpiColor(cpi: number): string {
  return cpiClassColor(classifyCPI(cpi));
}

/** Linear interpolation between red→yellow→green for 0–100 scale */
export function scoreToColor(value: number, min = 0, max = 100): string {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  if (t < 0.5) {
    const r = Math.round(183 + (183 - 183) * (t / 0.5));
    const g = Math.round(28 + (119 - 28) * (t / 0.5));
    return `rgb(${r},${g},28)`;
  }
  const r = Math.round(183 - (183 - 46) * ((t - 0.5) / 0.5));
  const g = Math.round(119 + (125 - 119) * ((t - 0.5) / 0.5));
  return `rgb(${r},${g},50)`;
}
