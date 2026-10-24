# Hexario — Documento de producto

**Versión:** 1.0 · MVP  
**Estado:** definido  
**Última actualización:** 24/10/2026

Este documento fija las reglas de negocio, los parámetros del juego y las
historias de usuario del MVP de Hexario. Los valores son configurables a
nivel de producto, pero esta versión define el comportamiento esperado.

---

## 1. Visión

Hexario es una PWA de territorio urbano. Las personas caminan por la ciudad,
reclaman hexágonos y reciben una renta en puntos por mantenerlos. Otros
jugadores pueden robarles un hexágono si pasan por ahí cuando terminó su
protección. Los puntos se canjean por promociones de comercios.

El juego premia la actividad real: **el que más camina y mantiene su
territorio gana**. No hay compra de puntos ni atajos artificiales.

### Principios

1. **El mundo real manda.** Reclamar, renovar y robar exigen presencia física.
2. **El servidor es la única autoridad.** El cliente muestra y pide; el
   servidor valida y decide.
3. **El que más camina gana.** No hay límite artificial de hexágonos ni
   energía; el límite es el tiempo y la movilidad de cada persona.
4. **El territorio se defiende caminando.** La protección se renueva
   pasando por el hexágono; no se compra.
5. **Los puntos no son dinero.** No se compran, no se transfieren y no se
   convierten a efectivo. Sólo sirven para promociones.
6. **La PWA funciona con la app abierta.** No hay tracking en segundo plano.

---

## 2. Alcance del MVP

### Incluido

- Registro, login, perfil y edición de email.
- Mapa con hexágonos H3 resolución 10.
- Claim, renovación, robo y expiración de hexágonos.
- Renta automática en puntos.
- Puntos y ledger de movimientos.
- Promociones de comercios y cupones con QR/código.
- Ranking semanal, mensual y histórico.
- Notificaciones de robo dentro de la app.
- PWA instalable, offline para el shell y sin tracking en background.
- Panel mínimo de comercio para crear promociones y validar cupones.
- Panel de administración para aprobar comercios/promociones, gestionar
  hexágonos legendarios y moderar.

### Fuera del MVP

- Tracking en segundo plano.
- App nativa en App Store / Play Store.
- Compra de puntos con dinero.
- Transferencia de puntos entre usuarios.
- Chat, alianzas o equipos.
- Temporadas con reset de territorio.
- Pagos automáticos a comercios o liquidación de comisiones.
- Integración con POS de comercios.
- Múltiples ciudades simultáneas con campañas independientes.
- Mapas offline de la ciudad.
- Anti-cheat nativo (detección de mock location, attestation).

---

## 3. Roles

| Rol | Descripción |
|---|---|
| **Visitante** | No tiene sesión. Puede ver login/registro y la landing. |
| **Jugador** | Usuario autenticado que camina, reclama, renueva, roba, gana puntos y canjea promociones. |
| **Comercio** | Cuenta verificada que publica promociones y valida cupones. |
| **Admin** | Equipo de Hexario. Aprueba comercios/promociones, modera, configura parámetros y resuelve incidentes. |
| **Sistema** | Procesos automáticos: renta, expiración, protección, ranking, notificaciones y antifraude. |

---

## 4. Glosario

| Término | Definición |
|---|---|
| **Hexágono / hex** | Celda H3 de resolución 10 (~15.000 m², una manzana y media). |
| **Claim** | Acción de reclamar un hexágono neutral y convertirse en dueño. |
| **Dueño** | Único jugador con la propiedad activa de un hexágono. |
| **Protección / cooldown** | Tiempo durante el cual un hexágono no puede ser robado. |
| **Robable** | Hexágono con dueño, protección vencida y propiedad todavía vigente. |
| **Renovar** | Acción del dueño de pasar por su hexágono para extender protección y expiración. |
| **Expiración** | Momento en que la propiedad termina y el hexágono vuelve a neutral. |
| **Renta** | Puntos que genera un hexágono por hora mientras tiene dueño. |
| **Punto** | Moneda interna, sin valor en dinero, usada sólo para promociones. |
| **Promoción** | Oferta de un comercio canjeable por puntos. |
| **Cupón** | Instancia de una promoción canjeada, con código/QR y vencimiento. |
| **Caminata** | Sesión de movimiento con la app abierta en la que se envían lecturas de ubicación. |
| **Leyenda / legendario** | Hexágono especial, marcado por admin, que renta x3. |

---

## 5. Modelo de dominio

Entidades principales:

- **User**: jugador, comercio o admin.
- **Merchant**: datos del comercio, verificación y ubicación.
- **Hex**: celda H3, estado actual y dueño.
- **HexOwnership**: período de propiedad de un usuario sobre un hex.
- **HexEvent**: historial de claim, renovación, robo y expiración.
- **PointsLedger**: movimientos de puntos (renta, canje, ajuste, devolución).
- **Promotion**: oferta publicada por un comercio.
- **Coupon / Redemption**: cupón emitido y su estado.
- **LocationEvent**: lecturas de ubicación usadas para validar acciones.
- **Notification**: avisos in-app/push.
- **AdminAction**: aprobaciones, bans, ajustes y devoluciones.

Reglas transversales:

- Toda acción de territorio se resuelve en una transacción.
- Nunca se confía en el reloj, los puntos ni el estado que manda el cliente.
- Los puntos se registran en un ledger; no existe un campo de saldo editable.
- Las fechas se guardan y comparan en UTC.
- Las acciones de claim, steal y redeem son idempotentes por request.

---

## 6. Parámetros del juego

| Parámetro | Valor MVP | Nota |
|---|---|---|
| Resolución H3 | **10** | ~15.000 m² por hex. |
| Ciudad inicial | **Rosario, Argentina** | Centro inicial: -60.6393, -32.9468. |
| Protección al reclamar | **6 horas** | `protectionHours` del design system. |
| Protección después de robar | **6 horas** | El nuevo dueño queda protegido. |
| Expiración de propiedad | **7 días** | Desde el claim o la última renovación. |
| Renta base | **1 punto/hora** | Por hexágono, al inicio de la propiedad. |
| Modelo de renta | **Decreciente** | La tasa baja con la antigüedad de la propiedad. |
| Renta mínima | **25% de la base** (0,25 pt/h) | Piso al llegar a la expiración. |
| Multiplicador legendario | **x3** | Se aplica a la tasa vigente. |
| Configurabilidad | **Admin, auditada** | Protección, expiración, renta y multiplicadores. |
| Snapshot por claim | **Sí** | Un cambio de configuración no altera claims existentes. |
| Límite de hexágonos por usuario | **Sin límite** | El límite es físico. |
| Cooldown entre acciones de territorio | **10 segundos** | Claim, renovación o robo. |
| Permanencia mínima | **5 segundos** | Dentro del hex para claim/robo. |
| Precisión máxima de GPS | **50 metros** | Si es peor, se bloquea la acción. |
| Velocidad máxima entre lecturas | **30 km/h** | Permite caminar/bici; bloquea auto. |
| Retención de ubicación | **30 días** | Sólo eventos necesarios. |
| Vigencia del cupón | **15 minutos** | Desde el canje. |
| Radio para canjear | **300 metros** | Distancia al comercio. |
| Límite por usuario por promo | **1 por defecto** | Configurable por comercio. |
| Edad mínima | **18 años** | Por ubicación y promociones. |
| Ranking | Semana / Mes / Siempre | Puntos ganados en el período. |
| Período semanal | Lunes 00:00 a domingo 23:59 | Zona America/Argentina/Buenos_Aires. |
| Período mensual | Mes calendario | Zona America/Argentina/Buenos_Aires. |
| Puntos comprables | **No** | Sólo renta. |
| Vencimiento de puntos | **No vencen en el MVP** | Se revisa en una fase posterior. |
| Precio de promociones | Chica 200–500 / media 800–1.500 / grande 2.000–5.000 | Propone el comercio, aprueba el admin. |
| Pago de comercios | **Gratis en el MVP** | Fase 2: destacados/suscripción. |
| Panel de comercio | **Sí, web separado** | Alta de promos y validación de cupones. |
| Stock al vencer un cupón | **Se repone** | Los puntos no se devuelven. |
| Tracking en background | **No** | PWA con app abierta. |

---

## 7. Reglas de negocio

### 7.1 Hexágonos y propiedad

- **BR-001.** Un hexágono tiene como máximo un dueño activo.
- **BR-002.** Estados posibles: `neutral`, `protegido`, `robable`, `vencido`.
  El estado `robable` también tiene dueño; no es neutral.
- **BR-003.** Sólo se puede reclamar un hexágono `neutral`.
- **BR-004.** Un hexágono `protegido` no puede robarse.
- **BR-005.** Un hexágono `robable` puede robarse en cualquier momento.
- **BR-006.** Cuando la protección vence, el hexágono **sigue siendo del
  dueño** y pasa a `robable`. No se libera automáticamente.
- **BR-007.** Cuando vence la propiedad, el hexágono vuelve a `neutral` y
  deja de generar renta.
- **BR-008.** El dueño puede renovar su hexágono pasando físicamente por él.
  La renovación reinicia la protección a 6 h y la expiración a 7 días.
- **BR-009.** La renovación no cuesta puntos y no interrumpe la renta.
- **BR-010.** Si el hexágono ya expiró, el dueño no puede renovarlo: debe
  reclamarlo como neutral.
- **BR-011.** No hay límite de hexágonos por usuario. Un jugador puede
  reclamar todos los que pueda visitar.
- **BR-012.** Cada claim, renovación o robo tiene un cooldown de 10 s por
  usuario.
- **BR-013.** Si dos usuarios intentan reclamar/robar el mismo hexágono a la
  vez, el servidor resuelve en una transacción: gana la primera acción
  válida; la otra recibe un error de “hexágono no disponible”.

### 7.2 Claim

- **BR-014.** Para reclamar, el usuario debe estar autenticado y dentro del
  hexágono.
- **BR-015.** El servidor calcula la celda H3 a partir de la ubicación
  recibida; nunca confía en el `h3` que manda el cliente.
- **BR-016.** La ubicación debe tener precisión ≤ 50 m.
- **BR-017.** El usuario debe permanecer al menos 5 s dentro del hexágono,
  con al menos dos lecturas válidas separadas por ≥ 5 s.
- **BR-018.** El claim es gratuito.
- **BR-019.** Al reclamar, el usuario se convierte en dueño único, recibe
  6 h de protección y 7 días de propiedad.
- **BR-020.** La renta empieza a contar desde el momento del claim.

### 7.3 Renovación

- **BR-021.** Sólo el dueño puede renovar.
- **BR-022.** La renovación exige estar dentro del hexágono, con precisión
  ≤ 50 m y permanencia mínima de 5 s.
- **BR-023.** La renovación reinicia `protección = ahora + 6 h` y
  `expiración = ahora + 7 días`.
- **BR-024.** La renovación se permite aunque la protección ya haya vencido,
  siempre que la propiedad no haya expirado y el hexágono no haya sido
  robado.
- **BR-025.** Si el dueño renueva justo cuando otro intenta robar, la
  transacción que llegue primero define el resultado.

### 7.4 Robo

- **BR-026.** Cualquier jugador autenticado distinto del dueño puede robar
  un hexágono `robable`.
- **BR-027.** El robo es instantáneo: no hay asedio ni defensa remota.
- **BR-028.** El robo es gratuito.
- **BR-029.** El ladrón debe estar dentro del hexágono, con precisión
  ≤ 50 m y permanencia mínima de 5 s.
- **BR-030.** Al robar, el ladrón se convierte en dueño único y recibe 6 h
  de protección y 7 días de propiedad desde ese momento.
- **BR-031.** El dueño anterior conserva la renta ya acumulada hasta el
  instante del robo y pierde la renta futura.
- **BR-032.** El nuevo dueño empieza a generar renta desde el instante del
  robo, no desde el claim anterior.
- **BR-033.** El dueño anterior recibe un aviso de robo dentro de la app.
- **BR-034.** No se puede robar un hexágono propio.

### 7.5 Expiración

- **BR-035.** La propiedad expira a los 7 días del claim o de la última
  renovación.
- **BR-036.** Al expirar, el hexágono pasa a `neutral`, deja de generar
  renta y puede ser reclamado por cualquiera.
- **BR-037.** La renta ya acreditada no se pierde cuando el hexágono expira.
- **BR-038.** No hay renovación automática. Si el dueño no vuelve a pasar,
  el territorio se libera.

### 7.6 Renta y puntos

- **BR-039.** La única fuente de puntos es la renta de los hexágonos.
- **BR-040.** La renta base es 1 punto por hora por hexágono al inicio de
  la propiedad.
- **BR-041.** Los hexágonos legendarios multiplican por 3 la tasa vigente.
- **BR-042.** La renta se calcula proporcionalmente al tiempo y se acredita
  en puntos enteros; las fracciones se acumulan hasta completar un punto.
- **BR-043.** La renta se acredita automáticamente; no existe un botón de
  “cobrar”.
- **BR-044.** La renta se genera desde el claim hasta el robo o la
  expiración, lo que ocurra primero.
- **BR-044.1.** La tasa de renta **decrece linealmente** desde la base
  (100%) hasta el piso (25%) a lo largo de la ventana de expiración.
  Fórmula: `tasa = base - (base - piso) * (edad / ventana)`.
- **BR-044.2.** Renovar o robar **resetea la tasa a la base** y vuelve a
  empezar la curva de decrecimiento.
- **BR-044.3.** El multiplicador legendario se aplica sobre la tasa
  vigente, no sobre la base.
- **BR-044.4.** Los parámetros de renta, protección, expiración y
  multiplicadores son configurables por admin. Cada claim guarda una copia
  (snapshot) de los valores vigentes para que un cambio no altere claims
  existentes.
- **BR-044.5.** La tarjeta del hexágono muestra la tasa vigente y la renta
  total acumulada.
- **BR-045.** Los puntos no se compran, no se transfieren y no se cambian
  por dinero.
- **BR-046.** Los puntos sólo se gastan en promociones o se ajustan por una
  acción administrativa.
- **BR-047.** El saldo nunca puede ser negativo.
- **BR-048.** Todo movimiento de puntos queda registrado en el ledger con
  fecha, tipo, monto y referencia.
- **BR-049.** Los puntos ya ganados no se pierden si el usuario pierde el
  hexágono.
- **BR-049.1.** Los puntos no vencen en el MVP. No se borran por
  inactividad de la cuenta.

### 7.7 Promociones

- **BR-050.** Un comercio puede publicar promociones con: título,
  descripción, categoría, costo en puntos, stock, límite por usuario,
  vigencia desde/hasta, ubicación y condiciones.
- **BR-050.1.** El comercio propone el costo en puntos y el admin lo
  aprueba. Referencia inicial: promo chica 200–500, media 800–1.500,
  grande 2.000–5.000 puntos. El costo no se convierte a pesos.
- **BR-051.** Toda promoción requiere aprobación de un admin antes de
  publicarse.
- **BR-052.** El comercio puede pausar una promoción; no puede modificar
  retroactivamente cupones ya emitidos.
- **BR-053.** Una promoción es visible si está aprobada, activa, dentro de
  su vigencia y con stock disponible.
- **BR-054.** Para canjear, el usuario debe estar autenticado, tener saldo
  suficiente, estar dentro de los 300 m del comercio y cumplir el límite
  por usuario.
- **BR-055.** Al canjear se descuentan los puntos, se descuenta una unidad
  de stock y se emite un cupón único.
- **BR-056.** El cupón tiene un código alfanumérico único y un QR con ese
  código.
- **BR-057.** El cupón vence a los 15 minutos de emitido.
- **BR-058.** El cupón es de un solo uso y está asociado al usuario que lo
  canjeó.
- **BR-059.** El comercio valida el cupón ingresando el código en su panel;
  el sistema lo marca como usado.
- **BR-060.** Un cupón vencido no se puede usar y no devuelve los puntos.
- **BR-060.1.** Si un cupón vence sin usarse, la unidad de stock se repone
  para otros jugadores. Los puntos del usuario no se devuelven.
- **BR-061.** Si el comercio cancela la promoción o hay un error
  comprobable, un admin puede devolver los puntos y reponer el stock.
- **BR-062.** El stock es global; el límite por usuario es por promoción.
- **BR-063.** Las promociones no tienen valor en dinero para el usuario ni
  son transferibles.
- **BR-064.** El comercio es responsable de las condiciones, stock y
  atención de la promoción.

### 7.8 Ranking

- **BR-065.** Hay tres rankings: semanal, mensual y histórico (“Siempre”).
- **BR-065.1.** La semana corre de lunes 00:00 a domingo 23:59 y el mes es
  el calendario, ambos en `America/Argentina/Buenos_Aires`.
- **BR-065.2.** El ranking muestra como máximo el top 100 y siempre la fila
  propia del usuario.
- **BR-066.** El ranking se ordena por puntos ganados por renta en el
  período, de mayor a menor.
- **BR-067.** Desempate: cantidad de hexágonos actuales, luego username.
- **BR-068.** Los puntos gastados en promociones no reducen los puntos
  ganados para el ranking.
- **BR-069.** El usuario siempre ve su propia fila, resaltada y fija al
  final de la lista.
- **BR-070.** Sólo aparecen usuarios con al menos 1 punto ganado en el
  período.

### 7.9 Notificaciones

- **BR-071.** El dueño recibe un aviso in-app cuando le roban un hexágono.
- **BR-072.** Si la PWA está instalada y el usuario dio permiso, el aviso
  puede enviarse también por push.
- **BR-073.** El aviso incluye: ladrón, lugar aproximado, hora y renta/hora
  perdida.
- **BR-074.** No se envían notificaciones por cada vencimiento de
  protección; el estado se ve en el mapa.
- **BR-075.** El cupón muestra su cuenta regresiva dentro de la app.

### 7.10 Ubicación y anti-cheat

- **BR-076.** La ubicación sólo se usa con la app abierta; no hay tracking
  en segundo plano.
- **BR-077.** Sin permiso de ubicación, el usuario puede explorar el mapa
  pero no puede reclamar, renovar, robar ni canjear.
- **BR-078.** Si la precisión es peor a 50 m, la acción se rechaza con un
  mensaje claro.
- **BR-079.** El servidor exige permanencia de 5 s dentro del hexágono
  para claim/robo.
- **BR-080.** El servidor rechaza desplazamientos a más de 30 km/h entre
  lecturas válidas y los registra como anomalía.
- **BR-081.** El servidor usa su propio reloj; el del cliente no cuenta.
- **BR-082.** El cliente no puede decidir el `h3`, el estado del hexágono,
  el saldo ni la renta.
- **BR-083.** La PWA no puede impedir totalmente el spoofing de ubicación.
  Las anomalías se registran y pueden derivar en revisión manual o ban.
- **BR-084.** Sin conexión no se pueden hacer acciones de territorio; la
  app muestra el estado offline y conserva el shell.
- **BR-085.** Un usuario baneado no puede reclamar, robar, canjear ni
  iniciar sesión.

### 7.11 Cuenta, privacidad y seguridad

- **BR-086.** La edad mínima es 18 años.
- **BR-087.** El username es único y público. El email es único y privado.
- **BR-088.** La contraseña tiene mínimo 8 caracteres y se guarda hasheada.
- **BR-089.** Una persona no puede tener más de una cuenta.
- **BR-090.** El usuario puede editar su email y cerrar sesión.
- **BR-091.** El usuario puede eliminar su cuenta; sus hexágonos pasan a
  neutral, sus cupones se invalidan y sus datos personales se eliminan.
- **BR-092.** La ubicación se guarda sólo para validar acciones y se
  retiene como máximo 30 días.
- **BR-093.** El usuario debe aceptar términos y política de privacidad
  antes de usar la ubicación.
- **BR-094.** No se muestra la ubicación exacta de otros usuarios; sólo el
  estado de los hexágonos.
- **BR-095.** Los comercios deben ser verificados por un admin antes de
  publicar.

### 7.12 Comercios y administración

- **BR-096.** Un comercio tiene nombre, dirección, ubicación, categoría,
  contacto y estado de verificación.
- **BR-097.** El comercio puede crear y pausar promociones, ver canjes y
  validar cupones.
- **BR-098.** El admin puede aprobar/rechazar comercios y promociones,
  pausar campañas, banear usuarios, ajustar puntos y gestionar hexágonos
  legendarios.
- **BR-099.** Los hexágonos legendarios se crean manualmente por admin y
  son visibles con borde dorado.
- **BR-100.** Toda acción administrativa sobre puntos, bans o promociones
  queda auditada.
- **BR-101.** En el MVP los comercios publican promociones sin costo. No
  hay comisión por canje ni pago automático.
- **BR-102.** La monetización posterior será por promociones destacadas o
  suscripción; no por compra de puntos ni por comisión sobre el canje.
- **BR-103.** El comercio accede a un panel web separado de la PWA del
  jugador para crear promociones, ver canjes y validar cupones.
- **BR-104.** El MVP opera en Rosario. Un comercio debe estar dentro de la
  zona de cobertura para poder publicar.
- **BR-105.** Los parámetros de juego (protección, expiración, renta,
  multiplicadores y límites) son configurables por admin y todo cambio
  queda auditado.

---

## 8. Estados del hexágono

| Estado | Dueño | Se puede reclamar | Se puede robar | Genera renta | Cómo se llega |
|---|---|---|---|---|---|
| `neutral` | No | Sí | No | No | Inicio o expiración |
| `protegido` | Sí | No | No | Sí | Claim, robo o renovación |
| `robable` | Sí | No | Sí | Sí | Vence la protección |
| `vencido` | No | Sí | No | No | Vence la propiedad |

### Transiciones

```
neutral ──claim──▶ protegido ──6 h──▶ robable ──robo──▶ protegido (nuevo dueño)
   ▲                    │                  │
   │                    │ renovación       │ renovación
   │                    ▼                  ▼
   │                 protegido          protegido
   │
   └──────────── expiración (7 días) ◀── robable / protegido
```

- La expiración se evalúa siempre antes de cualquier acción.
- Un hexágono vencido no puede renovarse ni robarse: primero hay que
  reclamarlo como neutral.
- Si la protección vence y el dueño no renueva, sigue siendo suyo hasta la
  expiración.

---

## 9. Economía de puntos

### Fuente (faucet)

- Renta de hexágonos: **1 pt/h**; legendario **3 pt/h**.
- No hay bonus de registro, quests, referidos ni compra.

### Sumideros (sinks)

- Canje de promociones.
- Ajustes administrativos por errores o cancelaciones.

### Reglas económicas

- Los puntos no tienen valor en dinero.
- No se pueden transferir entre usuarios.
- El saldo se deriva del ledger, no de un número mutable.
- La inflación se controla con el precio de las promociones, el stock y la
  expiración de los hexágonos.
- Un usuario que no camina deja de ganar y su territorio expira.

### Ejemplo de escala

- 1 hex × 7 días = **168 puntos**.
- 10 hex × 7 días = **1.680 puntos**.
- 1 hex legendario × 7 días = **504 puntos**.
- Una promo chica debería costar **300–500 puntos**.
- Una promo grande debería costar **1.000–2.000 puntos**.

Los precios finales los define el comercio y los aprueba el admin.

---

## 10. Historias de usuario

Prioridades: **P0** = imprescindible para el MVP; **P1** = deseable en el
MVP; **P2** = post-MVP.

### Epic A — Cuenta y acceso

#### US-01 · Registro (P0)
**Como** visitante, **quiero** crear una cuenta con usuario, email y
contraseña, **para** empezar a jugar.

Criterios:
- Username único de 3–20 caracteres.
- Email válido y único.
- Contraseña de al menos 8 caracteres.
- Si el username o el email ya existen, se muestra un error claro.
- Al registrarse, la sesión queda iniciada y se redirige al mapa.

#### US-02 · Login (P0)
**Como** jugador, **quiero** iniciar sesión, **para** recuperar mi cuenta y
mi territorio.

Criterios:
- Login con username y contraseña.
- Credenciales inválidas devuelven error sin revelar si el usuario existe.
- La sesión persiste al recargar la PWA.
- Un token vencido redirige al login.

#### US-03 · Perfil (P0)
**Como** jugador, **quiero** ver mis datos y editar mi email, **para**
mantener mi cuenta al día.

Criterios:
- Muestra username y email.
- Permite editar el email con validación.
- Permite cerrar sesión.
- No permite cambiar el username en el MVP.

#### US-04 · Eliminar cuenta (P1)
**Como** jugador, **quiero** eliminar mi cuenta, **para** borrar mis datos.

Criterios:
- Pide confirmación explícita.
- Los hexágonos pasan a neutral.
- Los cupones activos se invalidan.
- La ubicación y los datos personales se eliminan.
- La sesión se cierra.

#### US-05 · Aceptación de términos (P0)
**Como** visitante, **quiero** aceptar términos y privacidad, **para** usar
la ubicación y el juego con consentimiento.

Criterios:
- Sin aceptación no se habilita la ubicación.
- Se registra fecha y versión de los términos aceptados.

### Epic B — Mapa y territorio

#### US-06 · Ver el mapa (P0)
**Como** jugador, **quiero** ver los hexágonos cerca de mí, **para** saber
dónde puedo reclamar.

Criterios:
- El mapa muestra hexágonos H3 resolución 10.
- Los estados se distinguen por color, borde, rayado o cuenta regresiva.
- Se ve mi ubicación con un marcador.
- Puedo tocar un hexágono y ver su tarjeta.

#### US-07 · Reclamar un hexágono (P0)
**Como** jugador, **quiero** reclamar un hexágono libre, **para** empezar a
ganar renta.

Criterios:
- Sólo si estoy dentro del hexágono y con precisión ≤ 50 m.
- El servidor valida la celda y la permanencia de 5 s.
- El claim es gratis.
- Quedo como dueño único con 6 h de protección y 7 días de propiedad.
- Veo una animación/confirmación y mi protección restante.

#### US-08 · Ver protección (P0)
**Como** jugador, **quiero** saber cuánto falta para que me puedan robar,
**para** decidir si renuevo.

Criterios:
- La tarjeta muestra “Se libera en” con cuenta regresiva.
- El hexágono protegido no se puede robar.
- Al vencer, pasa a “Robable” sin perder al dueño.

#### US-09 · Renovar protección (P0)
**Como** dueño, **quiero** pasar por mi hexágono y renovarlo, **para**
mantenerlo y seguir ganando.

Criterios:
- Sólo el dueño puede renovar.
- Requiere estar dentro del hexágono.
- Reinicia protección a 6 h y expiración a 7 días.
- No cuesta puntos.
- No se puede renovar un hexágono ya expirado.

#### US-10 · Robar un hexágono (P0)
**Como** jugador, **quiero** robar un hexágono ajeno sin protección, **para**
quedarme con su renta.

Criterios:
- Sólo si estoy dentro del hexágono y la protección venció.
- El robo es instantáneo y gratis.
- Quedo como dueño con 6 h de protección y 7 días de propiedad.
- El dueño anterior conserva la renta acumulada hasta el robo.
- Recibo confirmación y el hexágono cambia de color.

#### US-11 · Expiración (P0)
**Como** jugador, **quiero** que mi hexágono expire si no lo mantengo,
**para** que el mapa no quede bloqueado para siempre.

Criterios:
- A los 7 días sin renovación, el hexágono vuelve a neutral.
- Deja de generar renta.
- Cualquier jugador puede reclamarlo.

#### US-12 · Aviso de robo (P0)
**Como** dueño, **quiero** enterarme cuando me roban, **para** decidir si
voy a recuperarlo.

Criterios:
- Veo un aviso in-app al volver a la app.
- El aviso muestra ladrón, lugar aproximado, hora y puntos/hora perdidos.
- Puedo ir al hexágono o descartar el aviso.

### Epic C — Renta y puntos

#### US-13 · Ver mis puntos (P0)
**Como** jugador, **quiero** ver mi saldo y mi renta por hora, **para**
saber cuánto puedo canjear.

Criterios:
- El saldo se actualiza al abrir la app.
- Se muestra la renta/hora total.
- Se muestra la cantidad de hexágonos, protegidos y robables.

#### US-14 · Historial de puntos (P1)
**Como** jugador, **quiero** ver mis movimientos, **para** entender de
dónde salen y a dónde van mis puntos.

Criterios:
- Lista de movimientos con fecha, tipo y monto.
- Tipos: renta, canje, devolución, ajuste.
- Los movimientos no se pueden editar.

#### US-15 · Hexágono legendario (P1)
**Como** jugador, **quiero** encontrar hexágonos legendarios, **para**
obtener más renta.

Criterios:
- Se distinguen con borde dorado y estrella.
- Generan x3 puntos por hora.
- Siguen las mismas reglas de claim, renovación, robo y expiración.

### Epic D — Ranking

#### US-16 · Ver ranking (P0)
**Como** jugador, **quiero** compararme con otros, **para** saber cómo voy.

Criterios:
- Rankings semanal, mensual y siempre.
- Ordenado por puntos ganados en el período.
- Muestra posición, nombre, hexágonos y puntos.
- Mi fila aparece resaltada.

### Epic E — Promociones y canjes

#### US-17 · Ver promociones (P0)
**Como** jugador, **quiero** ver las promociones disponibles, **para**
elegir qué canjear.

Criterios:
- Lista de promociones activas con comercio, beneficio, costo y distancia.
- Se ocultan las vencidas o sin stock.
- Se muestra mi saldo.
- Si no hay promos, veo un estado vacío útil.

#### US-18 · Detalle de promoción (P0)
**Como** jugador, **quiero** ver las condiciones de una promo, **para**
decidir si la canjeo.

Criterios:
- Muestra descripción, costo, stock, vigencia y límite por usuario.
- Indica si estoy dentro del radio de 300 m.
- Indica si me alcanzan los puntos.

#### US-19 · Canjear promoción (P0)
**Como** jugador, **quiero** canjear una promo, **para** obtener el cupón.

Criterios:
- Requiere saldo suficiente, stock, vigencia, límite no alcanzado y estar
  a ≤ 300 m del comercio.
- Al confirmar se descuentan los puntos y se emite el cupón.
- Si algo falla, no se descuentan puntos ni se consume stock.

#### US-20 · Mostrar cupón (P0)
**Como** jugador, **quiero** mostrar el cupón en el comercio, **para** usar
mi promo.

Criterios:
- Muestra QR y código único.
- Muestra cuenta regresiva de 15 minutos.
- Se puede aumentar el brillo de pantalla si el navegador lo permite.
- Si vence, se marca como vencido y no se puede usar.

#### US-21 · Validar cupón (P0)
**Como** comercio, **quiero** validar un código, **para** marcarlo como
usado y evitar fraude.

Criterios:
- El comercio ingresa el código en su panel.
- El sistema verifica que exista, esté activo y no haya vencido.
- Al validar, el cupón pasa a usado.
- Un cupón ya usado no se puede validar dos veces.

#### US-22 · Sin puntos suficientes (P0)
**Como** jugador, **quiero** saber por qué no puedo canjear, **para** no
intentar en vano.

Criterios:
- El botón se deshabilita o muestra el faltante.
- El mensaje indica cuántos puntos faltan.
- No se descuenta nada.

#### US-23 · Fuera del radio (P0)
**Como** jugador, **quiero** saber que debo acercarme al comercio, **para**
poder canjear.

Criterios:
- Si estoy a más de 300 m, el canje se bloquea.
- Se muestra la distancia restante aproximada.
- Al acercarme, se habilita.

### Epic F — PWA y notificaciones

#### US-24 · Instalar la PWA (P0)
**Como** jugador, **quiero** instalar Hexario, **para** abrirlo como app.

Criterios:
- En Android/Chrome aparece el prompt nativo si está disponible.
- En iPhone se muestran instrucciones de Safari.
- La app instalada abre en modo standalone.
- El ícono y el nombre son correctos.

#### US-25 · Modo offline (P0)
**Como** jugador, **quiero** recibir un aviso claro sin conexión, **para**
entender por qué no puedo jugar.

Criterios:
- Se muestra una pantalla de sin conexión.
- No se permiten claims/robos/canjes offline.
- Al volver la conexión, la app se recupera sin perder la sesión.

#### US-26 · Notificación de robo (P1)
**Como** jugador, **quiero** recibir un push cuando me roban, **para**
enterarme sin tener la app abierta.

Criterios:
- Sólo si la PWA está instalada y dio permiso.
- El texto es claro y no incluye datos sensibles innecesarios.
- Si no hay push, el aviso queda in-app.

### Epic G — Comercio

#### US-27 · Alta de comercio (P0)
**Como** comercio, **quiero** registrarme y ser verificado, **para**
publicar promociones.

Criterios:
- Datos: nombre, dirección, ubicación, categoría, contacto.
- El comercio queda pendiente hasta que un admin lo aprueba.
- Sin aprobación no puede publicar.

#### US-28 · Crear promoción (P0)
**Como** comercio, **quiero** crear una promoción, **para** atraer
jugadores.

Criterios:
- Campos: título, descripción, costo en puntos, stock, límite por usuario,
  vigencia y condiciones.
- La promo queda pendiente de aprobación.
- No se publica hasta ser aprobada.

#### US-29 · Pausar promoción (P1)
**Como** comercio, **quiero** pausar una promo, **para** dejar de recibir
canjes.

Criterios:
- La promo deja de mostrarse a nuevos usuarios.
- Los cupones ya emitidos siguen su curso.
- No se puede modificar retroactivamente.

#### US-30 · Ver canjes (P1)
**Como** comercio, **quiero** ver los cupones emitidos y usados, **para**
controlar mis promociones.

Criterios:
- Lista con fecha, promo, estado y código.
- Se puede filtrar por promo y estado.
- No muestra datos personales innecesarios.

### Epic H — Administración

#### US-31 · Aprobar comercios y promociones (P0)
**Como** admin, **quiero** revisar y aprobar, **para** mantener la calidad.

Criterios:
- Lista de pendientes.
- Puedo aprobar o rechazar con motivo.
- El comercio recibe el resultado.

#### US-32 · Gestionar hexágonos legendarios (P1)
**Como** admin, **quiero** marcar hexágonos legendarios, **para** crear
puntos de interés.

Criterios:
- Puedo buscar una celda H3 y marcarla.
- La celda se muestra en dorado.
- Puedo quitarla si no tiene dueño o con un ajuste auditado.

#### US-33 · Banear usuarios (P0)
**Como** admin, **quiero** banear cuentas fraudulentas, **para** proteger
la economía.

Criterios:
- El usuario no puede iniciar sesión ni hacer acciones.
- Sus hexágonos pasan a neutral.
- La acción queda auditada.

#### US-34 · Ajustar puntos (P1)
**Como** admin, **quiero** ajustar puntos con motivo, **para** corregir
errores.

Criterios:
- Requiere motivo y queda en el ledger.
- No puede dejar saldo negativo.
- Queda auditado.

---

## 11. Casos borde

| Caso | Comportamiento esperado |
|---|---|
| GPS denegado | Se puede ver el mapa, pero no reclamar/robar/renovar/canjear. Se explica cómo habilitarlo. |
| Precisión > 50 m | Acción bloqueada con mensaje de “mejorá la señal”. |
| Usuario fuera del hexágono | Acción bloqueada; se indica que se acerque. |
| Hexágono protegido | Robo bloqueado con cuenta regresiva. |
| Hexágono expirado | No se renueva ni se roba; se puede reclamar como neutral. |
| Dos claims simultáneos | Primera transacción válida gana; la otra recibe “no disponible”. |
| Renovación y robo simultáneos | Gana la primera transacción; la otra se rechaza. |
| App en background/cerrada | No se reciben lecturas; no se puede reclamar ni robar. |
| Sin conexión | Se muestra offline; no hay acciones de juego. |
| Cupón vencido | No se puede validar; no se devuelven puntos. |
| Cupón ya usado | Se rechaza la segunda validación. |
| Stock agotado | No se puede canjear; no se descuentan puntos. |
| Puntos insuficientes | Se muestra el faltante; no se descuenta. |
| Comercio a más de 300 m | Canje bloqueado con distancia restante. |
| Comercio cancela promo | Admin puede devolver puntos y reponer stock. |
| Usuario elimina cuenta | Hexágonos a neutral, cupones invalidados, datos personales eliminados. |
| Reloj del cliente alterado | No afecta: el servidor usa su propio tiempo. |
| Ubicación spoofeada | Se registra anomalía; puede derivar en revisión o ban. |
| Multi-cuenta | Se detecta por patrones y se puede banear; no se permite. |

---

## 12. Reglas técnicas de negocio

- **Servidor autoritativo:** el cliente nunca define `h3`, estado, saldo,
  protección ni expiración.
- **Tiempo:** todas las fechas se guardan en UTC y se comparan en el
  servidor.
- **Transacciones:** claim, robo, renovación y canje se ejecutan en una
  transacción con bloqueo del hexágono/promo.
- **Idempotencia:** claim, steal y redeem aceptan una clave de idempotencia
  para no duplicar acciones por reintentos.
- **Ledger:** cada punto que entra o sale genera un movimiento.
- **Expiración:** se evalúa en cada lectura y además con un proceso
  periódico; un hexágono vencido nunca puede usarse.
- **Renta:** se calcula por diferencia de tiempo y se acredita en el
  ledger; no se actualiza con un cron por cada hexágono.
- **Ranking:** se calcula por período a partir de los movimientos de renta.
- **Ubicación:** se guardan sólo las lecturas necesarias para validar
  acciones y detectar anomalías.
- **Errores:** los rechazos de negocio devuelven un mensaje claro y no
  consumen puntos ni cambian estado.

---

## 13. Privacidad, seguridad y legal

- La ubicación es un dato personal. Se usa sólo con consentimiento y con
  la app abierta.
- Se guarda el mínimo necesario: última ubicación, eventos de validación y
  anomalías.
- Retención máxima de ubicación: **30 días**.
- El usuario puede eliminar su cuenta y pedir la eliminación de sus datos.
- No se muestran ubicaciones exactas de otros usuarios.
- Edad mínima: **18 años** en el MVP.
- Los puntos no son dinero ni tienen valor de cambio; no constituyen una
  moneda virtual.
- Los comercios son responsables de las promociones, el stock y el
  cumplimiento de las condiciones.
- Los términos y la política de privacidad deben aceptarse antes de usar
  la ubicación.
- La PWA no puede prevenir por completo el spoofing; si el fraude afecta
  la economía, se evaluará una app nativa con attestation.

---

## 14. Métricas de éxito del MVP

### Activación
- % de usuarios que reclaman su primer hexágono en las primeras 24 h.
- % de usuarios que completan una caminata.

### Retención
- D1, D7 y D30.
- % de usuarios que vuelven a renovar o reclamar.

### Juego
- Hexágonos reclamados por sesión.
- Hexágonos mantenidos por usuario.
- Robos por semana.
- % de hexágonos robables vs. protegidos.
- Renta promedio por usuario activo.

### Promociones
- Promociones vistas por usuario.
- Canjes por semana.
- % de cupones validados.
- Comercios con al menos un canje.
- Costo promedio en puntos por canje.

### Economía
- Puntos emitidos por renta.
- Puntos gastados en promociones.
- Relación emisión/gasto.
- Stock de promociones agotado o sin canjes.

---

## 15. Roadmap posterior al MVP

1. Push notifications completas y centro de notificaciones.
2. Panel self-service de comercios con métricas.
3. Promociones destacadas pagas.
4. App nativa con Capacitor para background y anti-cheat.
5. Temporadas y rankings con premios.
6. Equipos/alianzas y eventos de barrio.
7. Integración con POS para validar cupones automáticamente.
8. Múltiples ciudades.
9. Mapa offline limitado.
10. Compra de puntos o suscripción (evaluar impacto legal y pay-to-win).

---

## 16. Decisiones fijadas en esta versión

| # | Decisión | Valor |
|---|---|---|
| 1 | Resolución de hexágonos | H3 resolución 10 |
| 2 | Ciudad inicial | Rosario |
| 3 | Dueño por hexágono | Único |
| 4 | Claim | Gratis, dentro del hexágono |
| 5 | Protección al reclamar | 6 horas |
| 6 | Protección después de robar | 6 horas |
| 7 | Expiración de propiedad | 7 días |
| 8 | Renovación | Pasando por el hexágono, gratis |
| 9 | Robo | Instantáneo, gratis, después de la protección |
| 10 | Renta | 1 pt/h; legendario x3 |
| 11 | Cobro de renta | Automático |
| 12 | Límite de hexágonos | Sin límite |
| 13 | Fuente de puntos | Sólo renta |
| 14 | Compra de puntos | No |
| 15 | Canje | 300 m del comercio |
| 16 | Vigencia del cupón | 15 minutos |
| 17 | Validación del cupón | Panel del comercio |
| 18 | Ranking | Puntos ganados, semanal/mensual/siempre |
| 19 | Edad mínima | 18 años |
| 20 | Tracking en background | No en el MVP |
| 21 | PWA | Instalable, app abierta |
| 22 | Anti-cheat | Validación de servidor + anomalías |
| 23 | Comercios | Verificados por admin |
| 24 | Promociones | Aprobadas por admin |
| 25 | Pago a comercios | No en el MVP |

---

## 17. Cuestiones abiertas resueltas

Estas eran las decisiones que faltaban. Quedan cerradas para el MVP:

| Cuestión | Decisión | Por qué |
|---|---|---|
| ¿Cuánto dura la protección? | **6 horas** desde claim o robo. | Coincide con `protectionHours` del design system y deja una ventana clara de defensa. |
| ¿Qué pasa al vencer la protección? | El hexágono **sigue del dueño** y pasa a robable. | No se pierde territorio sin que nadie lo robe. |
| ¿Cuándo expira la propiedad? | **7 días** desde claim o última renovación. | Evita territorio eternamente bloqueado sin actividad. |
| ¿Se puede renovar? | Sí, **pasando físicamente por el hexágono**, gratis. | Defiende el territorio caminando, no pagando. |
| ¿La renta se cobra manualmente? | **No: se acredita automáticamente**. | La app no necesita un botón de cobro; abrir la app alcanza para ver el saldo. |
| ¿Hay tope de renta? | El tope es la **expiración del hexágono**. | Es la regla que pediste: mientras sea tuyo, renta; cuando expira, deja de rentar. |
| ¿Claim y robo cuestan puntos? | **No, son gratis**. | Permite que un usuario nuevo participe sin capital inicial. |
| ¿Hay límite de hexágonos? | **No**. | “El que más camina gana”; el límite es físico y el cooldown de 10 s. |
| ¿Se pueden comprar puntos? | **No**. | Evita pay-to-win y riesgos regulatorios. |
| ¿Los puntos vencen? | **No en el MVP**. | Simplifica la economía; se revisa cuando haya más datos. |
| ¿Cuánto vale un punto? | No se convierte a pesos. Las promos se calibran por tramos: **200–500 / 800–1.500 / 2.000–5.000** puntos. | Mantiene los puntos como moneda interna y deja que el comercio/admin calibren. |
| ¿Quién valida el cupón? | El **panel web del comercio**, ingresando el código. | Evita canjes duplicados y da una trazabilidad mínima. |
| ¿Qué pasa si un cupón vence sin usar? | Se repone el stock; **los puntos no se devuelven**. | El comercio no pierde stock y el usuario asume el costo de no usarlo. |
| ¿Qué pasa si el comercio cancela? | Un admin puede **devolver puntos y reponer stock**. | Protege al usuario ante una cancelación injusta. |
| ¿Los comercios pagan? | **No en el MVP**. | Primero se valida el uso; después se cobra por destacado o suscripción. |
| ¿Hay comisión por canje? | **No**. | Mantiene simple la operación y evita liquidaciones. |
| ¿Cómo se valida la ubicación? | Servidor autoritativo, precisión ≤ 50 m, permanencia 5 s y velocidad ≤ 30 km/h. | Reduce fraude básico sin frenar el juego. |
| ¿Se puede hacer trampa con GPS? | La PWA no lo impide totalmente; se registran anomalías y se puede banear. | Es una limitación real de la PWA; se resuelve con app nativa si escala. |
| ¿Edad mínima? | **18 años**. | Ubicación + promociones + interacción con comercios. |
| ¿Qué pasa al eliminar la cuenta? | Hexágonos a neutral, cupones invalidados y datos personales eliminados. | Privacidad y coherencia del mapa. |
| ¿Cuánto se guarda la ubicación? | **30 días** como máximo. | Minimización de datos. |
| ¿Cómo se define el ranking? | Puntos de renta ganados en el período; desempate por hexágonos y username. | Premia la actividad real, no el saldo acumulado. |
| ¿La semana empieza lunes o domingo? | **Lunes 00:00**, zona horaria de Argentina. | Convención local clara. |
| ¿Hay temporadas? | **No en el MVP**. | El territorio y los puntos son continuos. |
| ¿Hay equipos/chat? | **No en el MVP**. | Fuera de alcance; primero validar el loop individual. |
| ¿Dónde se lanza? | **Rosario, Argentina**. | El design system ya usa Rosario como referencia y permite lanzar denso. |
| ¿App nativa? | **No en el MVP**; PWA con app abierta. | Menor costo y ya está implementada. |
| ¿Qué pasa si dos jugadores actúan a la vez? | Gana la primera transacción válida; la otra recibe “no disponible”. | Consistencia y una sola fuente de verdad. |
| ¿Los puntos gastados bajan el ranking? | **No**. El ranking mide puntos ganados, no saldo. | No castiga canjear promociones. |
| ¿Los hexágonos legendarios cómo se crean? | Sólo por admin, y rentan x3. | Control editorial de los puntos de interés. |

---

## 18. Pendientes de implementación (no de producto)

Estos puntos no cambian las reglas de negocio; son tareas técnicas para
cuando se implemente el backend del juego:

- Hacer cumplir email único a nivel base de datos.
- Implementar el ledger de puntos y las transacciones de claim/steal.
- Implementar el panel de comercio y la validación de cupones.
- Implementar el proceso de expiración y el cálculo de renta.
- Implementar ranking por período.
- Implementar push notifications en PWA instalada.
- Implementar el registro de anomalías y el panel de moderación.
- Configurar tiles de OpenFreeMap y atribución en el mapa.
- Definir la política de privacidad y los términos legales.
- Evaluar Capacitor si el background o el anti-cheat se vuelven críticos.


---

