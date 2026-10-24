/**
 * Ejemplo: pantalla principal del mapa con MapLibre + H3 + componentes.
 * Copialo como punto de partida; reemplazá los datos de prueba por tu API.
 */
import { useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { latLngToCell, gridDisk } from 'h3-js';

import {
  BottomNav,
  BottomSheet,
  Button,
  Chip,
  HeroNumber,
  HexarioMark,
  HexCard,
  IconButton,
  IconLayers,
  IconLocate,
  IconPlay,
  Num,
  StatRow,
  ToastProvider,
  createBaseStyle,
  createLocationMarker,
  formatPoints,
  setupHexarioMap,
  useTheme,
  useToast,
  HEX_RESOLUTION,
  type HexCell,
  type HexarioMapController,
  type NavTab,
  type SheetSnap,
} from '..';

const ROSARIO_CENTRO: [number, number] = [-60.6393, -32.9468];

const MAP_OPTS = {
  tileJsonUrl: `https://api.maptiler.com/tiles/v3/tiles.json?key=${import.meta.env.VITE_MAPTILER_KEY}`,
  glyphsUrl: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${import.meta.env.VITE_MAPTILER_KEY}`,
};

/** Datos de prueba: tu territorio alrededor del centro y un par de rivales. */
function demoCells(): HexCell[] {
  const me = latLngToCell(ROSARIO_CENTRO[1], ROSARIO_CENTRO[0], HEX_RESOLUTION);
  const mine = gridDisk(me, 1);
  const juli = gridDisk(latLngToCell(-32.9415, -60.6455, HEX_RESOLUTION), 1);
  const monumento = latLngToCell(-32.9476, -60.6304, HEX_RESOLUTION);
  return [
    ...mine.map((h3, i): HexCell => ({ h3, owner: 'me', status: i === 3 ? 'stealable' : 'owned' })),
    ...juli.map((h3, i): HexCell => ({ h3, owner: 'coral', status: i === 0 ? 'protected' : 'owned', countdown: i === 0 ? '05:42:10' : undefined })),
    { h3: monumento, owner: null, legendary: true },
  ];
}

function MapScreen() {
  const { theme } = useTheme();
  const toast = useToast();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const hxRef = useRef<HexarioMapController | null>(null);
  const [snap, setSnap] = useState<SheetSnap>('mid');
  const [tab, setTab] = useState<NavTab>('map');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!container.current) return;
    const map = new MapLibreMap({
      container: container.current,
      style: createBaseStyle({ ...MAP_OPTS, theme }),
      center: ROSARIO_CENTRO,
      zoom: 15.5,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    const hx = setupHexarioMap(map, { ...MAP_OPTS, theme });
    hxRef.current = hx;
    map.once('load', () => hx.setHexes(demoCells()));
    new Marker({ element: createLocationMarker() }).setLngLat(ROSARIO_CENTRO).addTo(map);
    map.on('click', (e) => setSelected(hx.hexAt(e.point)));
    return () => {
      hx.destroy();
      map.remove();
    };
    // El tema se cambia con setTheme, no recreando el mapa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    hxRef.current?.setTheme(theme);
  }, [theme]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--hx-map-ground)' }}>
      <div ref={container} style={{ position: 'absolute', inset: 0 }} />

      <div style={{ position: 'absolute', top: 'max(env(safe-area-inset-top), 12px)', left: 20, right: 20, marginTop: 44, display: 'flex', justifyContent: 'space-between' }}>
        <div className="hx-float-pill">
          <HexarioMark size={22} />
          <span style={{ fontWeight: 600 }}>Centro</span>
          <span className="hx-caption">· Rosario</span>
        </div>
        <IconButton aria-label="Capas del mapa" style={{ width: 44, height: 44 }}>
          <IconLayers size={20} />
        </IconButton>
      </div>

      <BottomSheet label="Resumen de tus puntos" snap={snap} onSnapChange={setSnap} heights={{ min: 96, mid: 270, full: 520 }} footer={<BottomNav active={tab} onSelect={setTab} />}>
        {selected ? (
          <HexCard
            state="free"
            place="Centro · a 80 m"
            rentPerHour={5}
            float={false}
            className="hx-card--flat"
            onAction={() => toast('Pasá por ahí para reclamarlo')}
          />
        ) : (
          <>
            <div className="hx-sheet__row">
              <HeroNumber label="Tus puntos" value={formatPoints(1284)} unit="pts" />
              <Chip tone="ok" style={{ marginBottom: 4 }}>
                <Num>+21</Num> por hora
              </Chip>
            </div>
            <StatRow
              stats={[
                { label: 'Hexágonos', value: 14 },
                { label: 'Protegidos', value: 11 },
                { label: 'Robables', value: 3, tone: 'alert' },
              ]}
            />
            <Button icon={<IconPlay size={20} strokeWidth={2} />}>Empezar caminata</Button>
          </>
        )}
      </BottomSheet>

      <IconButton
        aria-label="Centrar en mi ubicación"
        style={{ position: 'absolute', right: 20, bottom: 'calc(270px + 64px + 56px)' }}
        onClick={() => mapRef.current?.easeTo({ center: ROSARIO_CENTRO, zoom: 16 })}
      >
        <IconLocate size={22} />
      </IconButton>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MapScreen />
    </ToastProvider>
  );
}
