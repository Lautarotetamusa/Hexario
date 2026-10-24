# SRS — Conquista territorial por hexágonos en Rosario

**Versión:** 0.1 — especificación propuesta para revisión e implementación del MVP.  
**Fecha:** 24 de octubre de 2026.  
**Nombre del producto:** pendiente.  
**Formato:** especificación de requisitos de software, con responsabilidades separadas de frontend y backend.  
**Contexto:** documento independiente para la nueva idea de conquista territorial; no describe ni modifica la aplicación existente en este repositorio.

## 1. Objetivo del producto

Crear un juego urbano para dispositivos móviles en el que Rosario esté representada mediante hexágonos. Las personas se desplazan hasta zonas habilitadas, conquistan territorios y conservan su control hasta que otra persona los conquista o se cumple una condición de vencimiento. El control territorial genera participación en una renta de puntos, canjeables por beneficios de comercios adheridos.

El ciclo principal es:

**Explorar el mapa → llegar a una zona habilitada → conquistar → conservar territorios → acumular renta → recibir puntos disponibles → canjear un beneficio.**

El valor de la cantidad de territorios debe ser visible. La economía debe limitar la emisión de puntos y distinguir claramente una estimación de renta de un saldo efectivamente disponible.

### 1.1 Objetivos verificables

- Permitir conocer quién controla cada territorio visible y cuándo puede volver a conquistarse.
- Permitir una conquista presencial cuyo resultado sea decidido y persistido por el servidor.
- Impedir que dos usuarios sean dueños simultáneos del mismo territorio.
- Mostrar territorios propios, historial de conquistas y contribución a la renta.
- Registrar y liquidar puntos sin duplicaciones, incluso ante reintentos o reinicios.
- Permitir reservar y canjear un beneficio en un comercio autorizado mediante un comprobante de un solo uso.
- Mantener el costo comprometido de recompensas dentro del presupuesto respaldado de cada temporada.

## 2. Estado de las decisiones

### 2.1 Base expresada por el equipo

1. El mapa representa Rosario mediante hexágonos.
2. Cada territorio tiene como máximo un dueño activo.
3. Una persona puede conquistar territorios.
4. Después de conquistar, existe un cooldown durante el cual otra persona no puede conquistar ese territorio.
5. Los territorios generan renta en puntos para su dueño.
6. Los puntos pueden canjearse en locales adheridos.
7. La cantidad de territorios debe tener valor dentro del juego.
8. Los números de balance se ajustarán después.

### 2.2 Supuestos propuestos para hacer implementable este SRS

Estas decisiones no se consideran aprobadas por haber sido documentadas. Definen un comportamiento de referencia para que frontend y backend puedan acordar contratos.

| ID | Decisión propuesta | Motivo |
|---|---|---|
| D-01 | MVP web móvil con geolocalización en primer plano | Permite demostrar la experiencia sin depender de seguimiento permanente en segundo plano. |
| D-02 | Conquista por presencia sostenida y muestras recientes de ubicación | Evita aceptar un único check-in como evidencia suficiente. No demuestra por sí sola actividad física ni elimina GPS falso. |
| D-03 | El primer intento válido confirmado transaccionalmente gana | Resuelve concurrencia de manera determinista sin depender del reloj del teléfono. |
| D-04 | Renta mediante reparto de un fondo por temporada, ponderado por control acumulado | Acota la emisión total y permite rendimientos decrecientes por cantidad. |
| D-05 | La renta estimada se liquida al cierre de temporada; solo entonces pasa a saldo disponible | Evita gastar una participación variable antes de conocer el reparto definitivo. |
| D-06 | El control vence si no se renueva presencialmente | Libera territorios abandonados. |
| D-07 | La renovación extiende la tenencia, pero no reinicia la protección | Evita protección perpetua por renovaciones repetidas. |
| D-08 | Al terminar una temporada se libera la propiedad; el saldo liquidado y el historial permanecen | Facilita nuevos comienzos y simplifica el alcance inicial. |
| D-09 | No hay transferencias entre usuarios ni conversión de puntos a dinero | El MVP se limita a beneficios del catálogo. |
| D-10 | Las fotos no son obligatorias en el flujo central | Mantiene el foco en conquista y reduce fricción. |

**Dependencia de producto:** si se necesita canjear renta durante una temporada, debe revisarse D-05 y definirse un mecanismo de liquidación por períodos cerrados con presupuestos separados. No se debe habilitar gasto de estimaciones cambiantes.

## 3. Alcance y prioridades

### 3.1 P0 — MVP completo

- Autenticación, perfil público mínimo y permisos de ubicación.
- Mapa de hexágonos, estados territoriales y detalle de un territorio.
- Inicio y confirmación de conquista con validación de presencia.
- Protección temporal, transferencia de propiedad, renovación y vencimiento.
- Panel de territorios propios y actividad reciente.
- Temporadas, configuración económica, registro de control y liquidación.
- Billetera de puntos con movimientos trazables.
- Catálogo de beneficios, reserva, comprobante y confirmación de canje.
- Panel mínimo para comercios y administración.
- Prevención de duplicaciones, control de acceso, auditoría y manejo de errores.
- Escenario de demostración reproducible e identificado como simulación.

### 3.2 P1 — Después del circuito principal

- Ranking territorial por temporada.
- Notificaciones internas persistentes por pérdida de territorio y liquidación.
- Misiones de exploración, logros y estadísticas ampliadas.
- Mejoras de evaluación de recorridos y revisión de anomalías.
- Actualización mediante eventos en tiempo real, si el MVP usa consultas periódicas.

### 3.3 Fuera de alcance del MVP

- Equipos, alianzas, guerras entre grupos o copropiedad de un hexágono.
- Compra de puntos, compra de territorios, subastas y defensas pagas.
- Transferencias de saldo, criptomonedas y retiro de dinero.
- Realidad aumentada, reconocimiento de imágenes y chat entre jugadores.
- Seguimiento continuo en segundo plano y publicación de recorridos personales.
- Promesas de rutas seguras o clasificación automática de seguridad de barrios.
- Facturación automática de sponsors y pagos automáticos a comercios.

## 4. Actores y permisos

| Actor | Acciones permitidas |
|---|---|
| Visitante | Ver mapa público y reglas; acceder al inicio de sesión. No ve ubicaciones de jugadores ni información privada. |
| Jugador | Conquistar, renovar, consultar territorios propios, estimaciones, saldo, historial y canjear beneficios. |
| Operador de comercio | Consultar beneficios de sus comercios, validar y confirmar canjes autorizados, consultar su historial. |
| Administrador | Gestionar territorios habilitados, temporadas, reglas, comercios, beneficios, presupuestos y revisión de incidencias. |
| Procesos del sistema | Vencer propiedades y reservas, cerrar temporadas, liquidar puntos y reconciliar consistencia. |

Un usuario puede tener más de un rol. Toda autorización se valida en backend; ocultar un botón no constituye control de acceso.

## 5. Glosario

| Término | Definición |
|---|---|
| Hexágono / territorio | Celda identificable de la grilla. Puede dibujarse aunque no esté habilitada para jugar. |
| Área válida de conquista | Parte autorizada y accesible del territorio donde puede realizarse la validación presencial. |
| Conquista | Operación que asigna la propiedad de un territorio a un jugador. |
| Protección / cooldown | Intervalo posterior a una conquista durante el cual otro jugador no puede tomar el territorio. |
| Tenencia | Intervalo de propiedad de un jugador, con comienzo y fin trazables. |
| Renovación | Validación presencial del dueño que extiende el vencimiento de su tenencia sin reiniciar protección. |
| Poder productivo | Peso económico derivado de la cantidad de territorios productivos controlados. |
| Control acumulado | Integral del poder productivo durante el tiempo de control en una temporada. |
| Renta estimada | Proyección informativa del reparto; no es saldo disponible ni una tasa fija garantizada. |
| Puntos disponibles | Saldo liquidado que puede utilizarse para reservar beneficios. |
| Puntos retenidos | Saldo apartado para un canje pendiente; no puede gastarse en otro. |
| Temporada | Período con reglas versionadas, territorios habilitados y fondo de puntos definidos. |

## 6. Reglas de negocio

### 6.1 Territorio y conquista

| ID | Regla |
|---|---|
| RN-01 | Cada hexágono debe tener un identificador estable, geometría válida y pertenencia explícita al área de juego de Rosario. |
| RN-02 | La cobertura visual no habilita una conquista. Solo se puede jugar dentro de las áreas autorizadas de una celda habilitada. |
| RN-03 | Nunca puede existir más de una tenencia activa por territorio. |
| RN-04 | Un territorio libre puede conquistarse si la temporada está activa y la validación de presencia resulta válida. |
| RN-05 | Un territorio de otro jugador puede conquistarse solamente si terminó su protección y sigue habilitado. |
| RN-06 | La elegibilidad se comprueba al iniciar el intento y nuevamente al confirmarlo. Iniciar no reserva el territorio. |
| RN-07 | Una conquista exitosa registra el nuevo dueño, el comienzo de tenencia, el fin de protección, el vencimiento y la versión territorial. |
| RN-08 | Si había un dueño anterior, su intervalo productivo termina exactamente cuando comienza el del nuevo dueño. |
| RN-09 | El dueño actual no puede conquistarse a sí mismo para reiniciar el cooldown. Debe usar el flujo de renovación cuando corresponda. |
| RN-10 | Una renovación válida extiende el vencimiento dentro de los límites configurados; no altera el inicio original de tenencia ni reinicia la protección. |
| RN-11 | Si la propiedad vence, el territorio queda libre. Deja de producir en el instante de vencimiento aunque el proceso de limpieza se ejecute después. |
| RN-12 | Si se deshabilita un territorio, se cierra su tenencia, se detiene su producción y se conserva el historial generado. Se registra un motivo administrativo. |
| RN-13 | Una pérdida de territorio no elimina puntos ya liquidados ni control acumulado legítimo anterior. |
| RN-14 | El reloj del servidor es la referencia para protección, vencimientos y temporadas. |
| RN-15 | Los intervalos se interpretan como [inicio, fin): al alcanzar exactamente el fin de protección, el territorio ya es disputable. |

### 6.2 Concurrencia e idempotencia

- **RN-16:** si dos jugadores intentan conquistar el mismo territorio, solo puede confirmarse una operación sobre la versión vigente. La otra recibe un conflicto y el estado actualizado.
- **RN-17:** repetir una solicitud exitosa con la misma clave de idempotencia devuelve el resultado original sin crear otra conquista, emisión o canje.
- **RN-18:** reutilizar una clave de idempotencia con un contenido distinto debe rechazarse.
- **RN-19:** una respuesta perdida no habilita repetir efectos. El cliente debe poder recuperar el resultado de la operación original.
- **RN-20:** no se aceptan conquistas offline ni se aplican retroactivamente cuando vuelve la conexión.

### 6.3 Renta territorial propuesta

Para cada temporada se define un fondo `B` de puntos emitibles. Cada usuario tiene un poder productivo `W(n)` según su cantidad `n` de territorios productivos. La curva debe crecer con `n`, con incrementos no crecientes.

```text
A_usuario = suma de W(n) × duración de cada intervalo con n constante
A_total   = suma de A_usuario de todos los participantes elegibles
renta_usuario = B × A_usuario / A_total
```

Los valores de `B`, duración y curva quedan pendientes de balance. La fórmula es la propuesta D-04, no una decisión confirmada del equipo.

| ID | Regla económica |
|---|---|
| RN-21 | La cantidad de territorios y el poder productivo deben mostrarse por separado. Todos los territorios controlados cuentan territorialmente. |
| RN-22 | Para el mismo tiempo y condiciones, más territorios productivos generan más control acumulado. La participación final también depende del resto de los jugadores. |
| RN-23 | El fondo y la curva quedan versionados e inmutables al abrir la temporada. Cambios de balance se aplican a temporadas futuras. |
| RN-24 | Solo cuentan intervalos dentro de una temporada activa y en territorios habilitados. Protección no impide producción. |
| RN-25 | El sistema registra cambios de cantidad de territorios de forma atómica; dos conquistas del mismo usuario no pueden producir pesos inconsistentes. |
| RN-26 | La estimación no se puede canjear. La liquidación definitiva genera movimientos de crédito únicos en la billetera. |
| RN-27 | Si no existe control acumulado elegible, no se emiten puntos. El fondo queda sin distribuir y requiere decisión explícita para uso futuro. |
| RN-28 | El cálculo usa precisión decimal o enteros escalados. El redondeo nunca puede hacer que la emisión supere el fondo. |
| RN-29 | Los residuos se distribuyen por mayor resto fraccional; los empates se resuelven por identificador estable de usuario. La regla debe ser reproducible. |
| RN-30 | Un proceso de liquidación reintentado no puede duplicar créditos. Un fallo parcial debe poder retomarse. |
| RN-31 | Cada fondo debe tener respaldo registrado: responsable, beneficio o presupuesto comprometido, capacidad de canje y vigencia. Emitir pocos puntos no garantiza por sí solo solvencia. |
| RN-32 | Para lanzar una temporada debe existir catálogo compatible y capacidad respaldada para los puntos emitibles más el saldo pendiente de temporadas anteriores. Si el respaldo es insuficiente, no se activa la temporada. |
| RN-33 | El MVP no vence puntos disponibles automáticamente. No puede retirarse respaldo necesario para cumplir saldos existentes. Un futuro vencimiento requiere reglas explícitas y comunicación previa. |

**Distinción obligatoria:** control acumulado, estimación de renta y puntos disponibles son magnitudes diferentes. No deben representarse como una única cifra llamada «saldo».

### 6.4 Canjes

- **RN-34:** cada beneficio tiene precio en puntos, stock, comercio o sucursales habilitadas, vigencia y condiciones visibles.
- **RN-35:** reservar un beneficio retiene puntos y stock de manera atómica. No los consume definitivamente todavía.
- **RN-36:** confirmar el canje consume la reserva de stock y debita los puntos retenidos una sola vez.
- **RN-37:** cancelar o vencer una reserva libera puntos y stock una sola vez. La confirmación concurrente con cancelación o vencimiento tiene un único resultado definitivo.
- **RN-38:** no puede confirmarse un comprobante vencido, cancelado, usado o perteneciente a otro comercio.
- **RN-39:** los cambios de precio o condiciones se aplican a nuevas reservas. Una reserva mantiene la versión aceptada por el usuario.
- **RN-40:** no se permiten saldos disponibles ni existencias negativas.
- **RN-41:** si se retira un beneficio sin poder cumplir reservas vigentes, un administrador debe cancelarlas con motivo, liberar sus puntos y notificar a los afectados.

## 7. Estados y transiciones

### 7.1 Estado persistido de un territorio

| Estado | Significado | Transiciones |
|---|---|---|
| `DISABLED` | Celda visible sin juego habilitado | Administrador habilita → `AVAILABLE`. |
| `AVAILABLE` | Sin dueño efectivo | Conquista válida → `OWNED_PROTECTED`; deshabilitación → `DISABLED`. |
| `OWNED_PROTECTED` | Tiene dueño y protección vigente | Fin de protección → `OWNED_CONTESTABLE`; vencimiento → `AVAILABLE`; deshabilitación → `DISABLED`. |
| `OWNED_CONTESTABLE` | Tiene dueño, produce y puede ser conquistado | Conquista rival → `OWNED_PROTECTED`; renovación → conserva estado y extiende tenencia; vencimiento → `AVAILABLE`. |

`MINE` no es un estado persistido: es una relación entre el dueño y quien consulta. Una celda propia puede estar protegida o disputable.

El backend debe calcular el estado efectivo con la hora actual aun cuando un job todavía no haya materializado un vencimiento. Consultas y mutaciones deben coincidir sobre ese estado efectivo.

### 7.2 Intento de conquista

`PENDING → SUCCEEDED | REJECTED | EXPIRED | CANCELLED`

Un intento tiene un usuario, un territorio, una temporada, un desafío de servidor y una caducidad. Las causas de rechazo se almacenan mediante códigos; las coordenadas no se devuelven en errores públicos.

### 7.3 Temporada

`DRAFT → ACTIVE → CLOSING → SETTLED`

En `CLOSING` no se aceptan nuevas conquistas ni renovación para esa temporada. Se recortan los intervalos al cierre, se resuelven revisiones pendientes y se liquida. Al pasar a `SETTLED`, la propiedad de esa temporada queda cerrada y los créditos se publican una sola vez.

### 7.4 Reserva de beneficio

`RESERVED → REDEEMED | CANCELLED | EXPIRED`

Los estados finales son excluyentes. No existe una transición automática desde `REDEEMED` a otro estado; una corrección administrativa se realiza con un movimiento compensatorio auditado.

## 8. Requisitos de frontend

### 8.1 Acceso, mapa y detalle

| ID | Prioridad | Requisito y criterio de aceptación |
|---|---|---|
| FE-01 | P0 | Mostrar una introducción que explique conquista, protección, renta variable y canje. Debe indicar que el control territorial es parte de un juego y no otorga derechos sobre el espacio físico. |
| FE-02 | P0 | Implementar inicio/cierre de sesión y recuperación de sesión expirada. Una expiración durante una operación no debe mostrar éxito ni perder la referencia necesaria para consultar su resultado. |
| FE-03 | P0 | Solicitar ubicación en contexto, explicar su uso y distinguir permiso denegado, ubicación no disponible, baja precisión y muestra vencida. Sin permiso se puede explorar pero no conquistar. |
| FE-04 | P0 | Mostrar un mapa centrado inicialmente en Rosario, con desplazamiento, zoom y botón para centrar en la posición propia cuando exista permiso. |
| FE-05 | P0 | Solicitar y renderizar hexágonos por área visible y nivel de zoom. Cancelar o ignorar respuestas viejas al mover el mapa. No descargar toda la ciudad con cada interacción. |
| FE-06 | P0 | Diferenciar libre, propio, rival protegido, rival disputable y no habilitado mediante color más icono, patrón o texto. Incluir leyenda. |
| FE-07 | P0 | Mostrar fecha de actualización y señal de datos desactualizados. Una celda en caché nunca habilita por sí sola una conquista. |
| FE-08 | P0 | Al seleccionar un hexágono abrir un detalle con ID o nombre, estado, alias público del dueño, área válida, protección, vencimiento y acción disponible. |
| FE-09 | P0 | Mostrar countdowns calculados a partir de `serverTime` y fechas del servidor. Al llegar a cero solicitar actualización; el contador local no adjudica elegibilidad. |
| FE-10 | P0 | Indicar por qué una acción está deshabilitada: fuera de área, protegido, propio sin renovación disponible, sin temporada, mala ubicación o territorio no habilitado. |

### 8.2 Conquista y renovación

| ID | Prioridad | Requisito y criterio de aceptación |
|---|---|---|
| FE-11 | P0 | Iniciar un intento solo después de una acción explícita. Mostrar requisitos de presencia y enviar muestras asociadas al desafío recibido. |
| FE-12 | P0 | Mostrar progreso de validación sin anunciar conquista antes de la confirmación del servidor. Indicar si salir del área o perder precisión obliga a reiniciar la validación. |
| FE-13 | P0 | Deshabilitar envíos repetidos mientras una confirmación está pendiente y reutilizar la clave de idempotencia en reintentos de la misma operación. |
| FE-14 | P0 | Ante timeout, mostrar «Verificando resultado» y consultar el intento original. Nunca declarar fracaso definitivo ni iniciar automáticamente una segunda conquista sin resolver el resultado anterior. |
| FE-15 | P0 | Ante éxito, actualizar celda, dueño, protección, cantidad propia y panel de renta con datos de servidor; después mostrar la animación de conquista. |
| FE-16 | P0 | Ante conflicto, actualizar el territorio y explicar que otra persona lo conquistó antes. No mostrar datos del rival ajenos a su perfil público. |
| FE-17 | P0 | Implementar renovación como acción diferenciada y explicar qué vencimiento cambia y que la protección no se reinicia. |
| FE-18 | P0 | Al cancelar, ocultar la pantalla o perder conectividad, informar el estado del intento. No guardar conquistas para enviarlas offline. Al volver, consultar estado y validez de muestras. |

### 8.3 Territorios, renta y billetera

| ID | Prioridad | Requisito y criterio de aceptación |
|---|---|---|
| FE-19 | P0 | Mostrar «Mis territorios» con cantidad actual, estado de cada uno, protección, vencimiento, renovación disponible y acceso al mapa. |
| FE-20 | P0 | Mostrar historial paginado de conquistas, pérdidas, renovaciones y vencimientos. Una pérdida debe explicar que no borra lo generado previamente. |
| FE-21 | P0 | Mostrar cantidad territorial, poder productivo, control acumulado, participación estimada, fondo y cierre de temporada con etiquetas distintas y explicación accesible de la curva. |
| FE-22 | P0 | Identificar toda renta no liquidada como estimación variable y mostrar su última actualización. No usar un contador animado como si fueran puntos ya gastables. |
| FE-23 | P0 | Mostrar puntos disponibles, retenidos e historial de movimientos por separado. Cada movimiento debe tener origen, fecha y estado. |
| FE-24 | P0 | Representar temporada en cierre y liquidación pendiente sin mostrar saldo definitivo anticipado. Al liquidarse, refrescar la billetera. |
| FE-25 | P1 | Mostrar ranking por cantidad actual de territorios, separado del económico. Aplicar desempate documentado y no publicar información privada. |

### 8.4 Beneficios y comercios

| ID | Prioridad | Requisito y criterio de aceptación |
|---|---|---|
| FE-26 | P0 | Mostrar catálogo con comercio, sucursal, beneficio, precio en puntos, stock, vigencia y condiciones de compra. Diferenciar premio gratuito de descuento condicionado. |
| FE-27 | P0 | Antes de reservar, mostrar el costo y el saldo disponible resultante. Tras confirmar, usar el estado del servidor y no restar saldo de manera definitiva en el cliente. |
| FE-28 | P0 | Mostrar comprobante QR de un solo uso y alternativa de ingreso manual, comercio válido, condiciones y vencimiento. El QR contiene una referencia opaca, no datos personales ni saldo. |
| FE-29 | P0 | Permitir consultar o cancelar una reserva pendiente. Reflejar confirmación, cancelación y vencimiento con actualización de saldo. |
| FE-30 | P0 | En el panel del comercio, permitir escanear/ingresar un comprobante, previsualizar su beneficio y confirmar su consumo mediante una acción explícita. Consultar el código no consume el canje. |
| FE-31 | P0 | Mostrar errores diferenciados de código inválido, vencido, usado y comercio incorrecto, sin revelar información innecesaria del titular. |
| FE-32 | P0 | Mostrar al operador solo sus beneficios y canjes, con filtros básicos de fecha y estado. |

### 8.5 Administración y experiencia general

| ID | Prioridad | Requisito y criterio de aceptación |
|---|---|---|
| FE-33 | P0 | Panel administrativo mínimo para habilitar celdas y áreas válidas, crear temporadas en borrador, definir parámetros y registrar respaldo económico. Mostrar validaciones antes de activar. |
| FE-34 | P0 | Permitir administrar comercios, operadores, beneficios, stock y vigencia; advertir sobre reservas o saldos comprometidos antes de retirar respaldo. |
| FE-35 | P0 | Todas las vistas deben contemplar carga, vacío, error, sin conexión, sesión vencida y reintento. Los botones deben indicar claramente si una acción sigue pendiente. |
| FE-36 | P0 | Ofrecer una lista accesible equivalente a la selección de territorios del mapa, etiquetas para lector de pantalla y navegación por teclado en controles. |
| FE-37 | P0 | Mostrar horas al usuario en la zona local configurada; conservar instantes del servidor sin reinterpretarlos. Mostrar fecha completa cuando un cooldown cruza de día. |
| FE-38 | P1 | Centro de notificaciones para pérdida territorial, vencimiento próximo, liquidación y estado de canje, con lectura y preferencias. |

## 9. Requisitos de backend

### 9.1 Identidad y geografía

| ID | Prioridad | Requisito y criterio de aceptación |
|---|---|---|
| BE-01 | P0 | Autenticar usuarios y autorizar cada operación según rol y recurso. Un jugador no puede operar billeteras ajenas ni un comercio confirmar canjes de otro. |
| BE-02 | P0 | Mantener perfil público separado de identidad privada. Las respuestas del mapa solo exponen alias y un identificador público estable. |
| BE-03 | P0 | Generar o importar una grilla reproducible con IDs estables, resolución versionada, límite de Rosario y áreas válidas. La resolución no se cambia durante una temporada. |
| BE-04 | P0 | Consultar territorios por bounding box, filtros y nivel de detalle con límites de tamaño y resultados. Incluir estado efectivo, versión y hora del servidor. |
| BE-05 | P0 | Validar que las áreas habilitadas estén dentro de la celda y del área de juego. Celdas sin área válida quedan no conquistables. |
| BE-06 | P0 | Permitir habilitar/deshabilitar territorios con rol administrativo, motivo y auditoría. Cerrar intervalos productivos al deshabilitar. |

### 9.2 Motor de conquista

| ID | Prioridad | Requisito y criterio de aceptación |
|---|---|---|
| BE-07 | P0 | Crear un intento vinculado a usuario, territorio, temporada, versión observada, desafío y caducidad. Limitar intentos activos y frecuencia por cuenta y contexto. |
| BE-08 | P0 | Validar muestras por coordenadas, precisión, antigüedad, secuencia, recepción en servidor, presencia mínima y desplazamientos incompatibles. No confiar únicamente en timestamps del dispositivo. |
| BE-09 | P0 | Aplicar una política conservadora en bordes: si la incertidumbre de ubicación no permite establecer pertenencia al área válida, pedir una muestra mejor. No adjudicar automáticamente la celda más cercana. |
| BE-10 | P0 | Revalidar habilitación, temporada, desafío, ubicación, dueño, protección y versión dentro del flujo transaccional de confirmación. |
| BE-11 | P0 | Transferir propiedad atómicamente: cerrar tenencia previa, actualizar acumulados afectados, abrir tenencia nueva, actualizar versión y registrar evento. Un rollback no deja cambios parciales. |
| BE-12 | P0 | Proteger concurrencia por territorio y por acumulados de usuarios afectados. Definir un orden de bloqueo consistente o mecanismo equivalente para evitar doble control y carreras en `W(n)`. |
| BE-13 | P0 | Persistir idempotencia por actor, operación, clave y huella de solicitud. Conservar respuesta o referencia de resultado durante la ventana de reintento definida. |
| BE-14 | P0 | Renovar solo si el solicitante sigue siendo dueño, está habilitado para renovar y cumple presencia. La operación no modifica el fin de protección original. |
| BE-15 | P0 | Resolver vencimientos mediante jobs y comprobación al leer/escribir. Cortar la producción en el timestamp real de vencimiento, no en el de ejecución del job. |
| BE-16 | P0 | Exponer consulta del estado de un intento al dueño, incluyendo resultado definitivo si la respuesta original se perdió. |

### 9.3 Economía y billetera

| ID | Prioridad | Requisito y criterio de aceptación |
|---|---|---|
| BE-17 | P0 | Gestionar temporadas y configuración versionada. Validar calendario, fondo, curva creciente de incrementos no crecientes y respaldo antes de activar. |
| BE-18 | P0 | Mantener intervalos o un registro de eventos suficiente para reconstruir el control acumulado de cualquier usuario, con límites de temporada y sin doble contabilización. |
| BE-19 | P0 | Actualizar acumulados ante conquista, pérdida, renovación cuando afecte el vencimiento, expiración, deshabilitación y cierre de temporada. |
| BE-20 | P0 | Exponer estimación con hora de cálculo, supuestos y carácter no gastable. Si no hay actividad suficiente, devolver «sin estimación» en vez de una división inválida. |
| BE-21 | P0 | Cerrar y liquidar temporadas con instantánea de reglas y entradas, redondeo reproducible, control del fondo y reintentos idempotentes. |
| BE-22 | P0 | Mantener un libro de movimientos inmutable para créditos, retenciones, consumos, liberaciones y ajustes. Las correcciones generan movimientos compensatorios; no sobrescriben historia. |
| BE-23 | P0 | Validar saldo disponible atómicamente en cada reserva. Mantener conciliables saldo disponible, retenido y libro de movimientos. |
| BE-24 | P0 | Aplicar restricciones de unicidad por liquidación/usuario y operación de canje; un proceso repetido no genera dobles créditos ni débitos. |
| BE-25 | P0 | Registrar compromisos económicos con capacidad, vigencia, responsable y consumo. Conservar respaldo para puntos emitidos pendientes de canje y bloquear nuevas emisiones sin cobertura. |
| BE-26 | P0 | Producir reporte de cierre con fondo, puntos emitidos, remanente, jugadores liquidados, fallos y estado de conciliación. |

### 9.4 Beneficios y canjes

| ID | Prioridad | Requisito y criterio de aceptación |
|---|---|---|
| BE-27 | P0 | Gestionar comercios, sucursales, membresías de operadores y beneficios versionados con precio, stock, vigencia y condiciones. |
| BE-28 | P0 | Crear una reserva en una transacción que compruebe vigencia, stock y saldo, y retenga ambos recursos. Devolver token de canje no predecible con caducidad. |
| BE-29 | P0 | Permitir al comercio autorizado inspeccionar una reserva sin consumirla. Proteger búsquedas por código contra enumeración. |
| BE-30 | P0 | Confirmar canje en una transacción que valide token, estado, comercio y vigencia; consumir stock y saldo retenidos exactamente una vez. |
| BE-31 | P0 | Cancelar o vencer reservas con liberación idempotente. Resolver correctamente la carrera entre confirmación, cancelación y expiración. |
| BE-32 | P0 | Mantener historial de canjes consultable por jugador, comercio autorizado y administrador con alcance de datos apropiado. |

### 9.5 Operación, privacidad y abuso

| ID | Prioridad | Requisito y criterio de aceptación |
|---|---|---|
| BE-33 | P0 | Auditar cambios de propiedad, configuración, liquidaciones, canjes y acciones administrativas con actor, fecha, motivo y request ID. |
| BE-34 | P0 | Aplicar límites de solicitudes, detectar reutilización de evidencia y registrar anomalías de movimiento o canje. No afirmar que estas comprobaciones eliminan GPS falso o multicuentas. |
| BE-35 | P0 | Permitir revisar evidencia sospechosa antes de cerrar la liquidación. Separar revisión de sanción; un dato ambiguo no debe producir una confiscación automática no explicada. |
| BE-36 | P0 | No exponer ubicación actual ni trazas privadas en mapa, ranking, eventos públicos o logs generales. Retener evidencia precisa solo durante un período configurado. |
| BE-37 | P0 | Exponer salud de jobs, errores de liquidación y discrepancias de conciliación. Un fallo de un job no debe alterar reglas económicas silenciosamente. |
| BE-38 | P1 | Publicar eventos de cambio de territorio y estado privado con control de audiencia. Si se usa polling, devolver versiones para detectar actualizaciones. |

## 10. Contratos frontend/backend propuestos

Los nombres son contratos de referencia, independientes del framework. Antes de implementar, deben fijarse en un esquema compartido con tipos y ejemplos.

### 10.1 Convenciones

- API versionada bajo `/api/v1`.
- Fechas como instantes UTC en ISO 8601; UI en zona local.
- Identificadores opacos y estables.
- Cantidades de puntos como enteros; acumulados de precisión alta serializados sin pérdida.
- Mutaciones sensibles con encabezado `Idempotency-Key`.
- Respuestas territoriales con `serverTime` y `version`.
- Listados paginados mediante cursor o estrategia documentada.
- Errores con `code`, `message`, `retryable`, `requestId` y, cuando corresponda, estado público actualizado.
- Ningún endpoint acepta del cliente el dueño final, la renta calculada, el saldo final ni el rol efectivo.

### 10.2 Endpoints mínimos

| Método y ruta | Finalidad | Datos principales |
|---|---|---|
| `GET /me` | Perfil y permisos propios | Roles, alias y estado de cuenta. |
| `GET /territories?bbox=...&zoom=...` | Mapa visible | Geometría o referencia, estado, dueño público, protección, versión. |
| `GET /territories/{id}` | Detalle actual | Área válida, propiedad, vencimientos, elegibilidad contextual y motivos. |
| `POST /territories/{id}/claim-attempts` | Abrir intento | Versión observada; devuelve `attemptId`, desafío, requisitos y caducidad. |
| `POST /claim-attempts/{id}/samples` | Incorporar evidencia | Secuencia, coordenadas, precisión y tiempo capturado; servidor registra recepción. |
| `POST /claim-attempts/{id}/confirm` | Confirmar conquista | Desafío e idempotencia; devuelve resultado definitivo y territorio actualizado. |
| `GET /claim-attempts/{id}` | Recuperar resultado | Estado, motivo y resultado si existe; solo titular. |
| `DELETE /claim-attempts/{id}` | Cancelar intento pendiente | Cancelación sin efectos sobre propiedad. |
| `POST /territories/{id}/renewal-attempts` | Iniciar renovación | Mismo patrón de evidencia y confirmación, con tipo `RENEWAL`. |
| `GET /me/territories` | Panel propio | Territorios vigentes, cantidad y renovaciones. |
| `GET /me/territory-events` | Historial | Conquistas, pérdidas y vencimientos. |
| `GET /seasons/current` | Temporada | Estado, fechas, reglas públicas y fondo. |
| `GET /me/earnings?seasonId=...` | Producción propia | Poder, acumulado, estimación, fecha y estado de liquidación. |
| `GET /me/wallet` | Saldo | Disponible, retenido y última actualización. |
| `GET /me/wallet/transactions` | Libro visible | Movimientos paginados y referencia de origen. |
| `GET /benefits` | Catálogo | Precio, stock, comercio, vigencia y condiciones. |
| `POST /redemptions` | Reservar beneficio | `benefitId`, versión aceptada e idempotencia. |
| `GET /me/redemptions` | Historial de reservas | Estados y condiciones aceptadas. |
| `GET /redemptions/{id}` | Comprobante propio | Token, vencimiento y estado; solo titular autorizado. |
| `POST /redemptions/{id}/cancel` | Cancelación propia | Liberación de saldo/stock si sigue pendiente. |
| `POST /merchant/redemptions/inspect` | Consultar código | Token en cuerpo; sin consumo. |
| `POST /merchant/redemptions/{id}/confirm` | Consumir reserva | Token e idempotencia; operador del comercio habilitado. |
| `GET /merchant/redemptions` | Historial del comercio | Canjes de recursos autorizados. |

Los intentos de renovación usan los endpoints de muestras, consulta y confirmación del servicio de intentos. El nombre `claim-attempts` puede unificarse a `territory-attempts` al fijar el contrato, sin mantener dos comportamientos divergentes.

Los recursos administrativos deben cubrir: territorios/áreas válidas, borradores de temporada, activación, respaldo, comercios, operadores, beneficios, stock y revisión. Activación y cierre son acciones explícitas; no se permite editar directamente un estado final desde un CRUD genérico.

### 10.3 Códigos de error mínimos

| Código | Respuesta esperada del frontend |
|---|---|
| `AUTH_REQUIRED` / `FORBIDDEN` | Solicitar sesión o mostrar falta de permiso; no reintentar ciegamente. |
| `SEASON_NOT_ACTIVE` | Mostrar estado de temporada y deshabilitar conquista. |
| `TERRITORY_DISABLED` | Actualizar celda y explicar indisponibilidad. |
| `TERRITORY_PROTECTED` | Mostrar protección vigente informada por servidor. |
| `TERRITORY_CHANGED` | Actualizar dueño/versión y cerrar el intento en conflicto. |
| `ALREADY_OWNER` | Ofrecer renovación si corresponde. |
| `OUTSIDE_CLAIM_AREA` | Mostrar área válida sin atribuir presencia confirmada. |
| `LOCATION_INACCURATE` / `LOCATION_STALE` | Pedir nueva evidencia y explicar el problema. |
| `PRESENCE_INSUFFICIENT` | Mostrar requisito pendiente, sin inventar progreso. |
| `ATTEMPT_EXPIRED` | Permitir iniciar otro intento explícitamente. |
| `IDEMPOTENCY_CONFLICT` | Detener el reintento y recuperar operación original. |
| `INSUFFICIENT_POINTS` / `OUT_OF_STOCK` | Refrescar saldo o catálogo. |
| `REDEMPTION_EXPIRED` / `ALREADY_REDEEMED` / `MERCHANT_MISMATCH` | Mostrar estado específico sin permitir consumo. |
| `RATE_LIMITED` | Respetar tiempo de reintento informado. |
| `TEMPORARY_UNAVAILABLE` | Mantener referencia de operación y ofrecer recuperación. |

## 11. Modelo de datos mínimo

| Entidad | Campos o relaciones esenciales |
|---|---|
| `User` | ID, identidad privada, alias público, estado, fechas. |
| `RoleMembership` | Usuario, rol, comercio/sucursal cuando aplique. |
| `Territory` | ID estable, geometría, resolución, área de ciudad, estado habilitado, versión. |
| `ClaimArea` | Territorio, geometría autorizada, vigencia y motivo de habilitación. |
| `Season` | Fechas, estado, fondo de puntos, versión de reglas, snapshot de respaldo. |
| `RuleSet` | Duraciones, política de presencia, curva de pesos, límites y versión. |
| `TerritoryOwnership` | Territorio, usuario, temporada, inicio, protección, vencimiento, fin efectivo y motivo. |
| `TerritoryAttempt` | Tipo, usuario, territorio, temporada, versión observada, desafío, caducidad, estado y resultado. |
| `LocationEvidence` | Intento, secuencia, coordenadas, precisión, tiempo del dispositivo, recepción y vencimiento de retención. |
| `TerritoryEvent` | Tipo, territorio, actores, instante efectivo, versión, request ID y referencia de operación. |
| `ControlAccumulator` | Usuario/temporada, cantidad productiva, último instante integrado y acumulado. Reconstruible desde eventos/tenencias. |
| `SeasonSettlement` | Temporada, snapshot, estado, totales, redondeo y controles de conciliación. |
| `SettlementAllocation` | Liquidación, usuario, acumulado validado, puntos asignados y referencia única de crédito. |
| `Wallet` / `WalletEntry` | Usuario, disponibles/retenciones derivables, movimientos inmutables y referencias únicas. |
| `Merchant` / `Branch` | Identidad comercial, estado, ubicación y operadores autorizados. |
| `FundingCommitment` | Responsable, tipo de respaldo, capacidad máxima, unidades, valoración acordada, vigencia y consumo comprometido. |
| `Benefit` / `BenefitVersion` | Comercio, condiciones, precio, vigencia, stock total/reservado/consumido y respaldo asociado. |
| `Redemption` | Usuario, versión de beneficio, puntos, estado, caducidad, hash del token, operador y fechas. |
| `IdempotencyRecord` | Actor, operación, clave, huella, estado y resultado. |
| `AuditEvent` | Actor, acción, recurso, motivo, timestamp y correlación. |

### 11.1 Invariantes de persistencia

- Una sola tenencia activa efectiva por territorio; intervalos históricos sin solapamiento.
- Un solo crédito por usuario y liquidación.
- Una sola finalización efectiva por reserva.
- Stock total = disponible + reservado + consumido, ajustado por movimientos administrativos auditados.
- Saldo disponible no negativo y conciliable con el libro.
- Suma de créditos de temporada menor o igual al fondo.
- Toda transición de propiedad que cambie producción debe quedar asociada a la actualización económica correspondiente.
- No eliminar en cascada movimientos económicos al desactivar un usuario o comercio.

## 12. Parámetros configurables; valores pendientes

No hay números de balance obligatorios en esta versión. Para ejecutar el MVP se deben cargar valores explícitos en una configuración de demo versionada, identificada como tal.

| Parámetro | Función | Restricción |
|---|---|---|
| `GRID_RESOLUTION` | Tamaño de las celdas | Estable durante una temporada; IDs y áreas reproducibles. |
| `CLAIM_PROTECTION_DURATION` | Duración del cooldown | Positiva y menor que la vigencia máxima de tenencia. |
| `OWNERSHIP_TTL` | Tiempo de propiedad sin renovación | Positivo; recortado por el cierre de temporada. |
| `RENEWAL_ELIGIBILITY_WINDOW` | Cuándo puede renovarse | No habilita renovación continua ni protección infinita. |
| `RENEWAL_EXTENSION` | Extensión de tenencia | Limitada por la temporada; no modifica protección. |
| `ATTEMPT_TTL` | Caducidad del intento | Compatible con el tiempo mínimo de presencia. |
| `MIN_PRESENCE_DURATION` | Permanencia requerida | Positiva; comunicada antes de iniciar. |
| `MIN_LOCATION_SAMPLES` | Cantidad de evidencia | Compatible con cadencia y duración. |
| `MAX_LOCATION_AGE` | Antigüedad admitida | Evaluada con recepción y reloj de servidor. |
| `MAX_LOCATION_ACCURACY_ERROR` | Precisión admisible | Aplicada también en bordes de áreas. |
| `MAX_SAMPLE_GAP` | Interrupción tolerada | Define cuándo reiniciar presencia. |
| `MOVEMENT_ANOMALY_POLICY` | Reglas de desplazamiento anómalo | Separar señal de revisión de prueba concluyente. |
| `TERRITORY_WEIGHT_CURVE` | Rendimientos por cantidad | `W(0)=0`, creciente, incrementos no crecientes. |
| `SEASON_POINT_POOL` | Puntos emitibles | No superar respaldo verificado. |
| `SEASON_START/END` | Período de competencia | Sin solapamientos no soportados. |
| `REDEMPTION_TTL` | Duración de reserva | No exceder vigencia aplicable del beneficio. |
| `IDEMPOTENCY_RETENTION` | Recuperación de reintentos | Suficiente para la ventana de recuperación; referencias económicas únicas permanentes. |
| `LOCATION_RETENTION` | Conservación de evidencia precisa | Limitada y distinta del historial económico. |
| `MAP_REFRESH_INTERVAL` | Frescura del mapa | Configurable según capacidad y experiencia. |

## 13. Requisitos no funcionales

| ID | Requisito | Verificación |
|---|---|---|
| NFR-01 | Consistencia fuerte para propiedad, saldo, stock y consumo de canje. | Pruebas concurrentes e invariantes persistidas. |
| NFR-02 | Consistencia eventual permitida en mapa y ranking, con antigüedad visible. | Simular actualizaciones retrasadas y confirmar que las mutaciones revalidan. |
| NFR-03 | Recuperación tras fallos sin dobles efectos económicos. | Interrumpir y reejecutar conquista, reserva y liquidación. |
| NFR-04 | Transporte cifrado en el despliegue real, control de sesión, secretos fuera del cliente y protección de endpoints de mutación. | Revisión de despliegue, autorización y exposición de datos. |
| NFR-05 | Ubicación privada por defecto y acceso restringido a evidencia. | Revisar respuestas, logs y permisos por actor. |
| NFR-06 | Experiencia usable en pantallas móviles y con geolocalización denegada o degradada. | Pruebas en dispositivos objetivo y escenarios de permiso. |
| NFR-07 | Ningún estado esencial depende exclusivamente del color; acciones tienen etiquetas y estados de foco. | Revisión de accesibilidad de mapa, lista y formularios. |
| NFR-08 | El mapa carga por área y las operaciones tienen límites para evitar consultas sin cota. | Medición con dataset de la ciudad y viewport variable. |
| NFR-09 | Logs correlacionables, métricas de fallos y conciliación de datos económicos. | Rastrear una operación completa por request ID sin exponer coordenadas. |
| NFR-10 | Fechas consistentes entre servidor, dispositivo y cambios de reloj local. | Alterar el reloj del cliente y verificar reglas invariables. |

Antes de un piloto público deben fijarse objetivos medibles de latencia, concurrencia, disponibilidad, retención y recuperación. Sus valores no se deducen de los parámetros de balance del juego y quedan como decisiones técnicas pendientes.

## 14. Casos de aceptación integrados

| ID | Escenario | Resultado esperado | Requisitos relacionados |
|---|---|---|---|
| CA-01 | Jugador válido conquista celda libre con presencia suficiente | Se crea una única tenencia protegida; mapa y panel reflejan dueño. | FE-11–15, BE-07–13 |
| CA-02 | Jugador intenta conquistar durante cooldown | Rechazo sin cambios de dueño, tenencia ni economía. | RN-05, FE-09–10, BE-10 |
| CA-03 | Conquista al alcanzar exactamente el fin de protección | Es elegible según reloj de servidor y validaciones restantes. | RN-14–15, BE-10 |
| CA-04 | Dos usuarios confirman sobre la misma versión | Uno gana; el otro recibe conflicto; no se solapan tenencias. | RN-16, FE-16, BE-11–12 |
| CA-05 | Respuesta exitosa se pierde y el usuario reintenta | Se recupera resultado original; no se reinicia protección ni se duplica producción. | RN-17–19, FE-13–14, BE-13–16 |
| CA-06 | Dueño intenta reconquistar para reiniciar cooldown | Rechazo como conquista; renovación separada si corresponde. | RN-09–10, FE-17, BE-14 |
| CA-07 | GPS denegado, antiguo, impreciso o ambiguo en borde | Se permite explorar; no se confirma conquista; se muestra causa específica. | FE-03, BE-08–09 |
| CA-08 | Usuario sale del área o interrumpe muestras | Se reinicia o invalida presencia según política versionada. | FE-12, BE-08 |
| CA-09 | Territorio cambia o se deshabilita durante intento | La confirmación rechaza; no adjudica usando estado inicial. | RN-06, BE-06, BE-10 |
| CA-10 | Vence tenencia y el job se ejecuta tarde | Producción termina en vencimiento real; el territorio se consulta como libre. | RN-11, BE-15 |
| CA-11 | Mismo usuario conquista dos territorios simultáneamente | Cantidad y peso productivo resultantes son correctos; no se pierde un incremento. | RN-25, BE-12, BE-18 |
| CA-12 | Usuario pierde un territorio | Conserva control acumulado previo y puntos liquidados; deja de producir ese territorio. | RN-13, FE-20, BE-19 |
| CA-13 | Temporada cierra durante confirmación de conquista | No se abre producción fuera del intervalo; operación se acepta o rechaza conforme al corte transaccional. | RN-24, BE-10, BE-21 |
| CA-14 | Liquidación falla después de acreditar algunos usuarios | Reanudar completa faltantes sin dobles créditos; emisión total no supera fondo. | RN-28–30, BE-21–24 |
| CA-15 | Temporada sin control acumulado | No hay división por cero ni emisión; fondo queda sin distribuir. | RN-27, BE-20–21 |
| CA-16 | Dos usuarios reservan el último beneficio | Solo una reserva obtiene stock; la otra no retiene puntos. | RN-35, BE-28 |
| CA-17 | Usuario intenta gastar simultáneamente el mismo saldo | Solo se aceptan reservas cubiertas; saldo no negativo. | RN-40, BE-23 |
| CA-18 | Comercio confirma dos veces el mismo QR | Un solo débito y un solo consumo; reintento recupera resultado o informa uso previo. | RN-36, BE-30 |
| CA-19 | Confirmación compite con cancelación/vencimiento | Existe un único estado final y liberación o consumo, nunca ambos. | RN-37, BE-31 |
| CA-20 | Operador de otro comercio intenta consumir comprobante | Se rechaza por autorización sin exponer datos privados. | FE-31, BE-01, BE-30 |
| CA-21 | Administrador intenta activar temporada sin respaldo suficiente | Se bloquea activación y se informa insuficiencia concreta. | RN-31–33, FE-33, BE-17, BE-25 |
| CA-22 | Cambia el precio de un beneficio con reserva existente | La reserva conserva precio y condiciones aceptados. | RN-39, BE-27–28 |
| CA-23 | Se reinicia temporada | Se libera propiedad anterior, conserva historial y saldo, y no se cuenta dos veces tiempo de control. | D-08, BE-19–21 |
| CA-24 | Se altera reloj del teléfono | No cambia protección, vencimiento, presupuesto ni elegibilidad definitiva. | FE-09, RN-14, NFR-10 |

## 15. División del trabajo y orden de implementación

| Etapa | Frontend | Backend | Entregable verificable |
|---|---|---|---|
| 1. Contratos | Wireframes de mapa, detalle, estados y errores; cliente con mocks compartidos | Esquemas de API, reglas, entidades e invariantes | Contratos acordados y ejemplos de respuestas. |
| 2. Mapa y acceso | Login, permisos, mapa y detalle | Identidad, grilla, áreas habilitadas y consultas | Explorar y comprender estados territoriales reales. |
| 3. Conquista | Intento, evidencia, progreso, confirmación y conflicto | Motor transaccional, idempotencia, tenencias y cooldown | Dos jugadores compiten por un territorio con resultado único. |
| 4. Persistencia territorial | Mis territorios, historial y renovación | Vencimientos, renovación, eventos y recuperación | Propiedad coherente después de recargar y reiniciar servicios. |
| 5. Economía | Panel de renta, curva y billetera | Temporadas, acumuladores, respaldo, liquidación y libro | Control territorial produce créditos trazables en un cierre. |
| 6. Beneficios | Catálogo, reserva, QR y panel de comercio | Stock, retención, tokens y canje atómico | Canje completo y rechazo de segundo uso. |
| 7. Operación | Administración, errores y accesibilidad | Auditoría, conciliación, límites y revisión | Escenario integrado y recuperación de fallos críticos. |

### 15.1 Definición de terminado por equipo

**Frontend:** cada flujo P0 funciona con API real; contempla errores y estados intermedios; no calcula autoridad territorial ni saldo definitivo; no presenta simulación como actividad real; permite recuperar resultados después de cortes.

**Backend:** cada mutación valida autorización, elegibilidad y concurrencia; persiste cambios y auditoría coherentes; soporta reintentos; mantiene invariantes económicas; expone errores utilizables; tiene pruebas de concurrencia y recuperación de los casos críticos.

**Integración:** una conquista real o simulada explícitamente puede seguirse desde la evidencia hasta la tenencia, el acumulado, la liquidación y un canje, con referencias rastreables en cada paso.

## 16. Demo de hackatón

1. Cargar una temporada de demostración con reglas y fondo ficticios identificados como tales, dos jugadores, un comercio y varios territorios habilitados.
2. Abrir el mapa y seleccionar un territorio libre.
3. Completar presencia mediante ubicación real o una fuente simulada activada exclusivamente en el entorno de demo.
4. Conquistar y mostrar cambio de dueño, protección, cantidad territorial y poder productivo.
5. Desde el segundo jugador, intentar conquistar durante protección y mostrar rechazo.
6. Avanzar el reloj de demo de forma coherente en el servidor; conquistar después del cooldown y mostrar la transferencia.
7. Cerrar la temporada mediante una herramienta administrativa de demo y mostrar el reparto trazable del fondo.
8. Reservar un beneficio con saldo liquidado, presentar QR y confirmarlo desde el comercio.
9. Repetir el QR y demostrar que no se consume dos veces.

El reloj acelerado y las coordenadas simuladas deben estar aislados del entorno real. Ningún endpoint público de producción permite elegir libremente la hora o saltear la validación de presencia.

## 17. Decisiones pendientes antes del piloto

| ID | Decisión | Impacto |
|---|---|---|
| P-01 | Confirmar economía por fondo repartido o elegir otro mecanismo | Fórmula, panel de renta, liquidación y respaldo. |
| P-02 | Confirmar si el canje requiere esperar al cierre o habrá períodos menores | Disponibilidad de saldo y frecuencia de recompensa. |
| P-03 | Definir duración de cooldown, tenencia y condiciones de renovación | Ritmo de conquista y facilidad para nuevos jugadores. |
| P-04 | Definir resolución y zonas habilitadas del piloto | Distancias, accesibilidad y revisión territorial. |
| P-05 | Definir si caminar, pedalear y otras modalidades tienen igual elegibilidad | Evidencia, inclusión y evaluación de movimiento. |
| P-06 | Acordar fuente de financiación y condiciones de reposición de catálogo | Viabilidad del canje y continuidad del respaldo. |
| P-07 | Definir control de multicuentas y procedimiento de revisión/reclamo | Abuso de rendimientos decrecientes y falsos positivos. |
| P-08 | Confirmar reinicio territorial al cerrar temporada | Persistencia de propiedad y progresión. |
| P-09 | Elegir autenticación, proveedor de mapa, tecnología de grilla y stack | Implementación y costos operativos; no cambia requisitos funcionales. |
| P-10 | Definir privacidad pública del dueño, retención y política de cuentas | Exposición territorial y conservación de evidencia. |
| P-11 | Fijar objetivos de rendimiento y recuperación del piloto | Pruebas de carga y operación. |

## 18. Condición de aceptación del MVP

El MVP se considera funcionalmente completo cuando se demuestra el recorrido **mapa → presencia → conquista → protección → cambio de dueño → liquidación → canje**, pasan los casos de integridad y concurrencia aplicables, y los valores de demo están documentados como parámetros modificables.

Un mapa con conquistas simuladas y un contador de puntos local es una demostración visual parcial; no cumple esta especificación completa sin persistencia, reglas de propiedad, libro de puntos y canje de un solo uso.
