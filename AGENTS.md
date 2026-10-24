# Hexario — instrucciones para agentes

Antes de tocar código, leé:

- [`CLAUDE.md`](CLAUDE.md): reglas de estilo obligatorias (DI, DRY,
  comentarios que expliquen el *por qué*, una responsabilidad por función).
- [`back/ARCHITECTURE.md`](back/ARCHITECTURE.md): capas de un módulo y
  convenciones de schema/repository/service/controller.
- [`specs/README.md`](specs/README.md): flujo `front-designer` → `planner` →
  `back-implementer` y formato de `design.md` / `plan.md`.

Reglas rápidas:

- Los módulos de negocio actuales son `user` y `territory`; para uno nuevo,
  seguí la estructura de `back/src/modules/user/`.
- Las reglas de negocio van en el `service`, las queries en el
  `repository` y el `controller` sólo adapta HTTP.
- Después de tocar rutas: `npm run docs:api` dentro de `back/`.
- Antes de cerrar: `npx tsc --noEmit -p tsconfig.json`, `npm run lint` y
  `npm test` dentro de `back/`.
