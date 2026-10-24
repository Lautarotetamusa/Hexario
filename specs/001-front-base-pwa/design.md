# Design: base visual de la PWA

Estado: en revisión

## Historia
Como jugador, quiero abrir Hexario y moverme entre el mapa, mis canjes, el ranking y mi perfil con la identidad del sistema de diseño, para caminar, sumar puntos y canjear promociones desde el teléfono.

## Qué se construyó
- **Shell mobile-first**: rutas `/` (mapa), `/canjes`, `/ranking`, `/perfil` e `/instalar`; `BottomNav` (Mapa, Canjes, Ranking, Perfil), contenedor `.hx-screen` para las pantallas de contenido, áreas seguras y una columna centrada de 560 px en escritorio. El mapa va a pantalla completa y no comparte layout con el resto.
- **Mapa** (`src/features/map/`): MapLibre con OpenFreeMap (sin API key), configuración centralizada en `mapConfig.ts`, centro en Rosario y zoom 15,5, padding inferior para que el marcador no quede tapado por la hoja. Hexágonos H3 resolución 10 de muestra con estados libre, propio, rival, protegido, robable y legendario; marcador de ubicación; botón de centrar; selección con halo. Tocar un hexágono abre su `HexCard` en el `BottomSheet`, que además muestra el saldo, la renta por hora, los contadores y el botón de caminata. El aviso de robo de muestra se puede recuperar (lleva al hexágono) o descartar. Atribución de OpenStreetMap/OpenFreeMap visible sobre el mapa.
- **Canjes** (`src/features/rewards/`): saldo, listado de promociones con comercio, beneficio, costo, distancia y disponibilidad, y detalle de cupón con QR real (`qrcode.react`), código y vencimiento.
- **Ranking** (`src/features/ranking/`): filtro segmentado Semana/Mes/Siempre, resumen de puesto/puntos/hexágonos y `RankingList` con la fila propia resaltada y fija al pie, por encima de la navegación.
- **Perfil** (`src/features/profile/`): datos reales de `GET /user`, edición de email contra `PUT /user`, selector de tema claro/oscuro/sistema con `useTheme()`, acceso a la instalación de la PWA y cierre de sesión. `AuthContext` no se modificó.
- **Login y registro**: mismo flujo real contra el backend. Se extendió el sistema de diseño con `Field`, `Input`, `PasswordField` y `FormError` en `design-system/components/Form.tsx` (etiqueta, ayuda, error, foco visible y descripción accesible), exportados desde el barrel.
- **PWA**: manifest actualizado (colores, shortcuts, descripción e íconos nuevos acordes a la marca), `viewport-fit=cover`, `theme-color` blanco, service worker con precache del shell (versión v2) y pantallas de instalación y sin conexión adaptadas al nuevo lenguaje visual.
- **Sistema de diseño**: fuentes Geist/Geist Mono, `maplibre-gl.css`, `tokens.css`, `base.css` y `components.css` importados en `main.tsx`; `index.css` quedó sólo con la composición de pantallas y los bloques propios (ofertas, perfil, mapa). Se agregó el worker de MapLibre como asset de Vite para que el mapa funcione en el build.

Datos de muestra aislados: `features/map/mock.ts` (hexágonos, renta, puntos, aviso de robo), `features/rewards/mock.ts` (promociones y cupón) y `features/ranking/mock.ts` (ranking por período). Los valores siguen los parámetros del producto: renta base 1 pt/h, legendario x3, protección 6 h, cupón 15 min y costos de promoción por tramos.

## Datos necesarios
Todo lo de esta sección es **lectura** salvo que se indique **escritura**. Son las capacidades que la pantalla ya muestra con datos de muestra y que la API todavía no provee.

- **Territorio visible** (`features/map/mock.ts`): poder obtener los hexágonos H3 resolución 10 de la zona que se está mirando, con dueño (propio, rival o libre), estado (protegido, robable o vencido), tiempo de protección restante, si es legendario, renta por hora, nombre de lugar aproximado y distancia desde la ubicación del jugador.
- **Resumen del jugador** (`features/map/mock.ts`): poder obtener saldo de puntos, renta total por hora, cantidad de hexágonos propios, cantidad de protegidos y cantidad de robables.
- **Avisos de robo** (`features/map/mock.ts`): poder obtener los avisos de robo no descartados con nombre y color del ladrón, lugar aproximado, momento y renta por hora perdida; y poder marcarlos como vistos o descartados (**escritura**).
- **Caminata** (`features/map/MapPage.tsx`): poder iniciar y finalizar una caminata y enviar lecturas de ubicación mientras la app está abierta (**escritura**). En esta entrega el botón sólo confirma visualmente; no hay lógica de juego.
- **Promociones** (`features/rewards/mock.ts`): poder listar las promociones vigentes y disponibles con comercio, beneficio, costo en puntos, distancia al comercio, stock y límite por usuario. La pantalla necesita además saber si al jugador le alcanzan los puntos para indicar el faltante.
- **Cupón** (`features/rewards/mock.ts`): poder canjear una promoción y obtener un cupón con código único, contenido del QR, vencimiento y estado (**escritura**), y poder consultar el cupón emitido mientras está vigente (**lectura**).
- **Ranking** (`features/ranking/mock.ts`): poder obtener el ranking semanal, mensual e histórico con posición, nombre, cantidad de hexágonos y puntos ganados en el período, incluyendo siempre la fila propia aunque quede fuera de las primeras posiciones.
- **Acciones de territorio** (botones de `HexCard`): poder reclamar un hexágono libre, renovar uno propio y robar uno robable, recibiendo el hexágono actualizado y la protección resultante (**escritura**). En esta entrega las acciones son sólo confirmación visual; no hay lógica de claim/steal.
- **Perfil**: ya está cubierto por la API existente (`GET /user` y `PUT /user`); no requiere datos nuevos.
