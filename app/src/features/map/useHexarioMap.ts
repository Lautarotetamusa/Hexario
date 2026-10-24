import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { cellToLatLng } from 'h3-js';
import {
  createBaseStyle,
  createLocationMarker,
  setupHexarioMap,
  type HexCell,
  type HexarioMapController,
  type ThemeName,
} from '../../design-system';
import {
  MAP_BOTTOM_PADDING,
  MAP_CENTER,
  MAP_FOCUS_ZOOM,
  MAP_STYLE_OPTIONS,
  MAP_ZOOM,
} from './mapConfig';

type UseHexarioMapOptions = {
  container: RefObject<HTMLDivElement | null>;
  theme: ThemeName;
  cells: HexCell[];
  onSelectHex: (h3: string | null) => void;
};

type MapControls = {
  centerOnLocation: () => void;
  focusHex: (h3: string) => void;
};

/**
 * Crea el mapa una sola vez y mantiene sincronizados el tema y los hexágonos.
 * La pantalla no conoce MapLibre: sólo pide centrar o enfocar.
 */
export function useHexarioMap({ container, theme, cells, onSelectHex }: UseHexarioMapOptions): MapControls {
  const mapRef = useRef<MapLibreMap | null>(null);
  const controllerRef = useRef<HexarioMapController | null>(null);
  const themeRef = useRef(theme);
  const selectRef = useRef(onSelectHex);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    selectRef.current = onSelectHex;
  }, [onSelectHex]);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    const map = new MapLibreMap({
      container: node,
      style: createBaseStyle({ ...MAP_STYLE_OPTIONS, theme: themeRef.current }),
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      attributionControl: false,
      // El juego es peatonal: rotar y ladear el mapa sólo estorba.
      dragRotate: false,
      pitchWithRotate: false,
    });

    map.setPadding({ bottom: MAP_BOTTOM_PADDING });

    const controller = setupHexarioMap(map, { ...MAP_STYLE_OPTIONS, theme: themeRef.current });
    const marker = new Marker({ element: createLocationMarker() }).setLngLat(MAP_CENTER).addTo(map);

    const handleClick = (event: { point: { x: number; y: number } }) => {
      selectRef.current(controller.hexAt(event.point));
    };

    mapRef.current = map;
    controllerRef.current = controller;
    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
      marker.remove();
      controller.destroy();
      map.remove();
      mapRef.current = null;
      controllerRef.current = null;
    };
  }, [container]);

  useEffect(() => {
    controllerRef.current?.setHexes(cells);
  }, [cells]);

  useEffect(() => {
    controllerRef.current?.setTheme(theme);
  }, [theme]);

  const centerOnLocation = useCallback(() => {
    mapRef.current?.easeTo({ center: MAP_CENTER, zoom: 16 });
  }, []);

  const focusHex = useCallback((h3: string) => {
    const [lat, lng] = cellToLatLng(h3);
    mapRef.current?.easeTo({ center: [lng, lat], zoom: MAP_FOCUS_ZOOM });
  }, []);

  return { centerOnLocation, focusHex };
}
