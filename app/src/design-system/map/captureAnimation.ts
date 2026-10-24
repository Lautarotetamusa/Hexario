import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { FeatureCollection, Polygon } from 'geojson';
import { cellToBoundary, cellToLatLng } from 'h3-js';
import { hexOpacity, motion, players, type ThemeName } from '../theme/tokens';

export const SOURCE_CAPTURE = 'hx-capture';

const EMPTY: FeatureCollection<Polygon> = { type: 'FeatureCollection', features: [] };

function scaledRing(h3: string, k: number): number[][] {
  const [clat, clng] = cellToLatLng(h3);
  const pts = cellToBoundary(h3, true).map(([lng, lat]) => [clng + (lng - clng) * k, clat + (lat - clat) * k]);
  return [...pts, pts[0]];
}

function easeOut(t: number) {
  // Aproxima cubic-bezier(.2,.7,.2,1)
  return 1 - Math.pow(1 - t, 3);
}

/** Agrega la fuente y las capas de la animación. Se llama una vez por estilo (lo hace setupHexarioMap). */
export function addCaptureLayers(map: MapLibreMap, theme: ThemeName) {
  if (!map.getSource(SOURCE_CAPTURE)) map.addSource(SOURCE_CAPTURE, { type: 'geojson', data: EMPTY });
  const { fill, line } = players[theme].me;
  if (!map.getLayer('hx-capture-ring')) {
    map.addLayer({
      id: 'hx-capture-ring',
      type: 'line',
      source: SOURCE_CAPTURE,
      filter: ['==', ['get', 'kind'], 'ring'],
      paint: { 'line-color': line, 'line-width': 2, 'line-opacity': ['get', 'opacity'] },
    });
  }
  if (!map.getLayer('hx-capture-fill')) {
    map.addLayer({
      id: 'hx-capture-fill',
      type: 'fill',
      source: SOURCE_CAPTURE,
      filter: ['==', ['get', 'kind'], 'fill'],
      paint: { 'fill-color': fill, 'fill-opacity': ['get', 'opacity'] },
    });
  }
}

/**
 * "Recién capturado": el hexágono pasa de 85% a 42% en 900 ms con un anillo
 * que se expande y desaparece. Llamalo justo después de marcar el hexágono
 * como tuyo en la fuente principal.
 */
export function animateCapture(map: MapLibreMap, h3: string, theme: ThemeName): Promise<void> {
  const src = map.getSource(SOURCE_CAPTURE) as GeoJSONSource | undefined;
  if (!src) return Promise.resolve();
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return Promise.resolve();

  const from = hexOpacity[theme].captureStart;
  const to = hexOpacity[theme].me;
  const duration = motion.capture.duration;
  const t0 = performance.now();

  return new Promise((resolve) => {
    function frame(now: number) {
      const t = Math.min(1, (now - t0) / duration);
      const e = easeOut(t);
      // Fill: el excedente sobre el 42% de la capa base, para no sumar opacidad dos veces.
      const extra = Math.max(0, (from - to) * (1 - e));
      src!.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { kind: 'fill', opacity: extra },
            geometry: { type: 'Polygon', coordinates: [scaledRing(h3, 0.86 + 0.14 * Math.min(1, e * 1.2))] },
          },
          {
            type: 'Feature',
            properties: { kind: 'ring', opacity: 0.7 * (1 - e) },
            geometry: { type: 'Polygon', coordinates: [scaledRing(h3, 1 + 0.45 * e)] },
          },
        ],
      });
      if (t < 1) requestAnimationFrame(frame);
      else {
        src!.setData(EMPTY);
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}
