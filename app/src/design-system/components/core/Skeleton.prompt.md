# Skeleton

Cuándo usarlo: mientras una lista o una ficha espera datos. Reserva el lugar
del contenido para que la pantalla no salte cuando llega la respuesta.

- No reemplaza al spinner del botón (`loading` de `Button`): ese indica que una
  acción está en curso; este, que un contenido todavía no llegó.
- Se compone con la forma final: barra para una línea de texto, `circle` para
  un avatar. No es decorativo: si el contenido tarda menos de ~200 ms, no hace
  falta mostrarlo.
- Único movimiento permitido: el pulso de opacidad (`hexario-pulse`). Nunca
  shimmer, escalado ni desplazamiento.

```jsx
<Card>
  <Skeleton circle height={40} />
  <Skeleton width={140} height={14} />
  <Skeleton height={10} />
  <Skeleton width="60%" height={10} />
</Card>
```
