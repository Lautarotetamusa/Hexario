import type { RankingEntry } from '../../design-system';

export type RankingPeriod = 'week' | 'month' | 'all';

export const RANKING_PERIODS: Array<{ value: RankingPeriod; label: string }> = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'all', label: 'Siempre' },
];

export const PERIOD_LABEL: Record<RankingPeriod, string> = {
  week: 'Semana',
  month: 'Mes',
  all: 'Siempre',
};

/**
 * Ranking de muestra por período. La fila propia cambia de puesto según el
 * período, como pasaría con datos reales.
 */
export const MOCK_RANKING: Record<RankingPeriod, RankingEntry[]> = {
  week: [
    { id: 'juli', position: 1, name: 'Juli', color: 'sky', hexagons: 22, points: 12480 },
    { id: 'tomi', position: 2, name: 'Tomi', color: 'coral', hexagons: 19, points: 11210 },
    { id: 'sofi', position: 3, name: 'Sofi', color: 'violet', hexagons: 17, points: 9870 },
    { id: 'nico', position: 4, name: 'Nico', color: 'sky', hexagons: 15, points: 8740 },
    { id: 'cami', position: 5, name: 'Cami', color: 'coral', hexagons: 13, points: 8120 },
    { id: 'fede', position: 6, name: 'Fede', color: 'neutral', hexagons: 12, points: 7890 },
    { id: 'me', position: 7, name: 'Vos', color: 'me', hexagons: 14, points: 7420, isMe: true },
    { id: 'lu', position: 8, name: 'Lu', color: 'violet', hexagons: 9, points: 6980 },
    { id: 'male', position: 9, name: 'Male', color: 'neutral', hexagons: 8, points: 6410 },
  ],
  month: [
    { id: 'juli', position: 1, name: 'Juli', color: 'sky', hexagons: 86, points: 48320 },
    { id: 'sofi', position: 2, name: 'Sofi', color: 'violet', hexagons: 79, points: 44110 },
    { id: 'tomi', position: 3, name: 'Tomi', color: 'coral', hexagons: 74, points: 41870 },
    { id: 'nico', position: 4, name: 'Nico', color: 'sky', hexagons: 66, points: 38940 },
    { id: 'cami', position: 5, name: 'Cami', color: 'coral', hexagons: 61, points: 36210 },
    { id: 'me', position: 6, name: 'Vos', color: 'me', hexagons: 58, points: 34890, isMe: true },
    { id: 'fede', position: 7, name: 'Fede', color: 'neutral', hexagons: 52, points: 32110 },
    { id: 'lu', position: 8, name: 'Lu', color: 'violet', hexagons: 47, points: 29840 },
    { id: 'male', position: 9, name: 'Male', color: 'neutral', hexagons: 41, points: 26420 },
  ],
  all: [
    { id: 'juli', position: 1, name: 'Juli', color: 'sky', hexagons: 214, points: 162480 },
    { id: 'sofi', position: 2, name: 'Sofi', color: 'violet', hexagons: 198, points: 151210 },
    { id: 'tomi', position: 3, name: 'Tomi', color: 'coral', hexagons: 187, points: 147870 },
    { id: 'nico', position: 4, name: 'Nico', color: 'sky', hexagons: 169, points: 134740 },
    { id: 'cami', position: 5, name: 'Cami', color: 'coral', hexagons: 154, points: 128120 },
    { id: 'fede', position: 6, name: 'Fede', color: 'neutral', hexagons: 142, points: 119890 },
    { id: 'me', position: 7, name: 'Vos', color: 'me', hexagons: 138, points: 116420, isMe: true },
    { id: 'lu', position: 8, name: 'Lu', color: 'violet', hexagons: 121, points: 104980 },
    { id: 'male', position: 9, name: 'Male', color: 'neutral', hexagons: 108, points: 96110 },
  ],
};

export function findMyEntry(entries: RankingEntry[]): RankingEntry {
  return entries.find((entry) => entry.isMe) ?? entries[0];
}
