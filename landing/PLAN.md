# Landing de Hexario — contenido y plan

Fuente de verdad del contenido: [`PRODUCT.md`](../PRODUCT.md). Toda cifra que
aparece en la landing sale de ahí (sección 6, parámetros del MVP).

## Objetivo

Que una persona de Rosario entienda en 10 segundos qué es Hexario, que
entienda la regla de oro (caminás → reclamás → cobrás renta → te pueden robar)
y que toque **Empezar a jugar**. Objetivo secundario: que un comercio deje sus
datos para publicar promociones.

## Tono

Rioplatense, voseo, frases cortas, verbo primero. Sin emojis, sin
ilustraciones, sin degradados (reglas del sistema de diseño). El color aparece
sólo para jugadores, hitos legendarios y estados de territorio: la landing es
blanca/negra/gris y el mapa es lo único que tiene color.

## Técnica

- App Vite + React + TS independiente en `landing/`.
- Consume el sistema de diseño de `app/src/design-system` vía alias de Vite
  (`@ds`) — no se copia: una sola fuente.
- Los componentes que se muestran son los reales (`HexCard`, `TheftNotice`,
  `Coupon`, `RankingList`, `Segmented`, `StatRow`, `Chip`, `Button`), así la
  landing enseña la app tal cual es.
- El mapa del hero es un SVG generado con `h3-js` sobre celdas H3 reales de
  Rosario (resolución 10, centro -60.6393, -32.9468). Sin MapLibre ni key de
  teselas: carga instantánea.
- La URL de la app sale de `VITE_APP_URL` (default `http://localhost:8080`).
- Claro / oscuro automático por `prefers-color-scheme` (tokens del DS).
- Respeta `prefers-reduced-motion`.

## Secciones

### 0. Barra superior
Marca (`HexarioMark` + "Hexario") · Cómo se juega · Puntos · Comercios ·
Preguntas · botón **Jugar**.

### 1. Hero
- Kicker: `ROSARIO · A PIE`
- Título: **Caminá tu ciudad. Quedate con ella.**
- Bajada: Reclamá hexágonos pasando por ellos, cobrá renta en puntos mientras
  sean tuyos y canjealos en comercios del barrio.
- CTA: **Empezar a jugar** · secundario: **Cómo se juega**
- Nota: Sin descargas. Se instala desde el navegador.
- Visual: mosaico de hexágonos de Rosario con territorio propio (menta),
  rivales (celeste, coral, lavanda), un robable rayado, un legendario dorado,
  y una `HexCard` flotante en estado *Robable* ("Juli · Pichincha").
  Un hexágono se "captura" en loop (anillo que se expande).

### 2. Cifras
`StatRow`: **15.000 m²** por hexágono · **6 h** de protección · **7 días**
para volver.

### 3. Cómo se juega (`#como-se-juega`)
Tres pasos, cada uno con su `HexCard` real:
1. **Reclamá.** Pasá por un hexágono libre y quedate 5 segundos. Es tuyo, y
   nadie te lo puede sacar por 6 horas. → `HexCard state="free"`
2. **Cobrá renta.** Cada hexágono te da 1 punto por hora, solo. No hay botón
   de cobrar. La renta baja con los días: volver a pasar la reinicia.
   → `HexCard state="mine"`
3. **Defendelo.** Cuando vence la protección, cualquiera que pase te lo puede
   robar. Si en 7 días no volvés, se libera. → `HexCard state="stealable"`

### 4. La vida de un hexágono
Línea de tiempo con `Chip`s: **Libre** → **Protegido 6 h** → **Robable** →
**Libre otra vez a los 7 días**. Debajo: "Los legendarios rentan x3" con chip
dorado.

### 5. Te van a robar (y está bien)
- Título: **Te sacaron la cuadra. Andá a buscarla.**
- Texto: Si alguien pasa por tu hexágono cuando ya no está protegido, es suyo.
  Te avisamos al toque, con quién fue y cuánta renta perdés. Los puntos que ya
  cobraste no se tocan.
- Visual: `TheftNotice` real ("Juli te sacó la cuadra de Pichincha").

### 6. Puntos que valen algo (`#puntos`)
- Título: **Tus pasos se canjean en el barrio.**
- Texto: Los puntos se ganan sólo caminando. No se compran, no se
  transfieren y no son plata: se canjean por promos de comercios adheridos.
  Canjeás estando cerca, mostrás el QR en el mostrador y listo.
- Bullets: Cupón de un solo uso · Vence a los 15 minutos · A menos de 300 m
  del local.
- Visual: `Coupon` real con QR ("Café Pichincha · 2x1 en cortados · 400 pts").

### 7. Ranking
- Título: **Gana el que más camina.**
- Texto: Ranking semanal, mensual y de siempre. Cuenta lo que ganaste, no lo
  que gastaste.
- Visual: `Segmented` (Semana / Mes / Siempre) + `RankingList` con tu fila
  resaltada al final.

### 8. Reglas claras
Cuatro principios, en grilla:
- **El mundo real manda.** Reclamar, renovar y robar exigen estar ahí.
- **Sin atajos.** No hay puntos pagos ni límite artificial. El límite son tus
  piernas.
- **Sin rastreo de fondo.** La ubicación se usa sólo con la app abierta y se
  borra a los 30 días.
- **Nadie ve dónde estás.** Los demás ven hexágonos, no personas.

### 9. Comercios (`#comercios`)
- Título: **¿Tenés un local? Que la gente camine hasta tu puerta.**
- Texto: Publicás promos, fijás el stock y validás cupones desde un panel
  web. Durante el lanzamiento es gratis.
- CTA: **Sumar mi comercio** (mailto).

### 10. Preguntas (`#preguntas`)
`<details>` nativos:
- ¿Tengo que descargar algo? — No. Hexario es una app web: la abrís en el
  navegador y la podés instalar en la pantalla de inicio.
- ¿Puedo jugar en auto o en colectivo? — No. Arriba de 30 km/h las acciones
  no cuentan. Caminando o en bici, sí.
- ¿Cuántos hexágonos puedo tener? — Todos los que puedas recorrer. No hay
  límite.
- ¿Qué pasa si me roban? — Perdés la renta que venía, no la que ya cobraste.
  Podés ir a recuperarlo apenas venza su protección.
- ¿Los puntos vencen? — No.
- ¿Usa mi ubicación todo el tiempo? — No. Sólo con la app abierta, y sólo
  para validar que estás donde decís.
- ¿Quién puede jugar? — Mayores de 18.

### 11. Cierre
**Tu primera cuadra está a la vuelta.** · botón **Empezar a jugar**.

### 12. Pie
Marca · "Hecho en Rosario" · Mayores de 18 · Términos · Privacidad.

## Estructura de código

```
landing/
  index.html
  package.json, tsconfig.json, vite.config.ts   (alias @ds → ../app/src/design-system)
  src/
    main.tsx            estilos del DS + Landing
    Landing.tsx         compone las secciones
    content.ts          copy y datos de ejemplo (jugadores, ranking, cupón)
    config.ts           APP_URL, MERCHANT_MAIL
    hexMosaic.ts        celdas H3 → polígonos SVG (puro, testeable)
    sections/           una sección por archivo
    landing.css         layout de la landing, sólo con tokens --hx-*
```
