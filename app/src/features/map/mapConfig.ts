import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { BaseStyleOptions } from '../../design-system';

// MapLibre 6 resuelve su worker junto al módulo; con un bundler eso apunta a
// un archivo que no existe. Vite lo emite como asset y acá se le pasa la URL.
// El query es cache-busting: una versión anterior se sirvió con MIME
// incorrecto y quedó cacheada como immutable en algunos navegadores.
setWorkerUrl(`${workerUrl}?v=2`);

/** Configuración única del mapa: cambiar de proveedor de teselas es tocar sólo esto. */
export const MAP_CENTER_LATLNG = { lat: -32.9468, lng: -60.6393 } as const;

/** MapLibre usa [lng, lat]. Rosario, centro. */
export const MAP_CENTER: [number, number] = [MAP_CENTER_LATLNG.lng, MAP_CENTER_LATLNG.lat];

export const MAP_ZOOM = 15.5;
export const MAP_FOCUS_ZOOM = 17;

/** Deja libre la franja que ocupa la hoja inferior: el marcador propio queda a la vista. */
export const MAP_BOTTOM_PADDING = 300;

export const MAP_STYLE_OPTIONS: Omit<BaseStyleOptions, 'theme'> = {
  tileJsonUrl: 'https://tiles.openfreemap.org/planet',
  glyphsUrl: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  fontRegular: ['Noto Sans Regular'],
  fontMedium: ['Noto Sans Bold'],
};
