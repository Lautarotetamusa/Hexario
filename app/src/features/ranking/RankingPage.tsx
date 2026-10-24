import { useState } from 'react';
import { RankingList, Segmented, StatRow, formatPoints, formatRank } from '../../design-system';
import { MOCK_RANKING, PERIOD_LABEL, RANKING_PERIODS, findMyEntry, type RankingPeriod } from './mock';

export function RankingPage() {
  const [period, setPeriod] = useState<RankingPeriod>('week');
  const entries = MOCK_RANKING[period];
  const me = findMyEntry(entries);

  return (
    <main className="hx-screen hx-screen--app">
      <header className="hx-page-header">
        <span className="hx-label">Ranking</span>
        <h1 className="hx-title">La ciudad en juego</h1>
        <p className="hx-caption">Se suman los puntos de renta ganados en el período.</p>
      </header>

      <Segmented
        label="Período del ranking"
        options={RANKING_PERIODS}
        value={period}
        onChange={setPeriod}
      />

      <StatRow
        stats={[
          { label: 'Tu puesto', value: formatRank(me.position) },
          { label: 'Puntos', value: formatPoints(me.points) },
          { label: 'Hexágonos', value: me.hexagons },
        ]}
      />

      <section className="hx-section" aria-labelledby="ranking-list">
        <div className="hx-list-header">
          <span className="hx-label" id="ranking-list">
            {PERIOD_LABEL[period]}
          </span>
          <span className="hx-caption">Actualizado hace 5 min</span>
        </div>
        <RankingList entries={entries} label={`Ranking de ${PERIOD_LABEL[period].toLowerCase()}`} stickyMe />
      </section>
    </main>
  );
}
