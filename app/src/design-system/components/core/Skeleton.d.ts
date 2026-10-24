/**
 * Bloque de papel que ocupa el lugar del contenido mientras carga. Es el
 * equivalente sin giro del spinner del botón: el sistema no usa spinners de
 * página (ver readme.md, Movimiento).
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  width?: number | string;
  height?: number | string;
  /** Cualquier radio de la escala; default var(--radius-xs). */
  radius?: string;
  /** Fuerza un cuadrado perfecto (avatar, portada) en vez de una barra de texto. */
  circle?: boolean;
}
export function Skeleton(props: SkeletonProps): JSX.Element;
