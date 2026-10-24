import { gridDisk, latLngToCell } from 'h3-js';
import {
  HEX_RESOLUTION,
  type HexCardState,
  type HexCell,
  type HexStatus,
  type PlayerColor,
} from '../../design-system';
import { MAP_CENTER_LATLNG } from './mapConfig';

/**
 * Datos de muestra del mapa. Aislados a propósito: cuando la API entregue el
 * territorio real, se reemplazan por la respuesta sin tocar la pantalla.
 */

export type MockHex = {
  h3: string;
  owner: PlayerColor | null;
  status?: HexStatus;
  legendary?: boolean;
  /** Barrio o hito, sin la distancia. */
  place: string;
  /** 0 = el lugar no tiene una distancia útil para mostrar. */
  distanceM: number;
  rentPerHour: number;
  protectionLeftMs?: number;
  /** Texto de la cuenta regresiva que dibuja el mapa en zoom de cuadra. */
  countdown?: string;
  ownerName?: string;
  ownerColor?: PlayerColor;
};

const PROTECTION_LEFT_MS = 20_530_000;

function cluster(lat: number, lng: number): string[] {
  return gridDisk(latLngToCell(lat, lng, HEX_RESOLUTION), 1);
}

const OWN_CLUSTER = cluster(MAP_CENTER_LATLNG.lat, MAP_CENTER_LATLNG.lng);
const CORAL_CLUSTER = cluster(-32.9415, -60.6455);
const SKY_CLUSTER = cluster(-32.9502, -60.6346);
const LEGENDARY_CELL = latLngToCell(-32.9476, -60.6304, HEX_RESOLUTION);
const FREE_CELL = latLngToCell(-32.9442, -60.6337, HEX_RESOLUTION);

export const MOCK_HEXES: MockHex[] = [
  ...OWN_CLUSTER.map(
    (h3, index): MockHex => ({
      h3,
      owner: 'me',
      status: 'owned',
      place: 'Centro',
      distanceM: 40 + index * 25,
      rentPerHour: 1,
      protectionLeftMs: PROTECTION_LEFT_MS,
      countdown: '05:42:10',
      ownerName: 'Vos',
      ownerColor: 'me',
    }),
  ),
  ...CORAL_CLUSTER.map(
    (h3, index): MockHex => ({
      h3,
      owner: 'coral',
      status: index === 0 ? 'protected' : 'owned',
      place: 'Pichincha',
      distanceM: 320 + index * 30,
      rentPerHour: 1,
      protectionLeftMs: index === 0 ? PROTECTION_LEFT_MS : undefined,
      countdown: index === 0 ? '05:42:10' : undefined,
      ownerName: 'Juli',
      ownerColor: 'coral',
    }),
  ),
  ...SKY_CLUSTER.map(
    (h3, index): MockHex => ({
      h3,
      owner: 'sky',
      status: index === 2 ? 'stealable' : 'owned',
      place: 'Barrio Martín',
      distanceM: 480 + index * 30,
      rentPerHour: 1,
      ownerName: 'Nico',
      ownerColor: 'sky',
    }),
  ),
  {
    h3: LEGENDARY_CELL,
    owner: null,
    legendary: true,
    place: 'Parque Independencia · hito',
    distanceM: 850,
    rentPerHour: 1,
  },
  {
    h3: FREE_CELL,
    owner: null,
    place: 'Centro',
    distanceM: 160,
    rentPerHour: 1,
  },
];

/** Capa que consume el mapa: sólo lo que dibuja, sin los textos de la tarjeta. */
export const MOCK_HEX_CELLS: HexCell[] = MOCK_HEXES.map((hex) => ({
  h3: hex.h3,
  owner: hex.owner,
  status: hex.status,
  legendary: hex.legendary,
  countdown: hex.countdown,
}));

export const MOCK_SUMMARY = {
  points: 1284,
  pointsPerHour: 14,
  hexagons: 14,
  protectedCount: 11,
  stealableCount: 3,
} as const;

export const MOCK_THEFT = {
  thiefName: 'Juli',
  thiefColor: 'coral' as PlayerColor,
  place: 'Pichincha',
  when: 'Hace 2 min',
  lostRentPerHour: 1,
  h3: CORAL_CLUSTER[0],
} as const;

const FALLBACK_HEX: Omit<MockHex, 'h3'> = {
  owner: null,
  place: 'Rosario',
  distanceM: 0,
  rentPerHour: 1,
};

export function findMockHex(h3: string): MockHex | undefined {
  return MOCK_HEXES.find((hex) => hex.h3 === h3);
}

/** Cualquier hexágono de la grilla que no esté en el mock se muestra libre. */
export function describeHex(h3: string): MockHex {
  return findMockHex(h3) ?? { h3, ...FALLBACK_HEX };
}

export function hexCardState(hex: MockHex): HexCardState {
  if (!hex.owner) return 'free';
  if (hex.owner === 'me') return 'mine';
  if (hex.status === 'stealable') return 'stealable';
  return 'protected';
}

export function hexPlaceLabel(hex: MockHex): string {
  return hex.distanceM > 0 ? `${hex.place} · a ${hex.distanceM} m` : hex.place;
}
