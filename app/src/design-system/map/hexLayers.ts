import type { ExpressionSpecification, LayerSpecification } from 'maplibre-gl';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { cellToBoundary, polygonToCells } from 'h3-js';
import { game, hexOpacity, hexStroke, legendary, map as mapTokens, players, ui, type PlayerColor, type ThemeName } from '../theme/tokens';

/** Resolución H3 de Hexario: ~15.000 m², una manzana y media de Rosario. */
export const HEX_RESOLUTION = 10;

export const SOURCE_HEXES = 'hx-hexes';
export const SOURCE_GRID = 'hx-grid';

export type HexStatus = 'owned' | 'protected' | 'stealable';

export type HexCell = {
  h3: string;
  /** Color del dueño desde el punto de vista del jugador. 'me' = vos. null = libre. */
  owner: PlayerColor | null;
  status?: HexStatus;
  legendary?: boolean;
  selected?: boolean;
  /** Texto de la cuenta regresiva ("05:42:10"), visible desde zoom 17 en protegidos. */
  countdown?: string;
};

type HexProps = {
  h3: string;
  owner: PlayerColor | 'none';
  status: HexStatus | 'free';
  legendary: boolean;
  selected: boolean;
  countdown: string;
};

function ring(h3: string): number[][] {
  const coords = cellToBoundary(h3, true); // [lng, lat]
  return [...coords, coords[0]];
}

export function hexesToGeoJSON(cells: HexCell[]): FeatureCollection<Polygon, HexProps> {
  return {
    type: 'FeatureCollection',
    features: cells.map(
      (c): Feature<Polygon, HexProps> => ({
        type: 'Feature',
        id: c.h3,
        geometry: { type: 'Polygon', coordinates: [ring(c.h3)] },
        properties: {
          h3: c.h3,
          owner: c.owner ?? 'none',
          status: c.owner ? c.status ?? 'owned' : 'free',
          legendary: !!c.legendary,
          selected: !!c.selected,
          countdown: c.countdown ?? '',
        },
      }),
    ),
  };
}

/**
 * Grilla tenue de hexágonos libres para el área visible.
 * Llamala en 'moveend' con map.getBounds() cuando el zoom sea ≥ 15.
 */
export function gridToGeoJSON(
  bounds: [west: number, south: number, east: number, north: number],
  resolution = HEX_RESOLUTION,
  maxCells = 4000,
): FeatureCollection<Polygon, { h3: string }> {
  const [w, s, e, n] = bounds;
  const cells = polygonToCells([[[w, s], [e, s], [e, n], [w, n], [w, s]]], resolution, true);
  if (cells.length > maxCells) return { type: 'FeatureCollection', features: [] };
  return {
    type: 'FeatureCollection',
    features: cells.map((h3) => ({
      type: 'Feature',
      // El h3 viaja en las libres para poder abrir su tarjeta con un toque.
      properties: { h3 },
      geometry: { type: 'Polygon', coordinates: [ring(h3)] },
    })),
  };
}

function ownerMatch(theme: ThemeName, key: 'fill' | 'line'): ExpressionSpecification {
  const p = players[theme];
  return [
    'match',
    ['get', 'owner'],
    'me', p.me[key],
    'sky', p.sky[key],
    'coral', p.coral[key],
    'violet', p.violet[key],
    'neutral', p.neutral[key],
    'transparent',
  ];
}

/**
 * Capas de hexágonos, en orden de abajo hacia arriba. Agregalas encima del
 * mapa base (y debajo de las etiquetas de calles si querés que se lean).
 */
export function createHexLayers(theme: ThemeName, fontstack: string[] = ['Noto Sans Bold']): LayerSpecification[] {
  const op = hexOpacity[theme];
  const isUnownedLegendary: ExpressionSpecification = ['all', ['get', 'legendary'], ['==', ['get', 'owner'], 'none']];
  const isStealable: ExpressionSpecification = ['==', ['get', 'status'], 'stealable'];

  const baseOpacity: ExpressionSpecification = [
    'case',
    isUnownedLegendary, op.legendary,
    ['==', ['get', 'owner'], 'me'], op.me,
    ['==', ['get', 'owner'], 'violet'], op.violet,
    ['==', ['get', 'owner'], 'none'], 0,
    op.rival,
  ];

  return [
    // Grilla de libres: aparece desde zoom de barrio.
    {
      id: 'hx-grid',
      type: 'line',
      source: SOURCE_GRID,
      minzoom: game.zoomNeighborhood,
      paint: { 'line-color': mapTokens[theme].grid, 'line-width': 1 },
    },

    // Relleno. Desde zoom 15 los robables pasan a la capa rayada.
    {
      id: 'hx-fill',
      type: 'fill',
      source: SOURCE_HEXES,
      paint: {
        'fill-color': ['case', isUnownedLegendary, legendary.fill, ownerMatch(theme, 'fill')],
        'fill-opacity': ['step', ['zoom'], baseOpacity, game.zoomNeighborhood, ['case', isStealable, 0, baseOpacity]],
        'fill-antialias': false,
      },
    },

    // Robable: rayado diagonal en el color del dueño.
    {
      id: 'hx-hatch',
      type: 'fill',
      source: SOURCE_HEXES,
      minzoom: game.zoomNeighborhood,
      filter: isStealable,
      paint: { 'fill-pattern': ['concat', 'hx-hatch-', ['get', 'owner']] },
    },

    // Bordes (solo desde zoom de barrio; a zoom ciudad, solo manchas).
    {
      id: 'hx-line',
      type: 'line',
      source: SOURCE_HEXES,
      minzoom: game.zoomNeighborhood,
      filter: ['all', ['!', ['get', 'legendary']], ['!', isStealable], ['!=', ['get', 'owner'], 'none']],
      layout: { 'line-join': 'round' },
      paint: {
        'line-color': ownerMatch(theme, 'line'),
        'line-width': ['case', ['==', ['get', 'owner'], 'me'], hexStroke.me, hexStroke.rival],
      },
    },
    {
      id: 'hx-line-stealable',
      type: 'line',
      source: SOURCE_HEXES,
      minzoom: game.zoomNeighborhood,
      filter: ['all', ['!', ['get', 'legendary']], isStealable],
      paint: {
        'line-color': theme === 'dark' ? ownerMatch(theme, 'fill') : ownerMatch(theme, 'line'),
        'line-width': hexStroke.me,
        'line-dasharray': [3, 2],
      },
    },

    // Legendario: borde dorado punteado (con o sin dueño).
    {
      id: 'hx-line-legendary',
      type: 'line',
      source: SOURCE_HEXES,
      filter: ['get', 'legendary'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': legendary.line, 'line-width': hexStroke.legendary, 'line-dasharray': [0.1, 2.2] },
    },
    {
      id: 'hx-star',
      type: 'symbol',
      source: SOURCE_HEXES,
      filter: ['get', 'legendary'],
      layout: { 'icon-image': 'hx-star', 'icon-allow-overlap': true, 'icon-ignore-placement': true },
    },

    // Seleccionado: halo + borde de tinta.
    {
      id: 'hx-selected-halo',
      type: 'line',
      source: SOURCE_HEXES,
      filter: ['get', 'selected'],
      layout: { 'line-join': 'round' },
      paint: { 'line-color': ui[theme].panel, 'line-width': hexStroke.selectedHalo },
    },
    {
      id: 'hx-selected',
      type: 'line',
      source: SOURCE_HEXES,
      filter: ['get', 'selected'],
      layout: { 'line-join': 'round' },
      paint: { 'line-color': ui[theme].ink, 'line-width': hexStroke.selected },
    },

    // Cuenta regresiva sobre protegidos (zoom de cuadra).
    {
      id: 'hx-countdown',
      type: 'symbol',
      source: SOURCE_HEXES,
      minzoom: game.zoomBlock,
      filter: ['all', ['==', ['get', 'status'], 'protected'], ['!=', ['get', 'countdown'], '']],
      layout: {
        'text-field': ['get', 'countdown'],
        'text-font': fontstack,
        'text-size': 12,
        'icon-image': 'hx-pill',
        'icon-text-fit': 'both',
        'icon-allow-overlap': true,
        'text-allow-overlap': true,
      },
      paint: { 'text-color': ui[theme].onAction },
    },
  ];
}
