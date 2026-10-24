import { useMemo } from 'react';
import type { PlayerColor } from '@ds';
import { buildMosaic, type LngLat, type Mosaic, type LocalIj, type MosaicCell, type TerritorySpec } from '../hexMosaic';

type HexMosaicMapProps = {
  center: LngLat;
  territories: TerritorySpec[];
  trail: LocalIj[];
  capture: LocalIj;
  selected: LocalIj;
};

const RESOLUTION = 10;
const RINGS = 8;
// El disco H3 es hexagonal: encuadrando sólo su centro el mapa llena el
// marco cuadrado sin que se vean los bordes del mosaico.
const VIEW_CROP = 0.68;

const toPoints = (vertices: [number, number][]) => vertices.map((vertex) => vertex.join(',')).join(' ');

function cellClassName(cell: MosaicCell) {
  if (cell.legendary) return 'lp-hex lp-hex--legendary';
  if (!cell.owner) return 'lp-hex';
  return `lp-hex lp-hex--owned lp-hex--${cell.owner}${cell.stealable ? ' lp-hex--stealable' : ''}`;
}

function cropToCenter(box: Mosaic['viewBox'], ratio: number) {
  const side = Math.min(box.width, box.height) * ratio;
  return {
    x: box.x + (box.width - side) / 2,
    y: box.y + (box.height - side) / 2,
    width: side,
    height: side,
  };
}

function ownerFill(owner: PlayerColor) {
  return { fill: `var(--hx-${owner})`, stroke: `var(--hx-${owner}-line)` };
}

export function HexMosaicMap({ center, territories, trail, capture, selected }: HexMosaicMapProps) {
  const mosaic = useMemo(
    () => buildMosaic({ center, resolution: RESOLUTION, rings: RINGS, territories }),
    [center, territories],
  );
  const { x, y, width, height } = cropToCenter(mosaic.viewBox, VIEW_CROP);
  const trailPoints = trail.map(mosaic.pointAt).map((point) => point.join(',')).join(' ');
  const [captureX, captureY] = mosaic.pointAt(capture);
  const selectedH3 = mosaic.cellAt(selected);
  const selectedCell = mosaic.cells.find((cell) => cell.h3 === selectedH3);

  return (
    <svg
      className="lp-mosaic"
      viewBox={`${x} ${y} ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Mapa de Rosario dividido en hexágonos: los tuyos en verde, los de otros jugadores en celeste, coral y lavanda"
    >
      <defs>
        <pattern id="lp-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="14" className="lp-hatch-line" />
        </pattern>
      </defs>

      <rect x={x} y={y} width={width} height={height} className="lp-mosaic__ground" />

      {mosaic.cells.map((cell) => (
        <polygon
          key={cell.h3}
          points={toPoints(cell.vertices)}
          className={cellClassName(cell)}
          style={cell.owner ? ownerFill(cell.owner) : undefined}
        />
      ))}

      {mosaic.cells
        .filter((cell) => cell.stealable)
        .map((cell) => (
          <polygon key={`${cell.h3}-hatch`} points={toPoints(cell.vertices)} className="lp-hex-hatch" />
        ))}

      <polyline points={trailPoints} className="lp-trail" />

      {mosaic.cells
        .filter((cell) => cell.legendary)
        .map((cell) => (
          <path
            key={`${cell.h3}-star`}
            className="lp-star"
            transform={`translate(${cell.center[0]} ${cell.center[1]}) scale(1.6)`}
            d="M0 -10 L2.9 -3.6 L9.5 -3.1 L4.5 1.4 L5.9 8.1 L0 4.6 L-5.9 8.1 L-4.5 1.4 L-9.5 -3.1 L-2.9 -3.6 Z"
          />
        ))}

      {selectedCell && <polygon points={toPoints(selectedCell.vertices)} className="lp-hex-selected" />}

      <circle cx={captureX} cy={captureY} r="40" className="lp-capture-ring" />
      <circle cx={captureX} cy={captureY} r="9" className="lp-me-dot" />
    </svg>
  );
}
