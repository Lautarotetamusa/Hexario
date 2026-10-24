import { Chip, IconStar } from '@ds';
import { SectionHeader } from '../components/SectionHeader';
import { LIFECYCLE } from '../content';

export function Lifecycle() {
  return (
    <section className="lp-section lp-section--surface" aria-labelledby="ciclo">
      <div className="lp-container">
        <SectionHeader id="ciclo" kicker="La vida de un hexágono" title="Lo que no se camina, se pierde.">
          Volver a pasar reinicia la protección, la expiración y la renta. No cuesta nada.
        </SectionHeader>
        <ol className="lp-timeline">
          {LIFECYCLE.map((stage) => (
            <li key={stage.label} className="lp-timeline__stage">
              <Chip tone={stage.tone}>{stage.label}</Chip>
              <p className="lp-body">{stage.text}</p>
            </li>
          ))}
        </ol>
        <p className="lp-legendary">
          <Chip tone="gold" icon={<IconStar size={14} />}>Legendario</Chip>
          <span className="lp-body">Algunos hexágonos marcan hitos de la ciudad y rentan <span className="hx-num">x3</span>.</span>
        </p>
      </div>
    </section>
  );
}
