Use `BrandLockup` para poner la marca en cualquier pantalla, en vez de repetir
el isotipo + wordmark a mano. Hereda `color`, así que sirve tanto sobre fondo
claro como oscuro.

```jsx
<div style={{ background: 'var(--pino-900)', padding: 'var(--space-6)' }}>
  <BrandLockup height={30} style={{ color: 'var(--papel-0)' }} />
</div>
```

`SidebarNav` ya coloca su propio lockup en el encabezado: no hace falta pasarle este componente.
