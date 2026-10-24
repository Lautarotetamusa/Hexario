import React from 'react';

// Marca de Hexario: el isotipo vive en /icons/icon.svg (también lo usa el
// manifest) y el wordmark se compone con la tipografía display del sistema.
// Así el lockup funciona sobre fondos claros y oscuros sin depender de un PNG.
export function BrandLockup({ height = 22, alt = 'Hexario', style, ...rest }) {
  return (
    <span {...rest} style={{
      display: 'inline-flex', alignItems: 'center', gap: Math.max(7, Math.round(height * 0.36)),
      height, color: 'inherit', lineHeight: 1, ...style,
    }}>
      <img src="/icons/icon.svg" alt="" aria-hidden="true"
        style={{ width: height, height, display: 'block', flex: '0 0 auto' }} />
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: Math.round(height * 0.82),
        fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)',
      }}>{alt}</span>
    </span>
  );
}
