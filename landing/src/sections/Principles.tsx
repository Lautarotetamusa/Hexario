import { SectionHeader } from '../components/SectionHeader';
import { PRINCIPLES } from '../content';

export function Principles() {
  return (
    <section className="lp-section lp-section--surface" aria-labelledby="reglas">
      <div className="lp-container">
        <SectionHeader id="reglas" kicker="Reglas claras" title="Se gana caminando. Nada más." />
        <ul className="lp-principles">
          {PRINCIPLES.map((principle) => (
            <li key={principle.title}>
              <h3 className="hx-subtitle">{principle.title}</h3>
              <p className="lp-body">{principle.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
