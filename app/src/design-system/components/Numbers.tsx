import type { ReactNode } from 'react';
import { cx } from './cx';

type HeroNumberProps = {
  label?: string;
  value: ReactNode;
  unit?: string;
  className?: string;
};

/** Número héroe: uno solo por pantalla. Etiqueta arriba, unidad chica alineada a la base. */
export function HeroNumber({ label, value, unit, className }: HeroNumberProps) {
  return (
    <div className={cx('hx-hero', className)}>
      {label && <span className="hx-label">{label}</span>}
      <span className="hx-hero__value">
        {value}
        {unit && <span className="hx-hero__unit">{unit}</span>}
      </span>
    </div>
  );
}

export type Stat = {
  label: string;
  value: ReactNode;
  unit?: string;
  tone?: 'default' | 'alert' | 'muted';
};

/** Bloque de datos: etiqueta chica arriba, valor mono abajo. Siempre tres (o dos en tarjetas). */
export function StatRow({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <dl className={cx('hx-stats', stats.length === 2 && 'hx-stats--2', className)}>
      {stats.map((s) => (
        <div key={s.label} className={cx('hx-stat', s.tone && s.tone !== 'default' && `hx-stat--${s.tone}`)}>
          <dt>{s.label}</dt>
          <dd>
            {s.value}
            {s.unit && <span className="hx-stat__unit">{s.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
