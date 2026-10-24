# Historia: base visual de la PWA

Implementar la base del front de la PWA de Hexario usando el sistema de
diseño ya creado (React + tokens + MapLibre/H3) y las funcionalidades que ya
existen en la app.

## Alcance

- Integrar el sistema de diseño de Hexario en `app/src/design-system/`.
- Armar el shell mobile-first de la app:
  - Mapa como pantalla principal.
  - Navegación inferior: Mapa, Canjes, Ranking, Perfil.
  - Hoja inferior con resumen de puntos y tarjeta de hexágono.
- Implementar las pantallas base:
  - Mapa (con hexágonos de muestra, mapa real y ubicación).
  - Canjes (listado de promociones/cupones de muestra).
  - Ranking (listado de muestra + filtro segmentado).
  - Perfil (datos reales del usuario autenticado).
  - Login y registro (flujo real contra el backend actual).
- Mantener la PWA: manifest, service worker, instalación, offline y
  comportamiento con la app abierta.
- Usar datos mock aislados y tipados para lo que el backend todavía no
  provee (hexágonos, renta, puntos, promociones, ranking, avisos de robo).
- No implementar todavía la lógica de claim/steal ni endpoints nuevos.

## Restricciones

- No inventar una estética nueva: usar los tokens y componentes del sistema
  de diseño entregado. Si falta un primitivo básico (por ejemplo inputs de
  formulario o un contenedor de pantalla), extenderlo de forma mínima y
  consistente con `--hx-*`.
- Mobile-first, con safe areas para PWA instalada.
- El mapa debe funcionar sin API key usando OpenFreeMap; dejar la
  configuración de tiles centralizada.
- El auth y el perfil siguen usando la API real existente.
- Los mocks no deben filtrarse a la lógica de producción: aislarlos en
  archivos `mock.ts` o similar.

## Criterio de cierre

- `npm run typecheck`, `npm run build` y `npm run lint` pasan.
- La PWA se puede abrir en mobile y navegar entre Mapa, Canjes, Ranking y
  Perfil sin errores.
- El login real lleva al mapa.
- `specs/001-front-base-pwa/design.md` documenta qué se construyó y qué
  datos necesita el backend.
