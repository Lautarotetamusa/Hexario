import type { LayerSpecification } from 'maplibre-gl';
import type { FeatureCollection, LineString, Point } from 'geojson';
import { players, ui, type ThemeName } from '../theme/tokens';

export const SOURCE_TRAIL = 'hx-trail';

/** Rastro de la caminata: [lng, lat][] en orden. */
export function trailToGeoJSON(coords: [number, number][]): FeatureCollection<LineString | Point, { kind: string }> {
  const features: FeatureCollection<LineString | Point, { kind: string }>['features'] = [];
  if (coords.length >= 2) {
    features.push({ type: 'Feature', properties: { kind: 'line' }, geometry: { type: 'LineString', coordinates: coords } });
  }
  if (coords.length >= 1) {
    features.push({ type: 'Feature', properties: { kind: 'start' }, geometry: { type: 'Point', coordinates: coords[0] } });
  }
  return { type: 'FeatureCollection', features };
}

/** Verde 5 px sobre casing de 9 px. Inicio: punto hueco. La posición actual va con createLocationMarker(). */
export function createTrailLayers(theme: ThemeName): LayerSpecification[] {
  const green = players[theme].me.line;
  const casing = theme === 'light' ? '#FFFFFF' : ui.dark.panel;
  return [
    {
      id: 'hx-trail-casing',
      type: 'line',
      source: SOURCE_TRAIL,
      filter: ['==', ['get', 'kind'], 'line'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': casing, 'line-width': 9 },
    },
    {
      id: 'hx-trail',
      type: 'line',
      source: SOURCE_TRAIL,
      filter: ['==', ['get', 'kind'], 'line'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': green, 'line-width': 5 },
    },
    {
      id: 'hx-trail-start',
      type: 'circle',
      source: SOURCE_TRAIL,
      filter: ['==', ['get', 'kind'], 'start'],
      paint: {
        'circle-radius': 4.5,
        'circle-color': casing,
        'circle-stroke-color': green,
        'circle-stroke-width': 3,
      },
    },
  ];
}
