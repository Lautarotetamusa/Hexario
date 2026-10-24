import { IconArrowRight } from '@ds';
import { ButtonLink } from '../components/ButtonLink';
import { APP_SIGNUP_URL } from '../config';

export function ClosingCta() {
  return (
    <section className="lp-section lp-closing" aria-labelledby="cierre">
      <div className="lp-container lp-closing__inner">
        <h2 id="cierre" className="lp-h1">Tu primera cuadra está a la vuelta.</h2>
        <ButtonLink href={APP_SIGNUP_URL} icon={<IconArrowRight size={18} strokeWidth={2} />}>
          Empezar a jugar
        </ButtonLink>
      </div>
    </section>
  );
}
