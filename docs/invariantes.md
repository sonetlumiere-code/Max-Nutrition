# Invariantes del negocio

Las reglas que tienen que seguir siendo ciertas después de cualquier cambio.
No están acá las que se leen solas en el código: están las que costaron una
decisión, las que no se ven mirando una función suelta, y las que si se rompen
hacen perder plata o confianza en silencio.

Cada invariante dice **qué** y **por qué**, y apunta al test que lo sostiene. Si
un cambio hace fallar uno de esos tests, la pregunta no es cómo arreglar el
test: es si de verdad se quiere cambiar la regla. Al final está la lista de las
que todavía no tienen test, que es el backlog.

Para correr todo: `npm test`.

---

## Precios y totales

**El precio de venta lo pone el servidor, nunca el cliente.**
La acción relee cada producto de la base y usa ese precio, ignorando cualquier
importe que venga en el pedido. Es la diferencia entre una tienda y una
donación.
→ [create-order.test.ts](../tests/create-order.test.ts): *cobra el precio de la
base, no el que mandó el cliente*

**El precio unitario queda congelado en el pedido.**
`OrderItem.unitPrice` guarda lo que costaba la vianda cuando se vendió. Si
mañana sube el precio, un pedido viejo no se reescribe solo: los históricos y
los reportes tienen que seguir cerrando.
→ [create-order.test.ts](../tests/create-order.test.ts): *congela el precio
unitario al momento de la venta*

**El envío se suma después del descuento, nunca antes.**
Si se sumara antes, la promoción terminaría descontando parte del flete.
→ [subscriptions.test.ts](../tests/subscriptions.test.ts): *suma el envío
después del descuento*

**Los importes se redondean a dos decimales.**
Son pesos, no flotantes libres. Sin esto la suma de un pedido y su total dejan
de coincidir por centésimas invisibles.
→ [subscriptions.test.ts](../tests/subscriptions.test.ts): *redondea a dos
decimales*, *no arrastra errores de punto flotante*

**El precio final nunca baja de cero.**
Un descuento mayor que el subtotal deja el pedido en cero, no en negativo.
→ [promotions.test.ts](../tests/promotions.test.ts): *acota el precio final en
cero aunque el descuento lo supere*

**Un mismo producto y variante es un solo ítem del pedido.**
Se consolidan antes de guardar, porque `OrderItem` tiene única
`(orderId, productId, withSalt)`. Con sal y sin sal siguen siendo dos ítems
distintos.
→ [create-order.test.ts](../tests/create-order.test.ts): *consolida el mismo
producto y variante en un solo ítem*, *mantiene separadas las dos variantes del
mismo producto*

## Promociones

**Las promociones no se apilan: se aplica solo la mejor.**
Cuando varias califican, gana la que más descuenta en pesos, no la que tiene el
número más grande.
→ [promotions.test.ts](../tests/promotions.test.ts): *aplica solo la promoción
de mayor descuento*, *compara montos reales, no el valor nominal del descuento*

**Una promoción se aplica una vez por cada grupo completo de su condición.**
Y nunca más veces que su `maxApplicableTimes`.
→ [promotions.test.ts](../tests/promotions.test.ts): *aplica una vez por cada
grupo completo de la condición*, *respeta el tope de aplicaciones por pedido*

**La condición exige todas sus categorías, y la más escasa manda.**
Un carrito que cumple media condición no descuenta nada.
→ [promotions.test.ts](../tests/promotions.test.ts): *exige TODAS las
categorías de la condición*, *se limita por la categoría más escasa*

**El descuento aplicado se guarda en pesos.**
`AppliedPromotion.discountAmount` registra lo que efectivamente se descontó, no
solo el porcentaje: sin eso un reporte viejo no se puede reconstruir.
→ [promotions.test.ts](../tests/promotions.test.ts): *expone discountAmount
consistente con el total*

**Solo se consideran las promociones activas de la tienda.**
El filtro vive en la consulta, así que una promoción apagada o de otra tienda no
llega nunca al cálculo. Y si la consulta falla, el pedido se cobra sin descuento
en vez de romperse.
→ [check-promotion.test.ts](../tests/check-promotion.test.ts): *pide solo las
activas de esa tienda*, *si la consulta falla y devuelve null, cobra sin
descuento en vez de romper*

**La promoción tiene que aceptar el medio de pago y de envío del pedido.**
Si no los acepta, el pedido se rechaza en vez de aplicarla igual.
→ [create-order.test.ts](../tests/create-order.test.ts): *rechaza la promoción
si el medio de pago no califica*

## Ingredientes, recetas y costos

**La merma se calcula sobre el bruto: `cantidad ÷ (1 − w%)`.**
Es lo que hay que **comprar** para que quede la cantidad neta de la receta, no
un recargo sobre la neta. Con tope del 99% para no dividir por cero.
→ [ingredients.test.ts](../tests/ingredients.test.ts): *compra de más para
terminar con la cantidad neta pedida*, *acota la merma al 99% para no dividir
por cero*

**El costo se cobra sobre la cantidad comprada, no sobre la neta.**
→ [ingredients.test.ts](../tests/ingredients.test.ts): *cobra sobre la cantidad
comprada, no sobre la neta*

**Un pedido sin sal no compra los ingredientes que son solo de la versión con
sal.**
Cada fila de receta declara en qué variante entra (`variantScope`). Antes la
elección del cliente se guardaba pero no llegaba a la lista de compras.
→ [production.test.ts](../tests/production.test.ts): *compra sal solo para las
viandas que la llevan*, *un pedido enteramente sin sal no compra nada de sal*

**Una fila de receta sin variante declarada entra en las dos.**
Es el default `ALWAYS`, y es lo que hace que nada de lo cargado antes de esa
columna cambie de comportamiento.
→ [recipe-variants.test.ts](../tests/recipe-variants.test.ts): *una fila sin
variante definida se comporta como antes de la columna*

**El costo de referencia de un producto es el de la variante con sal.**
Los márgenes, el form de producto, la lista de recetas y el preview del form de
receta hablan de un producto sin un pedido concreto: se cotiza la versión que
lleva todos los ingredientes, así el margen nunca se muestra inflado.
→ [recipe-variants.test.ts](../tests/recipe-variants.test.ts): *la variante de
referencia de las pantallas de costo es la con sal*

**Todo se expresa en la unidad base: gramos y mililitros.**
La conversión es idempotente, así que aplicarla dos veces no rompe nada.
→ [ingredients.test.ts](../tests/ingredients.test.ts): *es idempotente:
aplicarlo dos veces no cambia el resultado*

## Tiempo

**Los períodos se calculan en la hora del negocio (Argentina), no en la del
servidor ni en la del navegador.**
Vercel corre en UTC y el navegador del admin puede estar en cualquier lado. Un
pedido de las 22:00 del día 31 pertenece a ese mes, no al siguiente.
→ [date-range.test.ts](../tests/date-range.test.ts): *un pedido de las 22:00 del
31 cae en ese mes, no en el siguiente*, *la semana arranca el lunes a la
medianoche argentina*

**La semana empieza el lunes.**
→ [date-range.test.ts](../tests/date-range.test.ts): *el domingo cierra la
semana que arrancó el lunes previo*

**El día que el usuario elige en un calendario es el día que ve, no el instante
UTC.**
Convertir con `toISOString()` corre la fecha un día en cualquier huso al oeste
de UTC.
→ [orders-query.test.ts](../tests/orders-query.test.ts): *usa el día que el
usuario tocó en el calendario, no el instante UTC*

## Pedidos

**Un pedido cancelado es terminal.**
No se lo puede reabrir ni editar. Si se pudiera, un pedido cancelado y
reactivado saltearía todas las revalidaciones de stock y precio.
→ [edit-order.test.ts](../tests/edit-order.test.ts): *un pedido cancelado es
terminal*

**La dirección de envío tiene que ser del cliente del pedido.**
Se verifica contra la base, no contra lo que mandó el formulario.
→ [edit-order.test.ts](../tests/edit-order.test.ts): *rechaza una dirección que
es de otro cliente* · [create-order.test.ts](../tests/create-order.test.ts):
*rechaza una dirección que no es del cliente*

**Cambiar el método de envío reemplaza el costo anterior, no lo acumula.**
→ [edit-order.test.ts](../tests/edit-order.test.ts): *no cobra dos veces el
envío al reeditar un pedido que ya lo tenía*

**No se puede comprar lo que no está a la venta.**
Sin stock, oculto, inexistente o de otra tienda: se rechaza el pedido entero.
→ [create-order.test.ts](../tests/create-order.test.ts): *rechaza un producto
sin stock*, *rechaza un producto que no existe o está oculto*, *rechaza un
producto de otra tienda*

**Un cliente solo puede cancelar sus propios pedidos, y solo si están
pendientes.**
El id del pedido viaja desde el navegador, así que la pertenencia se verifica
contra la base. Un pedido ajeno responde lo mismo que uno inexistente, para no
delatar cuál es cuál.
→ [cancel-customer-order.test.ts](../tests/cancel-customer-order.test.ts): *no
deja cancelar el pedido de otro cliente*, *responde lo mismo si el pedido no
existe, sin delatar cuál es cuál*, *solo cancela pedidos pendientes*

**Un producto sin stock se ve como tal y no se puede agregar al carrito.**
Es la otra mitad de la regla anterior: el servidor rechaza el pedido igual, pero
si el botón siguiera habilitado el cliente armaría todo el carrito y recién se
enteraría al confirmar. Vale para las dos vistas del detalle, la de escritorio y
la de móvil.
→ [product-stock.test.tsx](../tests/product-stock.test.tsx): *muestra el cartel
cuando no hay stock*, *dice Sin stock y deshabilita el botón cuando no hay*, *no
agrega nada al carrito aunque le hagan clic igual*

**El medio de pago y el de envío tienen que estar habilitados por la tienda.**
→ [create-order.test.ts](../tests/create-order.test.ts): *rechaza un método de
pago que la tienda no habilitó*, *rechaza un método de envío que la tienda no
habilitó*

**Un retiro no guarda dirección y un envío no guarda sucursal.**
Los campos que no aplican quedan en `null` en vez de arrastrar datos que
después confunden los reportes.
→ [create-order.test.ts](../tests/create-order.test.ts): *un retiro no guarda
dirección ni cobra envío*, *un envío a domicilio no guarda sucursal*

## Pagos con Mercado Pago

**El webhook es la única fuente de verdad de un cobro.**
El regreso del cliente al sitio no es comprobante de nada.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts): *no
confía en el estado que trae el cuerpo, relee el pago*

**Nada del cuerpo de la notificación se cree sin verificar.**
Primero se valida la firma —con tolerancia de 300 s, para acotar el reenvío de
una notificación vieja— y recién después se consulta el pago contra la API de
Mercado Pago.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts):
*rechaza una firma inválida con 401*, *valida la firma antes de consultar el
pago* · [mercado-pago.test.ts](../tests/mercado-pago.test.ts): *rechaza una
notificación vieja reenviada*, *rechaza si cambia el id del pago (no se puede
reusar una firma)*

**Un pago aprobado por un importe distinto al del pedido no lo marca pagado.**
Se registra para revisarlo a mano.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts): *no da
por pagado un importe distinto al del pedido*

**Solo `approved` es pagado; cualquier otro estado queda pendiente.**
Incluidos los estados que Mercado Pago agregue en el futuro: es preferible
revisar un pago a mano antes que dar por cobrado algo que no lo está.
→ [mercado-pago.test.ts](../tests/mercado-pago.test.ts): *ante un estado
desconocido no asume que está pagado* ·
[mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts): *deja
pendiente un estado que no conoce*

**Ante una falla transitoria el webhook responde 500, para que reintenten.**
Lo que sí procesó, o lo que decidió ignorar, responde 200 para que Mercado Pago
no reintente para siempre.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts):
*responde 500 ante una falla transitoria, para que reintenten*

## Suscripciones

**El importe del débito automático es fijo.**
Es el del pedido que originó la suscripción. Mercado Pago cobra en su propio
calendario y solo permite cambiar el importe, no la fecha: con un monto variable
habría una carrera entre nuestra actualización y su cobro, y el cliente podría
pagar un importe que no corresponde.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts): *salda
el pedido pendiente cuando el importe coincide*

**Si el pedido de la semana sale distinto, se cobra igual y se anota la
diferencia.**
El cliente pagó lo que autorizó. La diferencia queda en `order.notes` para
conciliarla.
→ [mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts): *cobra
igual y anota la diferencia cuando el pedido cambió de precio* ·
[preapproval.test.ts](../tests/preapproval.test.ts): *marca pagado igual si el
pedido salió más caro, y reporta la diferencia*

**Una suscripción genera pedidos solo mientras el débito esté autorizado en
Mercado Pago.**
El cliente puede pausar o cancelar desde su cuenta de Mercado Pago sin pasar por
la aplicación, así que el estado se relee de allá.
→ [preapproval.test.ts](../tests/preapproval.test.ts): *solo habilita con la
autorización vigente* ·
[mercado-pago-webhook.test.ts](../tests/mercado-pago-webhook.test.ts):
*desactiva la suscripción si el cliente la canceló en Mercado Pago*

**Pausar o cancelar va a Mercado Pago antes que a la base, y si esa llamada
falla la operación se rechaza entera.**
Es el invariante más caro de todos: borrar la suscripción local sin cancelar la
preaprobación dejaría al cliente debitándose todas las semanas sin forma de
frenarlo desde la aplicación.
→ [manage-subscription.test.ts](../tests/manage-subscription.test.ts): *pausa
primero en Mercado Pago y después acá*, *cancela el débito en Mercado Pago antes
de borrar*, *si no se pudo cancelar el débito, la suscripción no se borra*, *si
Mercado Pago falla, no se pausa nada acá*

**No se reanuda un débito que el cliente nunca autorizó.**
Una preaprobación pendiente sigue pendiente hasta que la autorice con su
tarjeta.
→ [manage-subscription.test.ts](../tests/manage-subscription.test.ts): *no
reanuda un débito que el cliente nunca autorizó*

**La generación es idempotente y compara días del negocio, no instantes.**
El cron corre en UTC; sin esto una corrida de más duplicaría pedidos.
→ [subscriptions.test.ts](../tests/subscriptions.test.ts): *no repite el pedido
si ya corrió hoy*, *compara días del negocio, no instantes*

**El endpoint del cron exige el secreto con el prefijo `Bearer`.**
Es lo único que lo protege, y la comparación es en tiempo constante.
→ [cron-subscriptions.test.ts](../tests/cron-subscriptions.test.ts): *rechaza el
secreto correcto sin el prefijo Bearer* ·
[subscriptions.test.ts](../tests/subscriptions.test.ts): *no se deja pasar por un
prefijo del secreto*

## Avisos por mail

**Un mail que falla no rompe la operación que lo disparó.**
Los avisos —detalle del pedido, bienvenida, cambio de estado— devuelven `false` y
loguean. Si una caída de Resend cancelara la compra, el cliente perdería el
pedido por algo que no es su problema.
→ [mail.test.ts](../tests/mail.test.ts): *el detalle del pedido devuelve false
en vez de romper la compra*

**Los mails críticos sí fallan ruidosamente.**
Verificación de cuenta y reseteo de contraseña: sin ese link el usuario queda
trabado, así que es mejor que la operación falle y se pueda reintentar.
→ [mail.test.ts](../tests/mail.test.ts): *la verificación falla ruidosamente,
porque el usuario necesita ese link*

**Solo se avisa un cambio de estado si el estado efectivamente cambió.**
Guardar un pedido sin tocarlo no le llena la casilla al cliente. Y `PENDING` no
notifica nunca: el cliente acaba de hacer el pedido.
→ [edit-order.test.ts](../tests/edit-order.test.ts): *no avisa si guardan el
pedido sin cambiarle el estado* ·
[order-status-email.test.ts](../tests/order-status-email.test.ts): *no avisa
cuando el pedido queda pendiente*

## Permisos y acceso

**El middleware exige sesión en todo, salvo lo que se autentica solo.**
Pasan sin sesión las rutas de NextAuth, los webhooks —que validan su firma— y el
cron —que valida su secreto—, más un puñado de rutas de vitrina y solo por GET.
Lo que no está en esa lista, incluido lo que todavía no existe, exige sesión.
→ [route-access.test.ts](../tests/route-access.test.ts): *protege la API de
pedidos*, *una ruta que no existe también queda protegida*, *una ruta pública de
solo lectura sigue protegida por POST*

**Ese permiso se corta en el límite del segmento, no por prefijo de texto.**
`/api/webhooks` cubre `/api/webhooks/mercado-pago`, pero no una futura
`/api/webhooks-internos`, que quedaría abierta a internet por parecerse.
→ [route-access.test.ts](../tests/route-access.test.ts): *una ruta que solo
empieza parecido no queda sin autenticar*, *pero sí cubre el prefijo exacto y lo
que cuelga debajo*

**La lista de rutas públicas se compara exacta, no por prefijo.**
Es el mismo riesgo visto del otro lado: listar `/api/algo` no vuelve pública a
`/api/algo/loquesea`. Por eso la consulta de zonas de envío exige sesión —solo
la llaman el checkout y el panel, los dos detrás del login—, y abrirla tendría
que ser una decisión, no un descuido.
→ [route-access.test.ts](../tests/route-access.test.ts): *la lista de rutas
públicas se compara exacta, no por prefijo*, *la consulta de zonas de envío
exige sesión*

**Cada acción del panel verifica el permiso correspondiente, del lado del
servidor.**
Esconder un botón no es un permiso.
→ [create-order.test.ts](../tests/create-order.test.ts): *desde el panel exige
el permiso create:orders* · [edit-order.test.ts](../tests/edit-order.test.ts):
*rechaza a quien no tiene el permiso update:orders* ·
[helpers.test.ts](../tests/helpers.test.ts): *no confunde la acción con el
sujeto*

---

## Invariantes sin test

Ninguno: hoy todos los de arriba tienen su test.

Cuando aparezca una regla nueva que todavía no se pueda sostener con un test,
va acá, con el archivo donde vive. Es preferible una lista corta de deudas
anotadas que una regla que solo existe en la cabeza de alguien.
