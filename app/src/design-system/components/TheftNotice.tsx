import type { PlayerColor } from '../theme/tokens';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { IconArrowRight } from './icons';

type TheftNoticeProps = {
  thiefName: string;
  thiefColor: PlayerColor;
  /** Nombre corto del lugar: "Pichincha" */
  place: string;
  /** "Hace 2 min" */
  when: string;
  lostRentPerHour: number;
  onRecover: () => void;
  onDismiss?: () => void;
};

/** Aviso de robo dentro de la app. Para push, usá el mismo texto: "{Juli} te sacó la cuadra de {Pichincha}". */
export function TheftNotice({ thiefName, thiefColor, place, when, lostRentPerHour, onRecover, onDismiss }: TheftNoticeProps) {
  return (
    <div className="hx-notice" role="alert">
      <div className="hx-notice__body">
        <Avatar name={thiefName} color={thiefColor} />
        <span className="hx-notice__text">
          <span className="hx-notice__kicker">Te robaron la cuadra</span>
          <span className="hx-notice__title">
            {thiefName} te sacó la cuadra de {place}
          </span>
          <span className="hx-caption">
            {when} · perdés <span className="hx-num">{lostRentPerHour} {lostRentPerHour === 1 ? 'pt' : 'pts'}/h</span>
          </span>
        </span>
      </div>
      <div className="hx-notice__actions">
        <Button onClick={onRecover} icon={<IconArrowRight size={16} strokeWidth={2} />} iconPosition="end">
          Ir a recuperarla
        </Button>
        {onDismiss && (
          <Button variant="secondary" size="sm" onClick={onDismiss}>
            Después
          </Button>
        )}
      </div>
    </div>
  );
}
