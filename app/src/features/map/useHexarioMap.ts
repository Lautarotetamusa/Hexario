import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { cellToLatLng } from 'h3-js';
import {
  createBaseStyle,
  createLocationMarker,
  createPin,
  setupHexarioMap,
  type HexCell,
  type HexarioMapController,
  type ThemeName,
} from '../../design-system';
import type { Business } from '../../api/businesses';
import {
  MAP_BOTTOM_PADDING,
  MAP_CENTER,
  MAP_FOCUS_ZOOM,
  MAP_STYLE_OPTIONS,
  MAP_ZOOM,
} from './mapConfig';

export type MapBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

type Location = {
  latitude: number;
  longitude: number;
};

type UseHexarioMapOptions = {
  container: RefObject<HTMLDivElement | null>;
  theme: ThemeName;
  cells: HexCell[];
  businesses: Business[];
  selectedBusinessId: number | null;
  location: Location | null;
  onSelectHex: (h3: string | null) => void;
  onSelectBusiness: (id: number) => void;
  onBoundsChange: (bounds: MapBounds) => void;
};

type MapControls = {
  centerOnLocation: () => void;
  focusHex: (h3: string) => void;
};

/**
 * Crea el mapa una sola vez y mantiene sincronizados el tema, los hexágonos,
 * la ubicación y el viewport. La pantalla no conoce MapLibre: sólo pide
 * centrar o enfocar.
 */
export function useHexarioMap({
  container,
  theme,
  cells,
  businesses,
  selectedBusinessId,
  location,
  onSelectHex,
  onSelectBusiness,
  onBoundsChange,
}: UseHexarioMapOptions): MapControls {
  const mapRef = useRef<MapLibreMap | null>(null);
  const controllerRef = useRef<HexarioMapController | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const businessMarkersRef = useRef<Marker[]>([]);
  const themeRef = useRef(theme);
  const selectRef = useRef(onSelectHex);
  const selectBusinessRef = useRef(onSelectBusiness);
  const boundsRef = useRef(onBoundsChange);
  const locationRef = useRef(location);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    selectRef.current = onSelectHex;
  }, [onSelectHex]);

  useEffect(() => {
    selectBusinessRef.current = onSelectBusiness;
  }, [onSelectBusiness]);

  useEffect(() => {
    boundsRef.current = onBoundsChange;
  }, [onBoundsChange]);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

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
    const marker = new Marker({ element: createLocationMarker() }).setLngLat(MAP_CENTER);

    const handleClick = (event: { point: { x: number; y: number } }) => {
      selectRef.current(controller.hexAt(event.point));
    };
    const notifyBounds = () => {
      const bounds = map.getBounds();
      boundsRef.current({
        south: bounds.getSouth(),
        west: bounds.getWest(),
        north: bounds.getNorth(),
        east: bounds.getEast(),
      });
    };

    mapRef.current = map;
    controllerRef.current = controller;
    markerRef.current = marker;
    map.on('click', handleClick);
    map.on('moveend', notifyBounds);
    map.once('load', notifyBounds);

    return () => {
      map.off('click', handleClick);
      map.off('moveend', notifyBounds);
      marker.remove();
      controller.destroy();
      map.remove();
      mapRef.current = null;
      controllerRef.current = null;
      markerRef.current = null;
    };
  }, [container]);

  useEffect(() => {
    controllerRef.current?.setHexes(cells);
  }, [cells]);

  // Los comercios son marcadores DOM (createPin del design system), no una
  // capa de MapLibre: el pin ya trae el ícono, el estado seleccionado y el
  // área táctil de 44 px.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    businessMarkersRef.current.forEach((marker) => marker.remove());
    businessMarkersRef.current = businesses.map((business) => {
      const marker = new Marker({
        element: createPin({
          kind: 'commerce',
          name: business.name,
          selected: business.id === selectedBusinessId,
          onClick: () => selectBusinessRef.current(business.id),
        }),
        anchor: 'center',
      })
        .setLngLat([business.longitude, business.latitude])
        .addTo(map);
      return marker;
    });

    return () => {
      businessMarkersRef.current.forEach((marker) => marker.remove());
      businessMarkersRef.current = [];
    };
  }, [businesses, selectedBusinessId]);

  useEffect(() => {
    controllerRef.current?.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    const marker = markerRef.current;
    const map = mapRef.current;
    if (!marker || !map) return;

    if (!location) {
      if (marker.getElement().isConnected) marker.remove();
      return;
    }

    marker.setLngLat([location.longitude, location.latitude]);
    if (!marker.getElement().isConnected) marker.addTo(map);
  }, [location]);

  const centerOnLocation = useCallback(() => {
    const current = locationRef.current;
    if (!current) return;
    mapRef.current?.easeTo({ center: [current.longitude, current.latitude], zoom: 16 });
  }, []);

  const focusHex = useCallback((h3: string) => {
    const [lat, lng] = cellToLatLng(h3);
    mapRef.current?.easeTo({ center: [lng, lat], zoom: MAP_FOCUS_ZOOM });
  }, []);

  return { centerOnLocation, focusHex };
}
