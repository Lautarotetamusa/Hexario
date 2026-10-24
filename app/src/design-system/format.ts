/** Formatos rioplatenses: punto de miles, coma decimal. */

const intFmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
const kmFmt = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1284 → "1.284" */
export function formatPoints(points: number): string {
  return intFmt.format(Math.round(points));
}

/** 10220 (metros) → "10,22" */
export function formatKm(meters: number): string {
  return kmFmt.format(meters / 1000);
}

/** 7 → "+7" ; -3 → "−3" */
export function formatSigned(n: number): string {
  if (n > 0) return `+${intFmt.format(n)}`;
  if (n < 0) return `−${intFmt.format(Math.abs(n))}`;
  return '0';
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Milisegundos → "02:14:37" (o "14:52" si es menos de una hora). */
export function formatCountdown(ms: number, opts: { alwaysHours?: boolean } = {}): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0 || opts.alwaysHours) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

/** Duración de caminata: "31:12" o "1:05:40". */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** Posición de ranking con dos dígitos: 2 → "02". */
export function formatRank(n: number): string {
  return pad(n);
}
