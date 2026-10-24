import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { cx } from './cx';

export type SheetSnap = 'min' | 'mid' | 'full';

type BottomSheetProps = {
  /** Nombre accesible de la región (p. ej. "Resumen de tus puntos"). */
  label: string;
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
  /** Alturas visibles en px de cada posición (sin contar el footer). */
  heights?: Record<SheetSnap, number>;
  /** Contenido fijo debajo del cuerpo, típicamente <BottomNav />. */
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

const ORDER: SheetSnap[] = ['min', 'mid', 'full'];
const DEFAULT_HEIGHTS: Record<SheetSnap, number> = { min: 140, mid: 300, full: 620 };

/**
 * Hoja inferior con agarre y tres alturas: mínima (solo número héroe),
 * media (resumen) y completa. Se arrastra desde el agarre o se cicla tocándolo.
 * El botón principal tiene que quedar visible en "mid".
 */
export function BottomSheet({
  label,
  snap,
  onSnapChange,
  heights = DEFAULT_HEIGHTS,
  footer,
  children,
  className,
}: BottomSheetProps) {
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const start = useRef<{ y: number; moved: boolean } | null>(null);

  const visible = heights[snap] - (dragOffset ?? 0);
  const clamped = Math.min(heights.full, Math.max(heights.min, visible));

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    start.current = { y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!start.current) return;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dy) > 4) start.current.moved = true;
    if (start.current.moved) setDragOffset(dy);
  }

  function onPointerUp() {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (!s.moved) {
      // Toque: cicla a la siguiente altura.
      const next = ORDER[(ORDER.indexOf(snap) + 1) % ORDER.length];
      onSnapChange(next);
      setDragOffset(null);
      return;
    }
    const nearest = ORDER.reduce((best, k) =>
      Math.abs(heights[k] - clamped) < Math.abs(heights[best] - clamped) ? k : best,
    );
    setDragOffset(null);
    onSnapChange(nearest);
  }

  return (
    <section
      aria-label={label}
      className={cx('hx-sheet', footer != null && 'hx-sheet--with-nav', className)}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
      }}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ display: 'flex', justifyContent: 'center', padding: '0 0 6px', margin: '-10px 0 -6px', paddingTop: 10, cursor: 'grab' }}
      >
        <button
          type="button"
          className="hx-sheet__grabber"
          aria-label={snap === 'full' ? 'Achicar panel' : 'Agrandar panel'}
          aria-expanded={snap !== 'min'}
        />
      </div>
      <div
        style={{
          height: clamped,
          overflowY: snap === 'full' && dragOffset == null ? 'auto' : 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          transition: dragOffset == null ? 'height 280ms cubic-bezier(.2,.7,.2,1)' : 'none',
        }}
      >
        {children}
      </div>
      {footer && <div style={{ margin: '0 calc(-1 * var(--hx-gutter))' }}>{footer}</div>}
    </section>
  );
}
