import type { PlayerColor } from '../theme/tokens';
import { formatCountdown, formatSigned } from '../format';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Chip } from './Chip';
import { StatRow } from './Numbers';
import { IconArrowRight, IconHex, IconLock } from './icons';
import { cx } from './cx';

/**
 * Estado del hexágono desde el punto de vista del jugador:
 * - free: nadie lo tiene → Reclamar
 * - stealable: de un rival y sin protección → Robar
 * - mine: tuyo → Renovar
 * - protected: de un rival y protegido → deshabilitado con cuenta regresiva
 */
export type HexCardState = 'free' | 'stealable' | 'mine' | 'protected';

export type HexCardProps = {
  state: HexCardState;
  /** Nombre del dueño ("Juli"). Para "mine" se muestra "Vos". */
  ownerName?: string;
  ownerColor?: PlayerColor;
  /** "Pichincha · a 320 m" */
  place: string;
  rentPerHour: number;
  /** Milisegundos de protección restantes (mine / protected). */
  protectionLeftMs?: number;
  legendary?: boolean;
  onAction?: () => void;
  /** Solo para "protected": pedir aviso cuando se libere. */
  onNotify?: () => void;
  float?: boolean;
  className?: string;
};

const ACTION_LABEL: Record<HexCardState, string> = {
  free: 'Reclamar',
  stealable: 'Robar',
  mine: 'Renovar',
  protected: 'Protegido',
};

const HINT: Record<HexCardState, string> = {
  free: 'Pasá por ahí para que sea tuyo',
  stealable: 'Caminá hasta ahí y es tuyo',
  mine: 'Volvé a pasar para renovar la protección',
  protected: 'Te avisamos cuando se pueda robar',
};

export function HexCard({
  state,
  ownerName,
  ownerColor = 'neutral',
  place,
  rentPerHour,
  protectionLeftMs,
  legendary,
  onAction,
  onNotify,
  float = true,
  className,
}: HexCardProps) {
  const name = state === 'free' ? 'Libre' : state === 'mine' ? 'Vos' : ownerName ?? 'Otro jugador';
  const rent = legendary ? rentPerHour * 3 : rentPerHour;

  const protectionStat =
    state === 'free'
      ? { label: 'Protección', value: '—', tone: 'muted' as const }
      : state === 'stealable'
        ? { label: 'Protección', value: 'Vencida', tone: 'alert' as const }
        : {
            label: state === 'protected' ? 'Se libera en' : 'Protección',
            value: formatCountdown(protectionLeftMs ?? 0, { alwaysHours: true }),
          };

  return (
    <article className={cx('hx-card', float && 'hx-card--float', className)} aria-label={`Hexágono de ${name}`}>
      <div className="hx-owner">
        {state === 'free' ? (
          <span className="hx-avatar hx-avatar--free" aria-hidden="true">
            <IconHex size={18} />
          </span>
        ) : (
          <Avatar name={state === 'mine' ? ownerName ?? 'Vos' : name} color={state === 'mine' ? 'me' : ownerColor} />
        )}
        <span className="hx-owner__text">
          <span className="hx-owner__name">{name}</span>
          <span className="hx-caption">{place}</span>
        </span>
        {legendary && <Chip tone="gold" size="sm"><span className="hx-num">x3</span></Chip>}
        {state === 'stealable' && <Chip tone="alert" size="sm">Robable</Chip>}
        {state === 'mine' && <Chip tone="ok" size="sm">Tuyo</Chip>}
        {state === 'protected' && <Chip tone="protected" size="sm">Protegido</Chip>}
      </div>

      <StatRow
        stats={[
          { label: 'Renta', value: formatSigned(rent), unit: '/h' },
          protectionStat,
        ]}
      />

      {state === 'protected' ? (
        <>
          <Button disabled icon={<IconLock size={18} strokeWidth={2} />}>
            {ACTION_LABEL.protected}
          </Button>
          {onNotify && (
            <Button variant="secondary" block onClick={onNotify}>
              Avisame cuando se libere
            </Button>
          )}
        </>
      ) : (
        <Button
          onClick={onAction}
          icon={state === 'stealable' ? <IconArrowRight size={18} strokeWidth={2} /> : undefined}
          iconPosition="end"
        >
          {ACTION_LABEL[state]}
        </Button>
      )}
      <span className="hx-caption hx-card__hint">{HINT[state]}</span>
    </article>
  );
}
