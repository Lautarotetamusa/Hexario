import { IconArrowRight, IconCheck } from '@ds';
import { ButtonLink } from '../components/ButtonLink';
import { SectionHeader } from '../components/SectionHeader';
import { MERCHANT_CONTACT_URL } from '../config';
import { MERCHANT_FEATURES } from '../content';

export function Merchants() {
  return (
    <section className="lp-section" aria-labelledby="comercios">
      <div className="lp-container lp-merchants">
        <SectionHeader id="comercios" kicker="Comercios" title="¿Tenés un local? Que la gente camine hasta tu puerta.">
          Cada promo que publicás es un motivo para que alguien del barrio pase por tu vereda.
        </SectionHeader>
        <div className="lp-merchants__aside">
          <ul className="lp-checklist">
            {MERCHANT_FEATURES.map((feature) => (
              <li key={feature}>
                <IconCheck size={18} strokeWidth={2} />
                {feature}
              </li>
            ))}
          </ul>
          <ButtonLink href={MERCHANT_CONTACT_URL} variant="secondary" icon={<IconArrowRight size={18} strokeWidth={2} />}>
            Sumar mi comercio
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
