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

## Usuarios del seed

| Username | Password |
|---|---|
| `usuario_uno` | `seed12345` |
| `usuario_dos` | `seed12345` |

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
- `api.md`: resumen generado desde las rutas (`npm run docs:api`).

La colección incluye tests básicos de status y forma de respuesta, y
documentación de cada request en su bloque `docs`.
