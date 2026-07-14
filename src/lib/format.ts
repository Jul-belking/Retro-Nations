export function formatCountdown(remainMs: number): string {
  const remain = Math.max(0, remainMs);
  const mm = String(Math.floor(remain / 60000)).padStart(2, '0');
  const ss = String(Math.floor((remain % 60000) / 1000)).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function kitDisplayLabel(kit: 'local' | 'visitante'): string {
  return kit === 'local' ? 'Local' : 'Visitante';
}
