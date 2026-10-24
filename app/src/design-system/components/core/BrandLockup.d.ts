/** Marca de Hexario (isotipo + wordmark). Hereda `color` del contenedor. */
export interface BrandLockupProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Alto en píxeles del isotipo y base del wordmark. Default 22. */
  height?: number;
  /** Texto del wordmark. Default "Hexario". */
  alt?: string;
}
export function BrandLockup(props: BrandLockupProps): JSX.Element;
