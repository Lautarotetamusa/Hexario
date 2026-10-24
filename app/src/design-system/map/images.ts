import type { Map as MapLibreMap } from 'maplibre-gl';
import { legendary, players, ui, type PlayerColor, type ThemeName } from '../theme/tokens';

/**
 * Imágenes que usan las capas de hexágonos, dibujadas en canvas:
 * - hx-hatch-{owner}: rayado diagonal de los robables (señal que no depende del color)
 * - hx-star: estrella de los legendarios
 * - hx-pill: píldora estirable para la cuenta regresiva de los protegidos
 */

const PR = 2; // pixelRatio

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible');
  return { c, ctx };
}

function put(map: MapLibreMap, id: string, ctx: CanvasRenderingContext2D, w: number, h: number, extra: Record<string, unknown> = {}) {
  const data = ctx.getImageData(0, 0, w, h);
  if (map.hasImage(id)) map.removeImage(id);
  map.addImage(id, { width: w, height: h, data: new Uint8Array(data.data.buffer) }, { pixelRatio: PR, ...extra });
}

function hatch(fill: string, line: string, theme: ThemeName) {
  const N = 6 * PR; // tile de 6 px
  const { ctx } = canvas(N, N);
  ctx.fillStyle = hexToRgba(fill, theme === 'light' ? 0.2 : 0.16);
  ctx.fillRect(0, 0, N, N);
  ctx.strokeStyle = hexToRgba(theme === 'light' ? line : fill, 0.6);
  ctx.lineWidth = 2.2 * PR * 0.7;
  ctx.lineCap = 'square';
  ctx.beginPath();
  // Diagonales "/" sin cortes entre tiles.
  ctx.moveTo(0, N); ctx.lineTo(N, 0);
  ctx.moveTo(-N / 2, N / 2); ctx.lineTo(N / 2, -N / 2);
  ctx.moveTo(N / 2, N * 1.5); ctx.lineTo(N * 1.5, N / 2);
  ctx.stroke();
  return { ctx, N };
}

function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, rOuter: number, rInner: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function registerHexImages(map: MapLibreMap, theme: ThemeName) {
  const owners: PlayerColor[] = ['me', 'sky', 'coral', 'violet', 'neutral'];
  for (const o of owners) {
    const { fill, line } = players[theme][o];
    const { ctx, N } = hatch(fill, line, theme);
    put(map, `hx-hatch-${o}`, ctx, N, N);
  }

  // Estrella 14 px
  {
    const S = 14 * PR;
    const { ctx } = canvas(S, S);
    ctx.fillStyle = legendary.star[theme];
    starPath(ctx, S / 2, S / 2 + 0.5 * PR, S / 2, S / 4.6);
    ctx.fill();
    put(map, 'hx-star', ctx, S, S);
  }

  // Píldora estirable 40×24 (radio 12) para icon-text-fit
  {
    const W = 40 * PR;
    const H = 24 * PR;
    const R = H / 2;
    const { ctx } = canvas(W, H);
    ctx.fillStyle = ui[theme].action;
    ctx.beginPath();
    ctx.moveTo(R, 0);
    ctx.lineTo(W - R, 0);
    ctx.arc(W - R, R, R, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(R, H);
    ctx.arc(R, R, R, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.closePath();
    ctx.fill();
    put(map, 'hx-pill', ctx, W, H, {
      stretchX: [[R, W - R]],
      stretchY: [[R - 1, R + 1]],
      content: [R * 0.75, 4, W - R * 0.75, H - 4],
    });
  }
}
