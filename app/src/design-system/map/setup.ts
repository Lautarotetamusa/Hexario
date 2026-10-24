import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import { latLngToCell } from 'h3-js';
import { game, type ThemeName } from '../theme/tokens';
import { createBaseStyle, type BaseStyleOptions } from './baseStyle';
import { registerHexImages } from './images';
import { createHexLayers, gridToGeoJSON, hexesToGeoJSON, HEX_RESOLUTION, SOURCE_GRID, SOURCE_HEXES, type HexCell } from './hexLayers';
import { createTrailLayers, SOURCE_TRAIL, trailToGeoJSON } from './trail';
import { addCaptureLayers, animateCapture } from './captureAnimation';

const EMPTY: FeatureCollection = { type: 'FeatureCollection', features: [] };

export type HexarioMapController = {
  setHexes(cells: HexCell[]): void;
  setTrail(coords: [number, number][]): void;
  /** Anima un hexágono recién capturado. */
  capture(h3: string): Promise<void>;
  /** Cambia de tema conservando los datos. */
  setTheme(theme: ThemeName): void;
  /** Devuelve el h3 del hexágono tocado (o null) — usalo en map.on('click'). */
  hexAt(point: { x: number; y: number }): string | null;
  destroy(): void;
};

type SetupOptions = Omit<BaseStyleOptions, 'theme'> & { theme: ThemeName };

/**
 * Conecta el sistema de Hexario a un mapa de MapLibre ya creado:
 *
 *   const map = new maplibregl.Map({ container, style: createBaseStyle(opts), center: [-60.639, -32.947], zoom: 15 })
 *   const hx = setupHexarioMap(map, opts)
 *   hx.setHexes(cells)
 */
export function setupHexarioMap(map: MapLibreMap, options: SetupOptions): HexarioMapController {
  let theme = options.theme;
  let hexes: HexCell[] = [];
  let trail: [number, number][] = [];
  const font = options.fontMedium ?? ['Noto Sans Bold'];

  function install() {
    registerHexImages(map, theme);
    if (!map.getSource(SOURCE_GRID)) map.addSource(SOURCE_GRID, { type: 'geojson', data: EMPTY });
    if (!map.getSource(SOURCE_HEXES)) map.addSource(SOURCE_HEXES, { type: 'geojson', data: hexesToGeoJSON(hexes), promoteId: 'h3' });
    if (!map.getSource(SOURCE_TRAIL)) map.addSource(SOURCE_TRAIL, { type: 'geojson', data: trailToGeoJSON(trail) });

    // Hexágonos debajo de las etiquetas de calles, para que se sigan leyendo.
    const beforeId = map.getLayer('label-water') ? 'label-water' : undefined;
    for (const layer of createHexLayers(theme, font)) {
      if (!map.getLayer(layer.id)) map.addLayer(layer, layer.type === 'symbol' ? undefined : beforeId);
    }
    addCaptureLayers(map, theme);
    for (const layer of createTrailLayers(theme)) {
      if (!map.getLayer(layer.id)) map.addLayer(layer);
    }
    refreshGrid();
  }

  function refreshGrid() {
    const src = map.getSource(SOURCE_GRID) as GeoJSONSource | undefined;
    if (!src) return;
    if (map.getZoom() < game.zoomNeighborhood) {
      src.setData(EMPTY);
      return;
    }
    const b = map.getBounds();
    src.setData(gridToGeoJSON([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]));
  }

  if (map.isStyleLoaded()) install();
  else map.once('load', install);
  map.on('moveend', refreshGrid);

  return {
    setHexes(cells) {
      hexes = cells;
      (map.getSource(SOURCE_HEXES) as GeoJSONSource | undefined)?.setData(hexesToGeoJSON(cells));
    },
    setTrail(coords) {
      trail = coords;
      (map.getSource(SOURCE_TRAIL) as GeoJSONSource | undefined)?.setData(trailToGeoJSON(coords));
    },
    capture(h3) {
      return animateCapture(map, h3, theme);
    },
    setTheme(next) {
      if (next === theme) return;
      theme = next;
      map.setStyle(createBaseStyle({ ...options, theme }), { diff: false });
      map.once('style.load', install);
    },
    hexAt(point) {
      // Las ocupadas se consultan primero para que una celda con dueño gane
      // sobre la grilla. Si el toque cayó dentro de una libre (que sólo dibuja
      // su borde), se resuelve la celda a partir de la coordenada.
      const hit = (layer: 'hx-fill' | 'hx-grid') =>
        map.queryRenderedFeatures([point.x, point.y], { layers: [layer] })[0];
      const feature = hit('hx-fill') ?? hit('hx-grid');
      const fromFeature = feature?.properties?.h3 as string | undefined;
      if (fromFeature) return fromFeature;
      if (map.getZoom() < game.zoomNeighborhood) return null;
      const { lat, lng } = map.unproject([point.x, point.y]);
      return latLngToCell(lat, lng, HEX_RESOLUTION);
    },
    destroy() {
      map.off('moveend', refreshGrid);
    },
  };
}
