# Territorios: contrato del MVP

Los endpoints existentes de `/user` siguen siendo el acceso: `POST /user/login`
devuelve `token` y las rutas privadas reciben `Authorization: Bearer <token>`.
Los éxitos nuevos usan `{ "success": true, "data": ... }`; los errores usan
`{ "success": false, "errors": [{ "code": "...", "message": "..." }] }`.

## Mapa

`GET /territories?bbox=sur,oeste,norte,este` no requiere sesión. Las cuatro
coordenadas son grados WGS84: latitud sur, longitud oeste, latitud norte,
longitud este. La respuesta contiene `resolution: 10`, `bounds` del área de
juego, `serverTime` y `cells`. Cada celda tiene `id` H3, `boundary` como
pares `[latitud, longitud]` para dibujar, `owner: { username } | null` y
`claimedAt: ISO-8601 | null`. Las celdas libres se calculan con H3; se guarda
en la base solo el reclamo. Si la ventana devuelve más de 1200 celdas, la API
responde `400 MAP_AREA_TOO_LARGE` para que el cliente acerque el mapa.

## Reclamo

`POST /territories/claim` requiere sesión y este cuerpo:

```json
{
  "latitude": -32.949,
  "longitude": -60.698,
  "accuracy": 12,
  "recordedAt": "2026-10-24T13:00:00.000Z"
}
```

El servidor convierte la posición a una celda H3 de resolución 10. Sólo acepta
una muestra cuya hora difiera como máximo 30 segundos de la hora del servidor
(y no esté más de 5 segundos en el futuro), con error informado menor o igual
a 50 metros y dentro del área configurada. Devuelve `201` con
`{ claimed: true, territory }` al reclamar; `200` con
`{ claimed: false, territory }` cuando el mismo usuario ya es dueño; `409
TERRITORY_OWNED` con `territory` actualizado cuando es de otro. Los errores
de ubicación usan `LOCATION_STALE`, `LOCATION_INACCURATE` y
`OUTSIDE_GAME_AREA`. El cuerpo de los errores no incluye las coordenadas.

`GET /territories/mine` requiere sesión y devuelve `{ count: número }`.

La cobertura municipal actual es aproximada. Este flujo sirve para el
prototipo: la ubicación proviene del navegador y todavía puede falsificarse.
