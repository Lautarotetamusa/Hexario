import { HexarioMark } from '@ds';

export function SiteFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer__inner">
        <span className="lp-brand">
          <HexarioMark size={22} />
          <span>Hexario</span>
        </span>
        <span className="hx-caption">Hecho en Rosario · Mayores de 18</span>
        <nav aria-label="Legales" className="lp-footer__links">
          <a href="#terminos">Términos</a>
          <a href="#privacidad">Privacidad</a>
        </nav>
      </div>
    </footer>
  );
}
