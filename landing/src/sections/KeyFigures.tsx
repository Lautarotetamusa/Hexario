import { StatRow } from '@ds';
import { KEY_FIGURES } from '../content';

export function KeyFigures() {
  return (
    <section className="lp-container lp-figures" aria-label="El juego en tres cifras">
      <StatRow stats={KEY_FIGURES} />
    </section>
  );
}
