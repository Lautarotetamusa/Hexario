import { useState } from 'react';
import { RankingList, Segmented } from '@ds';
import { SectionHeader } from '../components/SectionHeader';
import { RANKING, RANKING_PERIODS, type RankingPeriod } from '../content';

export function Ranking() {
  const [period, setPeriod] = useState<RankingPeriod>('week');
  return (
    <section className="lp-section" aria-labelledby="ranking">
      <div className="lp-container lp-split">
        <SectionHeader id="ranking" kicker="Ranking" title="Gana el que más camina.">
          Ranking semanal, mensual y de siempre. Cuenta lo que ganaste, no lo que gastaste.
        </SectionHeader>
        <div className="lp-split__visual lp-ranking">
          <Segmented label="Período del ranking" options={RANKING_PERIODS} value={period} onChange={setPeriod} />
          <RankingList entries={RANKING[period]} label="Ranking de ejemplo" />
        </div>
      </div>
    </section>
  );
}
