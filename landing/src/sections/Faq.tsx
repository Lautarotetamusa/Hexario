import { SectionHeader } from '../components/SectionHeader';
import { FAQ } from '../content';

export function Faq() {
  return (
    <section className="lp-section lp-section--surface" aria-labelledby="preguntas">
      <div className="lp-container lp-faq">
        <SectionHeader id="preguntas" kicker="Preguntas" title="Lo que todos preguntan." />
        <div className="lp-faq__list">
          {FAQ.map((item) => (
            <details key={item.question} className="lp-faq__item">
              <summary>{item.question}</summary>
              <p className="lp-body">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
