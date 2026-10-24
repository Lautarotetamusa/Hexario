import type { StyleSpecification, ExpressionSpecification } from 'maplibre-gl';
import { map as mapTokens, type ThemeName } from '../theme/tokens';

/**
 * Mapa base de Hexario para MapLibre GL, sobre teselas vectoriales con el
 * esquema OpenMapTiles (MapTiler, Stadia, OpenFreeMap o tu propio servidor).
 *
 * Gris silencioso: calles blancas, manzanas gris suave, agua y parques apenas
 * teñidos. Sin POIs ni íconos de negocios: el color lo pone el juego.
 */
export type BaseStyleOptions = {
  theme: ThemeName;
  /** URL TileJSON de una fuente OpenMapTiles. Ej.: https://api.maptiler.com/tiles/v3/tiles.json?key=TU_KEY */
  tileJsonUrl: string;
  /** Glifos para etiquetas. Ej.: https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=TU_KEY */
  glyphsUrl: string;
  /** Fuentes disponibles en ese servidor de glifos (Geist no viene en los servidores comunes). */
  fontRegular?: string[];
  fontMedium?: string[];
};

const ROAD_MAJOR = ['motorway', 'trunk', 'primary', 'secondary'];
const ROAD_MINOR = ['tertiary', 'minor', 'service', 'street', 'residential', 'unclassified', 'living_street'];

function roadWidth(base: number): ExpressionSpecification {
  // Ancho en px según zoom (crece exponencialmente al acercar).
  return ['interpolate', ['exponential', 1.6], ['zoom'], 12, base * 0.4, 15, base, 18, base * 4.5];
}

export function createBaseStyle({
  theme,
  tileJsonUrl,
  glyphsUrl,
  fontRegular = ['Noto Sans Regular'],
  fontMedium = ['Noto Sans Bold'],
}: BaseStyleOptions): StyleSpecification {
  const c = mapTokens[theme];

  return {
    version: 8,
    name: `Hexario ${theme === 'light' ? 'claro' : 'oscuro'}`,
    glyphs: glyphsUrl,
    sources: {
      omt: { type: 'vector', url: tileJsonUrl },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': c.ground } },

      {
        id: 'park',
        type: 'fill',
        source: 'omt',
        'source-layer': 'park',
        paint: { 'fill-color': c.park },
      },
      {
        id: 'landcover-green',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landcover',
        filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood']]],
        paint: { 'fill-color': c.park, 'fill-opacity': 0.8 },
      },
      {
        id: 'landuse-green',
        type: 'fill',
        source: 'omt',
        'source-layer': 'landuse',
        filter: ['in', ['get', 'class'], ['literal', ['park', 'cemetery', 'pitch', 'garden']]],
        paint: { 'fill-color': c.park },
      },

      {
        id: 'water',
        type: 'fill',
        source: 'omt',
        'source-layer': 'water',
        paint: { 'fill-color': c.water },
      },
      {
        id: 'waterway',
        type: 'line',
        source: 'omt',
        'source-layer': 'waterway',
        paint: { 'line-color': c.water, 'line-width': ['interpolate', ['linear'], ['zoom'], 10, 0.5, 16, 3] },
      },

      {
        id: 'road-path',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 15,
        filter: ['in', ['get', 'class'], ['literal', ['path', 'pedestrian']]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': c.street, 'line-width': roadWidth(1.2), 'line-opacity': 0.8 },
      },
      {
        id: 'road-minor',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        minzoom: 12,
        filter: ['in', ['get', 'class'], ['literal', ROAD_MINOR]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': c.street, 'line-width': roadWidth(2.5) },
      },
      {
        id: 'road-major',
        type: 'line',
        source: 'omt',
        'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ROAD_MAJOR]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': c.streetMajor, 'line-width': roadWidth(5) },
      },

      {
        id: 'label-water',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'water_name',
        layout: {
          'text-field': ['coalesce', ['get', 'name:es'], ['get', 'name']],
          'text-font': fontMedium,
          'text-size': 11,
          'text-letter-spacing': 0.15,
          'text-transform': 'uppercase',
        },
        paint: { 'text-color': c.labelWater, 'text-halo-color': c.water, 'text-halo-width': 1 },
      },
      {
        id: 'label-street',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'transportation_name',
        minzoom: 15,
        layout: {
          'symbol-placement': 'line',
          'text-field': ['coalesce', ['get', 'name:es'], ['get', 'name']],
          'text-font': fontRegular,
          'text-size': ['interpolate', ['linear'], ['zoom'], 15, 10, 18, 12],
          'text-max-angle': 30,
        },
        paint: { 'text-color': c.label, 'text-halo-color': c.halo, 'text-halo-width': 1.5 },
      },
      {
        id: 'label-neighbourhood',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        minzoom: 12,
        maxzoom: 16,
        filter: ['in', ['get', 'class'], ['literal', ['suburb', 'neighbourhood', 'quarter']]],
        layout: {
          'text-field': ['coalesce', ['get', 'name:es'], ['get', 'name']],
          'text-font': fontMedium,
          'text-size': 11,
          'text-letter-spacing': 0.12,
          'text-transform': 'uppercase',
          'text-max-width': 8,
        },
        paint: { 'text-color': c.label, 'text-halo-color': c.halo, 'text-halo-width': 1.5 },
      },
      {
        id: 'label-city',
        type: 'symbol',
        source: 'omt',
        'source-layer': 'place',
        maxzoom: 12,
        filter: ['in', ['get', 'class'], ['literal', ['city', 'town']]],
        layout: {
          'text-field': ['coalesce', ['get', 'name:es'], ['get', 'name']],
          'text-font': fontMedium,
          'text-size': 13,
        },
        paint: { 'text-color': c.label, 'text-halo-color': c.halo, 'text-halo-width': 1.5 },
      },
    ],
  };
}
