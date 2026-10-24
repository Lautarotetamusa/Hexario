import { HexCard } from '@ds';
import { SectionHeader } from '../components/SectionHeader';
import { STEPS } from '../content';
import { goToApp } from '../navigation';

export function HowToPlay() {
  return (
    <section className="lp-section" aria-labelledby="como-se-juega">
      <div className="lp-container">
        <SectionHeader id="como-se-juega" kicker="Cómo se juega" title="Tres verbos. Una ciudad.">
          La ciudad está dividida en hexágonos de una manzana y media. Cada uno puede ser tuyo.
        </SectionHeader>
        <ol className="lp-steps">
          {STEPS.map((step, index) => (
            <li key={step.title} className="lp-step">
              <span className="lp-step__index hx-num">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="hx-subtitle">{step.title}</h3>
              <p className="lp-body">{step.text}</p>
              <HexCard {...step.card} float={false} className="lp-step__card" onAction={goToApp} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
