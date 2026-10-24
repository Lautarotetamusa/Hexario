# Front

Interfaz web del MVP. `index.html` define la pantalla, `style.css` su aspecto
y `app.js` muestra el mapa con Leaflet, gestiona la sesión y pide ubicación al
navegador. El front no accede a PostgreSQL ni decide quién es dueño de una
celda: envía reclamos a la API y muestra la respuesta.

Desde la raíz del repositorio, `docker compose up --build` lo sirve en
`http://localhost:8080`. Usa `http://localhost:3001` como API local; para
otro host se puede definir `window.HEXARIO_API_URL` antes de cargar `app.js`.
El contrato de territorios está en [`../back/docs/territories.md`](../back/docs/territories.md).
