import type { ReactNode } from 'react';
import type { PlayerColor } from '../theme/tokens';
import { formatPoints, formatRank } from '../format';
import { Avatar } from './Avatar';
import { cx } from './cx';

export type RankingEntry = {
  id: string;
  position: number;
  name: string;
  color: PlayerColor;
  hexagons: number;
  points: number;
  isMe?: boolean;
};

export function RankingRow({ entry, sticky }: { entry: RankingEntry; sticky?: boolean }) {
  return (
    <li
      className={cx('hx-rank-row', entry.isMe && 'hx-rank-row--me', sticky && 'hx-rank-row--sticky')}
      aria-current={entry.isMe ? 'true' : undefined}
    >
      <span className="hx-rank-row__pos">{formatRank(entry.position)}</span>
      <Avatar name={entry.name} color={entry.isMe ? 'me' : entry.color} />
      <span className="hx-rank-row__name">{entry.isMe ? 'Vos' : entry.name}</span>
      <span className="hx-rank-row__hex">{entry.hexagons} hx</span>
      <span className="hx-rank-row__pts">{formatPoints(entry.points)}</span>
    </li>
  );
}

export function RankingList({
  entries,
  label = 'Ranking',
  stickyMe,
}: {
  entries: RankingEntry[];
  label?: string;
  /** Deja la fila propia al final, fija arriba de la nav mientras se recorre el resto. */
  stickyMe?: boolean;
}): ReactNode {
  // La propia va última aunque su puesto sea otro: así queda siempre a mano y
  // se lee como "tu posición" en vez de mezclarse con las filas de arriba.
  const ordered = stickyMe
    ? [...entries.filter((entry) => !entry.isMe), ...entries.filter((entry) => entry.isMe)]
    : entries;

  return (
    <ol className="hx-ranking" aria-label={label}>
      {ordered.map((e) => (
        <RankingRow key={e.id} entry={e} sticky={stickyMe && e.isMe} />
      ))}
    </ol>
  );
}
