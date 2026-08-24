# Invariantes del negocio

Las reglas que tienen que seguir siendo ciertas después de cualquier cambio.
No están acá las que se leen solas en el código: están las que costaron una
decisión, las que no se ven mirando una función suelta, y las que si se rompen
hacen perder plata o confianza en silencio.

Cada invariante dice **qué** y **por qué**, apunta al test que lo sostiene, y
declara **qué capa lo garantiza**. Si un cambio hace fallar uno de esos tests,
la pregunta no es cómo arreglar el test: es si de verdad se quiere cambiar la
regla. Al final está la lista de las que todavía no tienen test, que es el
backlog.

Para correr todo: `npm test`.

## Qué significa "lo sostiene"

Un test que pasa dice que la regla se cumple **por los caminos que el test
recorre**. No dice que sea imposible violarla por un camino nuevo. Esa
diferencia es la que hace que un invariante se rompa en silencio meses después,
así que cada regla declara de qué tipo es:

- **Estructural** — la base de datos, o una función que todos usan, lo hacen
  cumplir solos. Código nuevo lo hereda gratis: para violarlo hay que pelearse
  con Postgres o dejar de usar la función.
- **Puntual** — vive dentro de una acción concreta. Cumple mientras se pase por
  ahí, pero **un camino nuevo tiene que acordarse**. Es el más frágil, y el más
  común.
- **Convención** — nada lo verifica en ejecución; solo el test y la disciplina.

El caso que le puso precio a esta distinción: el pedido tenía tres puertas de
entrada y la comprobación vivía en `createOrder`. El cron de suscripciones no
pasa por ahí, así que la regla no lo alcanzaba. Un invariante *puntual* no es un
invariante malo; es uno que hay que volver a aplicar cada vez que se abre una
puerta nueva.

---

## Precios y totales

**El precio de venta lo pone el servidor, nunca el cliente.**
La acción relee cada producto de la base y usa ese precio, ignorando cualquier
importe que venga en el pedido. Es la diferencia entre una tienda y una
donación.
**Lo sostiene:** `createOrder` y el cron de suscripciones, cada uno por su lado
— *puntual*.
→ [create-order.test.ts](../tests/create-order.test.ts): *cobra el precio de la
base, no el que mandó el cliente*

**El precio unitario queda congelado en el pedido.**
`OrderItem.unitPrice` guarda lo que costaba la vianda cuando se vendió. Si
mañana sube el precio, un pedido viejo no se reescribe solo: los históricos y
los reportes tienen que seguir cerrando.
**Lo sostiene:** la columna existe en el esquema, pero llenarla bien es trabajo
de quien escribe el pedido — *puntual*.
→ [create-order.test.ts](../tests/create-order.test.ts): *congela el precio
unitario al momento de la venta*

**El envío se suma después del descuento, nunca antes.**
Si se sumara antes, la promoción terminaría descontando parte del flete.
**Lo sostiene:** `calculateTotal` en [pricing.ts](../lib/orders/pricing.ts),
que recibe el precio ya descontado — *estructural* para quien la use.
→ [subscriptions.test.ts](../tests/subscriptions.test.ts): *suma el envío
después del descuento*

**Los importes se redondean a dos decimales.**
Son pesos, no flotantes libres. Sin esto la suma de un pedido y su total dejan
de coincidir por centésimas invisibles.
**Lo sostiene:** `roundMoney` en [pricing.ts](../lib/orders/pricing.ts) —
*estructural en el servidor*. **Ojo:** la vitrina calcula su propio subtotal en
`cart-provider.tsx` y **no** redondea. Con precios enteros no se nota; si algún
día hay centavos, el carrito y el cobro pueden mostrar números distintos.
→ [subscriptions.test.ts](../tests/subscriptions.test.ts): *redondea a dos
decimales*, *no arrastra errores de punto flotante*

**El precio final nunca baja de cero.**
Un descuento mayor que el subtotal deja el pedido en cero, no en negativo.
**Lo sostiene:** el acotado dentro de `calculatePromotions` — *estructural*.
→ [promotions.test.ts](../tests/promotions.test.ts): *acota el precio final en
cero aunque el descuento lo supere*

**Un mismo producto y variante es un solo ítem del pedido.**
Se consolidan antes de guardar, porque `OrderItem` tiene única
`(orderId, productId, withSalt)`. Con sal y sin sal siguen siendo dos ítems
distintos.
**Lo sostiene:** la **base de datos**, con esa clave única — *estructural*. Es
el más fuerte de todos: un camino que intente duplicar el ítem falla en
Postgres, no en una revisión de código.
→ [create-order.test.ts](../tests/create-order.test.ts): *consolida el mismo
producto y variante en un solo ítem*, *mantiene separadas las dos variantes del
mismo producto*

## Promociones

**Las promociones no se apilan: se aplica solo la mejor.**
Cuando varias califican, gana la que más descuenta en pesos, no la que tiene el
número más grande.
**Lo sostiene:** `calculatePromotions`, el único lugar donde se elige —
*estructural*.
→ [promotions.test.ts](../tests/promotions.test.ts): *aplica solo la promoción
de mayor descuento*, *compara montos reales, no el valor nominal del descuento*

**Una promoción se aplica una vez por cada grupo completo de su condición.**
Y nunca más veces que su `maxApplicableTimes`.
**Lo sostiene:** `calculatePromotions` — *estructural*. Y en la base,
`AppliedPromotion` tiene única `(orderId, promotionId)`, así que un pedido no
puede registrar dos veces la misma promoción aunque el cálculo se equivoque.
→ [promotions.test.ts](../tests/promotions.test.ts): *aplica una vez por cada
grupo completo de la condición*, *respeta el tope de aplicaciones por pedido*

**La condición exige todas sus categorías, y la más escasa manda.**
Un carrito que cumple media condición no descuenta nada.
**Lo sostiene:** `calculatePromotions` — *estructural*.
→ [promotions.test.ts](../tests/promotions.test.ts): *exige TODAS las
categorías de la condición*, *se limita por la categoría más escasa*

**El descuento aplicado se guarda en pesos.**
`AppliedPromotion.discountAmount` registra lo que efectivamente se descontó, no
solo el porcentaje: sin eso un reporte viejo no se puede reconstruir.
**Lo sostiene:** la columna existe, pero llenarla es trabajo de quien guarda el
pedido — *puntual*.
→ [promotions.test.ts](../tests/promotions.test.ts): *expone discountAmount
consistente con el total*

**Solo se consideran las promociones activas de la tienda.**
El filtro vive en la consulta, así que una promoción apagada o de otra tienda no
llega nunca al cálculo. Y si la consulta falla, el pedido se cobra sin descuento
en vez de romperse.
**Lo sostiene:** la consulta misma — *estructural*. Que el filtro esté en el
`where` y no en el código que recorre el resultado es justamente lo que lo hace
imposible de saltear.
→ [check-promotion.test.ts](../tests/check-promotion.test.ts): *pide solo las
activas de esa tienda*, *si la consulta falla y devuelve null, cobra sin
descuento en vez de romper*

**La promoción tiene que aceptar el medio de pago y de envío del pedido.**
Si no los acepta, el pedido se rechaza en vez de aplicarla igual.
**Lo sostiene:** `createOrder` — *puntual*.
→ [create-order.test.ts](../tests/create-order.test.ts): *rechaza la promoción
si el medio de pago no califica*

## Ingredientes, recetas y costos

**La merma se calcula sobre el bruto: `cantidad ÷ (1 − w%)`.**
Es lo que hay que **comprar** para que quede la cantidad neta de la receta, no
un recargo sobre la neta. Con tope del 99% para no dividir por cero.
**Lo sostiene:** `calculateIngredientData`, función pura y única —
*estructural*.
→ [ingredients.test.ts](../tests/ingredients.test.ts): *compra de más para
terminar con la cantidad neta pedida*, *acota la merma al 99% para no dividir
por cero*

**El costo se cobra sobre la cantidad comprada, no sobre la neta.**
**Lo sostiene:** `calculateIngredientData` — *estructural*.
→ [ingredients.test.ts](../tests/ingredients.test.ts): *cobra sobre la cantidad
comprada, no sobre la neta*

**Un pedido sin sal no compra los ingredientes que son solo de la versión con
sal.**
Cada fila de receta declara en qué variante entra (`variantScope`). Antes la
elección del cliente se guardaba pero no llegaba a la lista de compras.
**Lo sostiene:** [production.ts](../helpers/production.ts), compartido por la
pantalla de producción y la exportación a Excel — *estructural*, y esa es
justamente la razón de que los dos números no puedan separarse.
→ [production.test.ts](../tests/production.test.ts): *compra sal solo para las
viandas que la llevan*, *un pedido enteramente sin sal no compra nada de sal*

**Una fila de receta sin variante declarada entra en las dos.**
Es el default `ALWAYS`, y es lo que hace que nada de lo cargado antes de esa
columna cambie de comportamiento.
**Lo sostiene:** el `@default(ALWAYS)` en el esquema — *estructural*: las filas
viejas ya tienen el valor, no dependen de que el código adivine.
→ [recipe-variants.test.ts](../tests/recipe-variants.test.ts): *una fila sin
variante definida se comporta como antes de la columna*

**El costo de referencia de un producto es el de la variante con sal.**
Los márgenes, el form de producto, la lista de recetas y el preview del form de
receta hablan de un producto sin un pedido concreto: se cotiza la versión que
lleva todos los ingredientes, así el margen nunca se muestra inflado.
**Lo sostiene:** [recipe-variants.ts](../helpers/recipe-variants.ts), que las
cuatro pantallas usan — *estructural*.
→ [recipe-variants.test.ts](../tests/recipe-variants.test.ts): *la variante de
referencia de las pantallas de costo es la con sal*

**Todo se expresa en la unidad base: gramos y mililitros.**
La conversión es idempotente, así que aplicarla dos veces no rompe nada.
**Lo sostiene:** `getBaseMeasurement` y `conversionFactors` — *estructural* en
el código. Pero al **cargar** datos es *convención*: el seed del catálogo espera
las cantidades ya en unidad base y nada lo verifica. Equivocarse ahí multiplica
por mil la lista de compras.
→ [ingredients.test.ts](../tests/ingredients.test.ts): *es idempotente:
aplicarlo dos veces no cambia el resultado*

## Tiempo

**Los períodos se calculan en la hora del negocio (Argentina), no en la del
servidor ni en la del navegador.**
Vercel corre en UTC y el navegador del admin puede estar en cualquier lado. Un
pedido de las 22:00 del día 31 pertenece a ese mes, no al siguiente.
**Lo sostiene:** [date-range.ts](../helpers/date-range.ts) y `toBusinessTime`,
compartidos por analytics y producción — *estructural*.
→ [date-range.test.ts](../tests/date-range.test.ts): *un pedido de las 22:00 del
31 cae en ese mes, no en el siguiente*, *la semana arranca el lunes a la
medianoche argentina*

**La semana empieza el lunes.**
**Lo sostiene:** [date-range.ts](../helpers/date-range.ts) — *estructural*.
→ [date-range.test.ts](../tests/date-range.test.ts): *el domingo cierra la
semana que arrancó el lunes previo*

**El día que el usuario elige en un calendario es el día que ve, no el instante
UTC.**
Convertir con `toISOString()` corre la fecha un día en cualquier huso al oeste
de UTC.
**Lo sostiene:** [orders-query.ts](../helpers/orders-query.ts) — *estructural*
para las pantallas que lo usan, pero nada impide que una pantalla nueva llame a
`toISOString()` por su cuenta: ahí vuelve a ser *puntual*.
→ [orders-query.test.ts](../tests/orders-query.test.ts): *usa el día que el
usuario tocó en el calendario, no el instante UTC*

## Pedidos

**Un pedido cancelado es terminal.**
No se lo puede reabrir ni editar. Si se pudiera, un pedido cancelado y
reactivado saltearía todas las revalidaciones de stock y precio.
**Lo sostiene:** `editOrder` — *puntual*. No hay nada en la base que impida
mover un pedido fuera de `CANCELLED`.
→ [edit-order.test.ts](../tests/edit-order.test.ts): *un pedido cancelado es
terminal*

**La dirección de envío tiene que ser del cliente del pedido.**
Se verifica contra la base, no contra lo que mandó el formulario.
**Lo sostiene:** `createOrder` y `editOrder`, cada una por su lado — *puntual*.
→ [edit-order.test.ts](../tests/edit-order.test.ts): *rechaza una dirección que
es de otro cliente* · [create-order.test.ts](../tests/create-order.test.ts):
*rechaza una dirección que no es del cliente*

**Cambiar el método de envío reemplaza el costo anterior, no lo acumula.**
**Lo sostiene:** `editOrder`, que recalcula en vez de sumar — *puntual*.
→ [edit-order.test.ts](../tests/edit-order.test.ts): *no cobra dos veces el
envío al reeditar un pedido que ya lo tenía*

**No se puede comprar lo que no está a la venta.**
Sin stock, oculto, inexistente o de otra tienda: se rechaza el pedido entero.
**Lo sostiene:** `createOrder` — *puntual*. La vitrina además lo muestra
deshabilitado, pero eso es cortesía: la regla la aplica el servidor.
→ [create-order.test.ts](../tests/create-order.test.ts): *rechaza un producto
sin stock*, *rechaza un producto que no existe o está oculto*, *rechaza un
producto de otra tienda*

**Un cliente solo puede cancelar sus propios pedidos, y solo si están
pendientes.**
El id del pedido viaja desde el navegador, así que la pertenencia se verifica
contra la base. Un pedido ajeno responde lo mismo que uno inexistente, para no
delatar cuál es cuál.
**Lo sostiene:** `cancelCustomerOrder` — *puntual*.
→ [cancel-customer-order.test.ts](../tests/cancel-customer-order.test.ts): *no
deja cancelar el pedido de otro cliente*, *responde lo mismo si el pedido no
existe, sin delatar cuál es cuál*, *solo cancela pedidos pendientes*

**La tienda puede mostrar el catálogo sin tomar pedidos.**
`Shop.acceptsOrders` en false deja la vitrina navegable y apaga la venta: no
hay botón de carrito, el detalle no deja agregar, el checkout redirige y el
servidor rechaza. El interruptor manda sobre el horario de atención, para no
prometerle al cliente un horario en el que igual no va a poder pedir.
**Lo sostiene:** [shop-ordering.ts](../helpers/shop-ordering.ts) concentra la
decisión —*estructural* para las cuatro capas de la vitrina— pero el rechazo del
servidor vive en `createOrder`, que es *puntual*.
→ [shop-ordering.test.ts](../tests/shop-ordering.test.ts): *no se puede pedir,
aunque esté dentro del horario*, *el interruptor manda sobre el horario, para no
prometer un horario que no sirve* ·
[create-order.test.ts](../tests/create-order.test.ts): *rechaza el pedido que
viene de la tienda* · [product-stock.test.tsx](../tests/product-stock.test.tsx):
*no deja agregar cuando la tienda no está tomando pedidos*

**Ese interruptor no frena la carga manual desde el panel.**
El negocio puede seguir tomando pedidos por teléfono con la web apagada. El
horario de atención, en cambio, sigue valiendo para los dos.
**Lo sostiene:** `createOrder`, mirando el `origin` del pedido — *puntual*.
→ [create-order.test.ts](../tests/create-order.test.ts): *deja que el panel siga
cargando pedidos a mano*, *el horario sigue valiendo para el panel*

**Una suscripción no genera pedidos si su tienda no los está tomando.**
El cron no pasa por `createOrder`, así que sin esta comprobación una tienda con
la venta apagada seguiría generando pedidos sola cada semana. Se saltea sin
marcarla como corrida, así retoma sola al reabrir.
**Lo sostiene:** [generate-orders.ts](../lib/subscriptions/generate-orders.ts) —
*puntual*, y es **el ejemplo que le puso precio a esta columna**: la regla ya
existía en `createOrder` y aun así hubo que volver a escribirla acá, porque
`prisma.order.create` directo es una tercera puerta. Cualquier puerta nueva la
necesita otra vez.
→ [generate-subscription-orders.test.ts](../tests/generate-subscription-orders.test.ts):
*no genera nada si la tienda no está tomando pedidos*, *no marca la suscripción
como corrida, así retoma sola al reabrir*

**Un producto sin stock se ve como tal y no se puede agregar al carrito.**
Es la otra mitad de la regla anterior: el servidor rechaza el pedido igual, pero
si el botón siguiera habilitado el cliente armaría todo el carrito y recién se
enteraría al confirmar. Vale para las dos vistas del detalle, la de escritorio y
la de móvil.
**Lo sostiene:** cada vista del detalle por su cuenta — *puntual*, y por eso el
test cubre las dos: son dos componentes distintos con la misma regla escrita dos
veces.
→ [product-stock.test.tsx](../tests/product-stock.test.tsx): *muestra el cartel
cuando no hay stock*, *dice Sin stock y deshabilita el botón cuando no hay*, *no
agrega nada al carrito aunque le hagan clic igual*

**El medio de pago y el de envío tienen que estar habilitados por la tienda.**
**Lo sostiene:** `createOrder` — *puntual*.
→ [create-order.test.ts](../tests/create-order.test.ts): *rechaza un método de
pago que la tienda no habilitó*, *rechaza un método de envío que la tienda no
habilitó*

**Un retiro no guarda dirección y un envío no guarda sucursal.**
Los campos que no aplican quedan en `null` en vez de arrastrar datos que
después confunden los reportes.
**Lo sostiene:** `createOrder` — *puntual*. El esquema permite las dos columnas
llenas a la vez; que no pase depende del código.
→ [create-order.test.ts](../tests/create-order.test.ts): *un retiro no guarda
dirección ni cobra envío*, *un envío a domicilio no guarda sucursal*

## Pagos con Mercado Pago

**El webhook es la única fuente de verdad de un cobro.**
El regreso del cliente al sitio no es comprobante de nada.
**Lo sostiene:** que la página de vuelta simplemente no escriba el estado —
*convención*. Nada impide que una pantalla futura marque el pedido como pagado
al volver; que hoy no lo haga es una decisión, no una barrera.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts): *no
confía en el estado que trae el cuerpo, relee el pago*

**Nada del cuerpo de la notificación se cree sin verificar.**
Primero se valida la firma —con tolerancia de 300 s, para acotar el reenvío de
una notificación vieja— y recién después se consulta el pago contra la API de
Mercado Pago.
**Lo sostiene:** el orden de las líneas en la ruta del webhook — *puntual*.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts):
*rechaza una firma inválida con 401*, *valida la firma antes de consultar el
pago* · [mercado-pago.test.ts](../tests/mercado-pago.test.ts): *rechaza una
notificación vieja reenviada*, *rechaza si cambia el id del pago (no se puede
reusar una firma)*

**Un pago aprobado por un importe distinto al del pedido no lo marca pagado.**
Se registra para revisarlo a mano.
**Lo sostiene:** la comparación en el webhook — *puntual*. El margen de 0,01 es
ruido de punto flotante, **no** tolerancia de negocio: un pago un centavo corto
se rechaza, y eso es lo correcto.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts): *no da
por pagado un importe distinto al del pedido*

**Solo `approved` es pagado; cualquier otro estado queda pendiente.**
Incluidos los estados que Mercado Pago agregue en el futuro: es preferible
revisar un pago a mano antes que dar por cobrado algo que no lo está.
**Lo sostiene:** `toPaymentStatus` en
[payment-status.ts](../lib/mercado-pago/payment-status.ts), única traducción de
estados y cerrada por defecto — *estructural*.
→ [mercado-pago.test.ts](../tests/mercado-pago.test.ts): *ante un estado
desconocido no asume que está pagado* ·
[mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts): *deja
pendiente un estado que no conoce*

**Ante una falla transitoria el webhook responde 500, para que reintenten.**
Lo que sí procesó, o lo que decidió ignorar, responde 200 para que Mercado Pago
no reintente para siempre.
**Lo sostiene:** el `try/catch` de la ruta — *puntual*.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts):
*responde 500 ante una falla transitoria, para que reintenten*

## Suscripciones

**El importe del débito automático es fijo.**
Es el del pedido que originó la suscripción. Mercado Pago cobra en su propio
calendario y solo permite cambiar el importe, no la fecha: con un monto variable
habría una carrera entre nuestra actualización y su cobro, y el cliente podría
pagar un importe que no corresponde.
**Lo sostiene:** que la preaprobación se cree con un importe y nunca se
actualice — *convención*. La API de Mercado Pago permitiría cambiarlo; no
hacerlo es la decisión.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts): *salda
el pedido pendiente cuando el importe coincide*

**Si el pedido de la semana sale distinto, se cobra igual y se anota la
diferencia.**
El cliente pagó lo que autorizó. La diferencia queda en `order.notes` para
conciliarla.
**Lo sostiene:** `reconcileRecurringCharge` decide, el webhook anota —
*puntual*.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts): *cobra
igual y anota la diferencia cuando el pedido cambió de precio* ·
[preapproval.test.ts](../tests/preapproval.test.ts): *marca pagado igual si el
pedido salió más caro, y reporta la diferencia*

**Una suscripción genera pedidos solo mientras el débito esté autorizado en
Mercado Pago.**
El cliente puede pausar o cancelar desde su cuenta de Mercado Pago sin pasar por
la aplicación, así que el estado se relee de allá.
**Lo sostiene:** `isPreapprovalActive` como única lectura del estado —
*estructural*.
→ [preapproval.test.ts](../tests/preapproval.test.ts): *solo habilita con la
autorización vigente* ·
[mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts):
*desactiva la suscripción si el cliente la canceló en Mercado Pago*

**Pausar o cancelar va a Mercado Pago antes que a la base, y si esa llamada
falla la operación se rechaza entera.**
Es el invariante más caro de todos: borrar la suscripción local sin cancelar la
preaprobación dejaría al cliente debitándose todas las semanas sin forma de
frenarlo desde la aplicación.
**Lo sostiene:** el orden de dos llamadas dentro de `manage-subscription` —
*puntual*, y es la peor combinación que hay acá: consecuencia máxima, garantía
mínima. Por eso el test afirma el **orden real** de las llamadas y no solo el
resultado.
→ [manage-subscription.test.ts](../tests/manage-subscription.test.ts): *pausa
primero en Mercado Pago y después acá*, *cancela el débito en Mercado Pago antes
de borrar*, *si no se pudo cancelar el débito, la suscripción no se borra*, *si
Mercado Pago falla, no se pausa nada acá*

**No se reanuda un débito que el cliente nunca autorizó.**
Una preaprobación pendiente sigue pendiente hasta que la autorice con su
tarjeta.
**Lo sostiene:** `manage-subscription` — *puntual*.
→ [manage-subscription.test.ts](../tests/manage-subscription.test.ts): *no
reanuda un débito que el cliente nunca autorizó*

**La generación es idempotente y compara días del negocio, no instantes.**
El cron corre en UTC; sin esto una corrida de más duplicaría pedidos.
**Lo sostiene:** [subscriptions.ts](../helpers/subscriptions.ts) y el campo
`lastRunAt` — *estructural* mientras la comparación siga viviendo en ese helper.
→ [subscriptions.test.ts](../tests/subscriptions.test.ts): *no repite el pedido
si ya corrió hoy*, *compara días del negocio, no instantes*

**El endpoint del cron exige el secreto con el prefijo `Bearer`.**
Es lo único que lo protege, y la comparación es en tiempo constante.
**Lo sostiene:** [cron/auth.ts](../lib/cron/auth.ts) — *estructural*: sin la
variable el endpoint responde 503 y no genera nada, así que el modo inseguro es
no funcionar.
→ [cron-subscriptions.test.ts](../tests/cron-subscriptions.test.ts): *rechaza el
secreto correcto sin el prefijo Bearer* ·
[subscriptions.test.ts](../tests/subscriptions.test.ts): *no se deja pasar por un
prefijo del secreto*

## Avisos por mail

**Un mail que falla no rompe la operación que lo disparó.**
Los avisos —detalle del pedido, bienvenida, cambio de estado— devuelven `false` y
loguean. Si una caída de Resend cancelara la compra, el cliente perdería el
pedido por algo que no es su problema.
**Lo sostiene:** el `try/catch` de cada aviso — *puntual*: un aviso nuevo que se
olvide el `try/catch` sí puede tumbar la operación que lo dispara.
→ [mail.test.ts](../tests/mail.test.ts): *el detalle del pedido devuelve false
en vez de romper la compra*

**Los mails críticos sí fallan ruidosamente.**
Verificación de cuenta y reseteo de contraseña: sin ese link el usuario queda
trabado, así que es mejor que la operación falle y se pueda reintentar.
**Lo sostiene:** la **ausencia** de `try/catch` en esas dos funciones —
*convención*. Es el invariante más fácil de romper sin darse cuenta: alcanza con
que alguien "arregle" un error envolviéndolo.
→ [mail.test.ts](../tests/mail.test.ts): *la verificación falla ruidosamente,
porque el usuario necesita ese link*

**Un envío que Resend rechaza cuenta como fallado.**
Resend **no** rechaza la promesa cuando la API rechaza el envío: devuelve
`{ data, error }`, y hasta una caída de red llega por ese campo. Sin leerlo, un
mail que nunca salió es indistinguible de uno entregado, y las dos reglas de
arriba se cumplen solo de palabra: los avisos informarían `true` y la
verificación no fallaría nunca. Por eso todos los envíos pasan por un solo
lugar, `enviar` en [mail.ts](../lib/mail/mail.ts), que traduce ese campo a una
excepción y deja que cada llamador aplique su política.
**Lo sostiene:** el helper `enviar`, por el que pasan los cinco envíos —
*estructural*: un mail nuevo que lo use hereda la comprobación.
→ [mail.test.ts](../tests/mail.test.ts): *no dan por enviado un mail que Resend
rechazó*, *y también cuando la promesa se rechaza de verdad*

**Solo se avisa un cambio de estado si el estado efectivamente cambió.**
Guardar un pedido sin tocarlo no le llena la casilla al cliente. Y `PENDING` no
notifica nunca: el cliente acaba de hacer el pedido.
**Lo sostiene:** la comparación en `editOrder`, y `orderStatusSubject`, que
devuelve `null` para los estados que no avisan — *estructural* esta segunda
mitad: sin asunto no se manda nada, venga de donde venga.
→ [edit-order.test.ts](../tests/edit-order.test.ts): *no avisa si guardan el
pedido sin cambiarle el estado* ·
[order-status-email.test.ts](../tests/order-status-email.test.ts): *no avisa
cuando el pedido queda pendiente*

## Permisos y acceso

**El proxy exige sesión en todo, salvo lo que se autentica solo.**
Pasan sin sesión las rutas de NextAuth, los webhooks —que validan su firma— y el
cron —que valida su secreto—, más un puñado de rutas de vitrina y solo por GET.
Lo que no está en esa lista, incluido lo que todavía no existe, exige sesión.
**Lo sostiene:** `resolveRouteAccess` en
[route-access.ts](../lib/auth/route-access.ts), que decide por lista blanca —
*estructural*: una ruta nueva nace protegida sin que nadie haga nada.
→ [route-access.test.ts](../tests/route-access.test.ts): *protege la API de
pedidos*, *una ruta que no existe también queda protegida*, *una ruta pública de
solo lectura sigue protegida por POST*

**Ese permiso se corta en el límite del segmento, no por prefijo de texto.**
`/api/webhooks` cubre `/api/webhooks/mercado-pago`, pero no una futura
`/api/webhooks-internos`, que quedaría abierta a internet por parecerse.
**Lo sostiene:** `resolveRouteAccess` — *estructural*. Antes comparaba por
prefijo de texto y el corte por segmento se agregó justamente al testearla.
→ [route-access.test.ts](../tests/route-access.test.ts): *una ruta que solo
empieza parecido no queda sin autenticar*, *pero sí cubre el prefijo exacto y lo
que cuelga debajo*

**La lista de rutas públicas se compara exacta, no por prefijo.**
Es el mismo riesgo visto del otro lado: listar `/api/algo` no vuelve pública a
`/api/algo/loquesea`. Por eso la consulta de zonas de envío exige sesión —solo
la llaman el checkout y el panel, los dos detrás del login—, y abrirla tendría
que ser una decisión, no un descuido.
**Lo sostiene:** `resolveRouteAccess` — *estructural*.
→ [route-access.test.ts](../tests/route-access.test.ts): *la lista de rutas
públicas se compara exacta, no por prefijo*, *la consulta de zonas de envío
exige sesión*

**Cada acción del panel verifica el permiso correspondiente, del lado del
servidor.**
Esconder un botón no es un permiso.
**Lo sostiene:** cada acción, una por una — *puntual*. `hasPermission` es
compartida, pero **llamarla** es decisión de quien escribe la acción: una acción
nueva que se olvide queda abierta a cualquier sesión.
→ [create-order.test.ts](../tests/create-order.test.ts): *desde el panel exige
el permiso create:orders* · [edit-order.test.ts](../tests/edit-order.test.ts):
*rechaza a quien no tiene el permiso update:orders* ·
[helpers.test.ts](../tests/helpers.test.ts): *no confunde la acción con el
sujeto*

---

## Qué se lee mirando la columna entera

Contando menciones —algunas reglas son estructurales de un lado y puntuales del
otro, así que la suma no da el número de invariantes— quedan **26 estructurales,
25 puntuales y 4 de pura convención**.

Que casi la mitad sea *puntual* no es una falla: muchas reglas de negocio no se
pueden expresar como una restricción de Postgres. Lo que sí conviene leer de
ahí:

- **Las cuatro de convención son las que hay que mirar primero al tocar su
  zona.** Que los mails críticos fallen ruidosamente depende de que nadie
  envuelva esas dos funciones en un `try/catch` "para que no rompa". Que el
  regreso del cliente no marque un pago depende de que ninguna pantalla futura
  decida marcarlo. Que el importe del débito sea fijo depende de que nadie
  actualice la preaprobación. Y que las cantidades de receta entren en unidad
  base depende de quien carga los datos.
- **Las puntuales se rompen abriendo puertas, no editando código.** El caso del
  cron de suscripciones no fue un error de programación: fue una entrada nueva a
  la que la regla vieja no llegaba. Cuando aparezca una cuarta puerta —una API
  pública, una importación masiva, un panel nuevo— hay que recorrer las
  puntuales de la sección Pedidos y volver a aplicarlas.
- **Convertir una puntual en estructural es la mejor inversión que hay acá.** La
  clave única `(orderId, productId, withSalt)` hace que un invariante entero se
  cumpla solo, para siempre y por cualquier camino. `enviar` en `mail.ts` acaba
  de hacer lo mismo con los mails.

## Invariantes sin test

Ninguno: hoy todos los de arriba tienen su test.

Cuando aparezca una regla nueva que todavía no se pueda sostener con un test,
va acá, con el archivo donde vive. Es preferible una lista corta de deudas
anotadas que una regla que solo existe en la cabeza de alguien.
