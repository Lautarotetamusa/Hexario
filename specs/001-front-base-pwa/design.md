# Design: base visual de la PWA

Estado: en revisión

## Historia
Como jugador, quiero abrir Hexario y moverme entre el mapa, mis canjes, el ranking y mi perfil con la identidad del sistema de diseño, para caminar, sumar puntos y canjear promociones desde el teléfono.

## Qué se construyó
- **Shell mobile-first**: rutas `/` (mapa), `/canjes`, `/ranking`, `/perfil` e `/instalar`; `BottomNav` (Mapa, Canjes, Ranking, Perfil), contenedor `.hx-screen` para las pantallas de contenido, áreas seguras y una columna centrada de 560 px en escritorio. El mapa va a pantalla completa y no comparte layout con el resto.
- **Mapa y territorio** (`src/features/map/`): MapLibre con OpenFreeMap (sin API key), centro en Rosario y zoom 15,5, padding inferior para que el marcador no quede tapado por la hoja. Los hexágonos H3 resolución 10 se cargan desde `GET /territories?bbox=...` y se refrescan al mover el mapa; los estados libre/propio/rival/protegido/robable se derivan del dueño y de `claimedAt` (protección de 6 h). El botón de ubicación y “Empezar caminata” usan `navigator.geolocation.watchPosition` con `enableHighAccuracy`; al entrar a una celda nueva se envía `POST /territories/claim` con latitud, longitud, precisión y timestamp. `GET /territories/mine` alimenta el contador real de hexágonos. Tocar un hexágono abre su `HexCard` en el `BottomSheet`, con dueño, distancia, renta, protección y acción. Errores de API (`TERRITORY_OWNED`, `OUTSIDE_GAME_AREA`, `LOCATION_STALE`, `LOCATION_INACCURATE`, `MAP_AREA_TOO_LARGE`) se muestran como estado del mapa. La atribución de OpenStreetMap/OpenFreeMap queda visible.
- **Canjes** (`src/features/rewards/`): saldo, listado de promociones con comercio, beneficio, costo, distancia y disponibilidad, y detalle de cupón con QR real (`qrcode.react`), código y vencimiento.
- **Ranking** (`src/features/ranking/`): filtro segmentado Semana/Mes/Siempre, resumen de puesto/puntos/hexágonos y `RankingList` con la fila propia resaltada y fija al pie, por encima de la navegación.
- **Perfil** (`src/features/profile/`): datos reales de `GET /user`, edición de email contra `PUT /user`, selector de tema claro/oscuro/sistema con `useTheme()`, acceso a la instalación de la PWA y cierre de sesión. `AuthContext` no se modificó.
- **Login y registro**: mismo flujo real contra el backend. Se extendió el sistema de diseño con `Field`, `Input`, `PasswordField` y `FormError` en `design-system/components/Form.tsx` (etiqueta, ayuda, error, foco visible y descripción accesible), exportados desde el barrel.
- **PWA**: manifest actualizado (colores, shortcuts, descripción e íconos nuevos acordes a la marca), `viewport-fit=cover`, `theme-color` blanco, service worker con precache del shell (versión v2) y pantallas de instalación y sin conexión adaptadas al nuevo lenguaje visual.
- **Sistema de diseño**: fuentes Geist/Geist Mono, `maplibre-gl.css`, `tokens.css`, `base.css` y `components.css` importados en `main.tsx`; `index.css` quedó sólo con la composición de pantallas y los bloques propios (ofertas, perfil, mapa). Se agregó el worker de MapLibre como asset de Vite para que el mapa funcione en el build.

Datos de muestra aislados: `features/rewards/mock.ts` (promociones y cupón) y `features/ranking/mock.ts` (ranking por período). El mapa/territorio ya usa la API real. Los valores de producto (renta base 1 pt/h, protección 6 h, cupón 15 min y costos por tramos) se usan para la presentación; los endpoints de renta, renovación y robo todavía no existen.

## Datos necesarios
Todo lo de esta sección es **lectura** salvo que se indique **escritura**. Son las capacidades que la pantalla ya muestra con datos de muestra y que la API todavía no provee.

- **Territorio visible**: cubierto por `GET /territories?bbox=...` (resolución 10, dueño, `claimedAt`). La protección y el estado robable se derivan en el cliente a partir de `claimedAt`; falta que el back devuelva protección explícita si se agrega robo.
- **Resumen del jugador**: el contador de hexágonos propios está cubierto por `GET /territories/mine`. Faltan saldo de puntos, renta total por hora y conteos globales de protegidos/robables; por ahora los dos últimos se calculan sobre la vista.
- **Avisos de robo**: todavía no hay endpoint de robos ni de notificaciones; no se muestran avisos reales.
- **Caminata y claim**: cubierto por `watchPosition` + `POST /territories/claim`. Falta el endpoint de renovación y el de robo.
- **Promociones** (`features/rewards/mock.ts`): poder listar las promociones vigentes y disponibles con comercio, beneficio, costo en puntos, distancia al comercio, stock y límite por usuario. La pantalla necesita además saber si al jugador le alcanzan los puntos para indicar el faltante.
- **Cupón** (`features/rewards/mock.ts`): poder canjear una promoción y obtener un cupón con código único, contenido del QR, vencimiento y estado (**escritura**), y poder consultar el cupón emitido mientras está vigente (**lectura**).
- **Ranking** (`features/ranking/mock.ts`): poder obtener el ranking semanal, mensual e histórico con posición, nombre, cantidad de hexágonos y puntos ganados en el período, incluyendo siempre la fila propia aunque quede fuera de las primeras posiciones.
- **Acciones de territorio** (botones de `HexCard`): reclamar un hexágono libre ya está cubierto por `POST /territories/claim`. Renovar y robar siguen pendientes de endpoints en el back; por ahora muestran un aviso de que todavía no están disponibles.
- **Perfil**: ya está cubierto por la API existente (`GET /user` y `PUT /user`); no requiere datos nuevos.
