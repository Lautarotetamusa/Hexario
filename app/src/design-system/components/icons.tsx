import type { SVGProps } from 'react';

/** Íconos de trazo 1.75 sobre 24 px. Heredan color con currentColor. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

function Base({ size = 24, strokeWidth = 1.75, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconHex = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 2.5 L20.5 7.25 L20.5 16.75 L12 21.5 L3.5 16.75 L3.5 7.25 Z" />
  </Base>
);

/** Ícono de Mapa activo: hexágono con núcleo relleno. */
export const IconHexActive = (p: IconProps) => (
  <Base strokeWidth={2} {...p}>
    <path d="M12 2.5 L20.5 7.25 L20.5 16.75 L12 21.5 L3.5 16.75 L3.5 7.25 Z" />
    <path d="M12 8.5 L15.5 10.5 L15.5 14 L12 16 L8.5 14 L8.5 10.5 Z" fill="currentColor" stroke="none" />
  </Base>
);

export const IconPlay = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 4.5 L19 12 L7 19.5 Z" />
  </Base>
);

export const IconPause = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 5v14M16 5v14" />
  </Base>
);

export const IconLock = (p: IconProps) => (
  <Base {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Base>
);

export const IconClock = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2M10 2.5h4" />
  </Base>
);

export const IconTicket = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 7.5h17v3a2 2 0 0 0 0 4v3h-17v-3a2 2 0 0 0 0-4z M14.5 7.5v10" />
  </Base>
);

export const IconRanking = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 20.5v-6M12 20.5V4M19 20.5V10" />
  </Base>
);

export const IconUser = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="8.5" r="4" />
    <path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" />
  </Base>
);

export const IconStar = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.8z" />
  </Base>
);

export const IconArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const IconArrowLeft = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Base>
);

export const IconClose = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Base>
);

export const IconLocate = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="6.5" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </Base>
);

export const IconLayers = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5 L20.5 8 L12 12.5 L3.5 8 Z M3.5 12 L12 16.5 L20.5 12 M3.5 16 L12 20.5 L20.5 16" />
  </Base>
);

export const IconBell = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z M10 20.5a2 2 0 0 0 4 0" />
  </Base>
);

/** Marca de Hexario: hexágono de tinta con núcleo menta. */
export function HexarioMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size * 0.9} height={size} viewBox="0 0 36 40" aria-hidden="true" focusable="false">
      <path d="M18 2 L33 10.5 L33 29.5 L18 38 L3 29.5 L3 10.5 Z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M18 12 L25 16 L25 24 L18 28 L11 24 L11 16 Z" fill="var(--hx-me)" stroke="var(--hx-me-line)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
