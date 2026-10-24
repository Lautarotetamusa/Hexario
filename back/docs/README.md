# API de Hexario — documentación

Colección de **Bruno** con los endpoints disponibles hoy en el backend.

## Abrir la colección

1. Abrir Bruno.
2. **Open Collection** → seleccionar la carpeta `back/docs/`.
3. Elegir el environment `local` (host `http://localhost:3001`).
4. Correr `Auth/Register` (opcional) y después `Auth/Login`.
5. El token queda guardado en la variable de colección `token`.

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `POST` | `/user/register` | No | Crea un usuario. |
| `POST` | `/user/login` | No | Autentica y devuelve un JWT. |
| `GET` | `/user` | Sí | Devuelve el usuario autenticado. |
| `PUT` | `/user` | Sí | Actualiza el email del usuario. |
| `GET` | `/territories?bbox=s,w,n,e` | No | Hexágonos visibles (H3 resolución 10). |
| `GET` | `/territories/mine` | Sí | Cantidad de hexágonos propios. |
| `POST` | `/territories/claim` | Sí | Reclama la celda de la ubicación enviada. |
| `GET` | `/businesses` | No | Lista los comercios activos. |
| `GET` | `/businesses/:slug` | No | Detalle del comercio con sus promos. |
| `GET` | `/promotions` | No | Promociones disponibles de todos los comercios. |
| `GET` | `/promotions/:id` | No | Detalle de una promoción disponible. |

## Usuarios del seed

| Username | Password |
|---|---|
| `usuario_uno` | `seed12345` |
| `usuario_dos` | `seed12345` |
| `juli` | `seed12345` |
| `tomi` | `seed12345` |
| `agus` | `seed12345` |
| `meli` | `seed12345` |
| `nico` | `seed12345` |
| `sofia` | `seed12345` |

El seed también carga 93 territorios, 14 comercios y 18 promociones (15
disponibles y 3 ocultas a propósito para probar los filtros).

## Autenticación

Los endpoints protegidos esperan:

```http
Authorization: Bearer <token>
```

El request `Auth/Login` guarda el token automáticamente en la variable
`token` de la colección.

## Formato de respuesta

Éxito:

```json
{
  "success": true,
  "message": "opcional",
  "data": { }
}
```

Login (excepción: el token va en el nivel superior):

```json
{
  "success": true,
  "message": "login exitoso",
  "token": "eyJ..."
}
```

Error:

```json
{
  "success": false,
  "errors": [
    { "code": "Unauthorized", "message": "Falta el token de autenticación" }
  ]
}
```

## Ejemplos rápidos con curl

```bash
# Registro
curl -X POST http://localhost:3001/user/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","password":"Demo1234.","email":"demo@example.com"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3001/user/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"usuario_uno","password":"seed12345"}' | jq -r .token)

# Perfil
curl http://localhost:3001/user -H "Authorization: Bearer $TOKEN"

# Actualizar email
curl -X PUT http://localhost:3001/user \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"email":"nuevo@example.com"}'
```

## Archivos

- `Auth/Register.bru`: alta de usuario.
- `Auth/Login.bru`: login + guardado del token.
- `User/Get me.bru`: perfil autenticado.
- `User/Update.bru`: edición de email.
- `Territories/Get map.bru`: hexágonos visibles para un bbox.
- `Territories/Get mine.bru`: contador de hexágonos propios.
- `Territories/Claim.bru`: reclamo de una celda H3.
- `Businesses/List businesses.bru`: listado de comercios.
- `Businesses/Get business.bru`: detalle + promos de un comercio.
- `Promotions/List promotions.bru`: promos disponibles.
- `Promotions/Get promotion.bru`: detalle de una promo.
- `api.md`: resumen generado desde las rutas (`npm run docs:api`).

La colección incluye tests básicos de status y forma de respuesta, y
documentación de cada request en su bloque `docs`.
