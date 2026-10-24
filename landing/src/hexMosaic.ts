import { cellToBoundary, cellToLatLng, cellToLocalIj, gridDisk, latLngToCell, localIjToCell } from 'h3-js';
import type { PlayerColor } from '@ds';

export type LngLat = [number, number];
export type LocalIj = { i: number; j: number };

export type TerritorySpec = {
  owner: PlayerColor | null;
  anchor: LocalIj;
  radius: number;
  stealable?: boolean;
  legendary?: boolean;
};

export type MosaicCell = {
  h3: string;
  vertices: [number, number][];
  center: [number, number];
  owner: PlayerColor | null;
  stealable: boolean;
  legendary: boolean;
};

export type Mosaic = {
  cells: MosaicCell[];
  viewBox: { x: number; y: number; width: number; height: number };
  cellAt: (offset: LocalIj) => string;
  pointAt: (offset: LocalIj) => [number, number];
};

type MosaicOptions = {
  center: LngLat;
  resolution: number;
  rings: number;
  territories: TerritorySpec[];
};

const METERS_PER_DEGREE = 111_320;

// Proyección equirectangular local: a escala de barrio la distorsión es
// despreciable y evita cargar una librería de proyecciones sólo para esto.
function createProjection([lng0, lat0]: LngLat) {
  const lngScale = METERS_PER_DEGREE * Math.cos((lat0 * Math.PI) / 180);
  return ([lat, lng]: [number, number]): [number, number] => [
    (lng - lng0) * lngScale,
    -(lat - lat0) * METERS_PER_DEGREE,
  ];
}

// Las coordenadas IJ de H3 no arrancan en 0 en el origen: se desplazan
// desde las del origen para poder describir territorios como offsets.
function createOffsetResolver(origin: string) {
  const base = cellToLocalIj(origin, origin);
  return (offset: LocalIj) => localIjToCell(origin, { i: base.i + offset.i, j: base.j + offset.j });
}

function assignTerritories(cellAtOffset: (offset: LocalIj) => string, territories: TerritorySpec[]) {
  const byCell = new Map<string, TerritorySpec>();
  for (const territory of territories) {
    const anchor = cellAtOffset(territory.anchor);
    for (const cell of gridDisk(anchor, territory.radius)) byCell.set(cell, territory);
  }
  return byCell;
}

function boundsOf(cells: MosaicCell[]) {
  const vertices = cells.flatMap((cell) => cell.vertices);
  const xs = vertices.map(([vx]) => vx);
  const ys = vertices.map(([, vy]) => vy);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

export function buildMosaic({ center, resolution, rings, territories }: MosaicOptions): Mosaic {
  const origin = latLngToCell(center[1], center[0], resolution);
  const project = createProjection(center);
  const cellAtOffset = createOffsetResolver(origin);
  const territoryByCell = assignTerritories(cellAtOffset, territories);

  const cells = gridDisk(origin, rings).map((h3): MosaicCell => {
    const territory = territoryByCell.get(h3);
    return {
      h3,
      vertices: cellToBoundary(h3).map(project),
      center: project(cellToLatLng(h3)),
      owner: territory?.owner ?? null,
      stealable: territory?.stealable ?? false,
      legendary: territory?.legendary ?? false,
    };
  });

  return {
    cells,
    viewBox: boundsOf(cells),
    cellAt: cellAtOffset,
    pointAt: (offset) => project(cellToLatLng(cellAtOffset(offset))),
  };
}
