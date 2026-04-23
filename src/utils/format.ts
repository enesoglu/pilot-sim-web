export function fmt1(n: number): string {
  return n.toFixed(1);
}

export function fmtPct(n: number): string {
  return `%${n.toFixed(1)}`;
}

export function fmtRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}
