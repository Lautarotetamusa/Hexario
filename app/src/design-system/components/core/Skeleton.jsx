import React from 'react';

/** Bloque de papel en el lugar del contenido mientras carga (esqueletos de listado y ficha). */
export function Skeleton({ width = '100%', height = 10, radius = 'var(--radius-xs)', circle = false, style, ...rest }) {
  return (
    <span
      aria-hidden="true"
      {...rest}
      style={{
        display: 'block',
        width: circle ? height : width,
        height,
        borderRadius: circle ? 'var(--radius-pill)' : radius,
        background: 'var(--papel-100)',
        animation: 'hexario-pulse 1400ms ease-in-out infinite',
        ...style,
      }}
    />
  );
}
