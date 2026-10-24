# Hexario — instrucciones para agentes

Antes de tocar código, leé:

- [`CLAUDE.md`](CLAUDE.md): reglas de estilo obligatorias (DI, DRY,
  comentarios que expliquen el *por qué*, una responsabilidad por función).
- [`PRODUCT.md`](PRODUCT.md): reglas de negocio, parámetros del
  juego, historias de usuario y decisiones del MVP.
- [`back/ARCHITECTURE.md`](back/ARCHITECTURE.md): capas de un módulo y
  convenciones de schema/repository/service/controller.
- [`app/CLAUDE.md`](app/CLAUDE.md) y
  [`app/src/design-system/readme.md`](app/src/design-system/readme.md): reglas
  de React y sistema de diseño de la PWA.
- [`specs/README.md`](specs/README.md): flujo `front-designer` → `planner` →
  `back-implementer` y formato de `design.md` / `plan.md`.

Reglas rápidas:

- Los módulos de negocio actuales son `user`, `territory` y `business`; para uno nuevo,
  seguí la estructura de `back/src/modules/user/`.
- Las reglas de negocio van en el `service`, las queries en el
  `repository` y el `controller` sólo adapta HTTP.
- En la app, usá siempre componentes de `app/src/design-system/` importados
  desde el barrel; no crees primitivos de UI paralelos.
- Después de tocar rutas del back: `npm run docs:api` dentro de `back/`.
- Antes de cerrar: `npx tsc --noEmit -p tsconfig.json`, `npm run lint` y
  `npm test` dentro de `back/`; `npm run typecheck`, `npm run lint` y
  `npm run build` dentro de `app/`.
