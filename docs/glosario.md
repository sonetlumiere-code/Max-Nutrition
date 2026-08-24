# Glosario

Las palabras que este proyecto usa con un significado propio, y dónde vive cada
una en el código. Están acá las que no se entienden solas: si el término
significa exactamente lo que parece, no está.

Los nombres del negocio están en español y los del código en inglés, así que
casi cada entrada tiene las dos formas. Cuando no coinciden —merma es `waste`,
bolsón es `Bags`— la traducción es justamente lo que hay que saber.

---

## El negocio

**Vianda**
La comida preparada que se vende, lista para calentar. En el código es un
`Product` como cualquier otro; la palabra aparece en los textos al cliente.

**Sin TACC**
Sin trazas de gluten. Es la razón de ser del negocio, no una característica:
todo el catálogo lo es, así que no hay ningún campo que lo marque.

**Panel** y **vitrina**
Las dos mitades de la aplicación. El **panel** es el dashboard, detrás del
login, donde el negocio carga pedidos y gestiona el catálogo — vive en
`app/(dashboard)`. La **vitrina** es la tienda pública que ve el cliente, en
`app/(shop)`. Muchas reglas valen distinto de cada lado, así que conviene decir
cuál.

## Tiendas

**Tienda** (`Shop`)
Hay dos, y son negocios distintos dentro de la misma aplicación: **Viandas**
(`FOOD`) y **Pastelería** (`BAKERY`), según el enum `ShopCategory`. Casi todo
—productos, promociones, pedidos, horarios— cuelga de una tienda.

**`shopKey`**
El identificador corto de la tienda que viaja en la URL: `/[shopKey]/...`. Es la
columna `key` de `Shop`, y es única.

**Modo catálogo** (`Shop.acceptsOrders` en `false`)
La tienda muestra el menú y los precios pero no toma pedidos: sin botón de
carrito, el detalle no deja agregar y el servidor rechaza. **No** es lo mismo que
`isActive: false`, que esconde la tienda entera, ni que estar fuera del horario
de atención. Ver [operaciones.md](operaciones.md).

**Horario de atención** (`OperationalHours`)
Los días y las horas en que se puede pedir. Vale para el panel también, a
diferencia del modo catálogo. Lo resuelve `isShopCurrentlyAvailable`.

## Recetas e ingredientes

**Unidad base**
Gramo, mililitro o unidad. **Las cantidades de receta se cargan siempre en
unidad base**, sin importar cómo se compre el ingrediente: un ingrediente cargado
en `KILOGRAM` con cantidad 150 son **150 gramos**, no 150 kilos. Es la
convención que más caro sale equivocar — multiplica por mil la lista de compras.

**`Measurement`**
Cómo se **compra** el ingrediente: `UNIT`, `GRAM`, `MILLIGRAM`, `MILLILITER`,
`KILOGRAM`, `LITER`. Es distinto de la unidad base, y `conversionFactors` traduce
entre las dos.

**Merma** (`Ingredient.waste`)
El porcentaje que se pierde al preparar: cáscaras, recortes, evaporación. Se
calcula **sobre el bruto**: para que queden 100 g netos con 20% de merma hay que
comprar `100 ÷ (1 − 0,20) = 125 g`, no 120. Tope del 99% para no dividir por
cero.

**Variante con sal / sin sal** (`withSalt`)
El cliente elige por ítem si su vianda lleva sal. Las dos variantes del mismo
producto son **dos ítems distintos** del pedido, no uno con una nota.

**`variantScope`** (`IngredientVariantScope`)
En qué variante entra cada fila de receta: `ALWAYS` (las dos, y es el default),
`ONLY_WITH_SALT`, `ONLY_WITHOUT_SALT`. Es lo que hace que un pedido sin sal no
compre sal.

**Costo de referencia**
El costo de un producto **cotizado en su variante con sal**. Las pantallas que
hablan de un producto sin un pedido concreto —márgenes, formularios, lista de
recetas— usan esta, que lleva todos los ingredientes, para no mostrar un margen
inflado.

**Tipo de receta** (`ProductRecipeType`)
Un producto puede tener varias recetas con roles distintos —la principal, la
guarnición, la salsa—. El tipo es esa etiqueta.

## Producción

**Bolsón** (`Bags` en `helpers/production.ts`)
Lo que se arma para **un cliente**: todo lo que pidió, junto. La pantalla de
producción cuenta "bolsones a armar" porque es la unidad con la que se despacha,
un bolsón por cliente.

**Lista de compras**
Los ingredientes agregados de todos los pedidos de un período, ya con la merma
aplicada. Es lo que hay que **comprar**, no lo que entra en las recetas.

## Pedidos

**Las tres puertas**
Un pedido puede entrar por tres caminos, y **solo dos pasan por `createOrder`**:
el checkout de la vitrina (`origin: "SHOP"`), el panel (`origin: "DASHBOARD"`) y
el cron de suscripciones, que escribe con `prisma.order.create` directo. Toda
regla que se ponga solo en la acción se saltea la tercera.

**`origin`**
No es una columna: es un parámetro de `createOrder` que dice desde dónde llega el
pedido. Decide qué reglas aplican — el modo catálogo frena a `SHOP` pero no a
`DASHBOARD`.

**Estado** (`OrderStatus`) y **estado de pago** (`PaymentStatus`)
Son dos cosas independientes. El estado del pedido es `PENDING`, `ACCEPTED`,
`COMPLETED` o `CANCELLED`; el del pago es `PENDING`, `PAID` o `FAILED`. Un
pedido puede estar completado y sin pagar.

**Precio unitario congelado** (`OrderItem.unitPrice`)
Lo que costaba el producto **cuando se vendió**. Si el precio cambia después, el
pedido viejo no se reescribe. Las vistas caen al precio actual solo cuando la
columna está vacía, porque es más nueva que algunos pedidos.

## Promociones

**Condición**
Las categorías y cantidades que hay que tener en el carrito para que la promoción
califique. Se exigen **todas**, y la categoría más escasa manda.

**`appliedTimes`** y **`maxApplicableTimes`**
Una promoción se aplica una vez por cada **grupo completo** de su condición:
`appliedTimes` es cuántas veces entró en ese pedido, y `maxApplicableTimes` el
tope. Las promociones **no se apilan**: entre varias que califican gana solo la
que más descuenta en pesos.

**`discountAmount`**
Lo que efectivamente se descontó, **en pesos**, guardado en el pedido. Sin él, un
reporte viejo no se puede reconstruir cuando el porcentaje de la promoción
cambió.

## Cobros y suscripciones

**Preaprobación** (`PreApproval`)
La autorización que le da el cliente a Mercado Pago para que le debiten cada
semana. Vive allá, no acá: el estado se relee de su API, porque el cliente puede
cancelarla desde su cuenta sin pasar por la aplicación.

**Importe fijo**
El débito automático cobra siempre **el importe del pedido que originó la
suscripción**, aunque el pedido de esa semana salga distinto. Mercado Pago cobra
en su propio calendario y solo deja cambiar el importe, no la fecha: con monto
variable habría una carrera entre nuestra actualización y su cobro.

**Suscripción** (`Subscription`)
Un pedido convertido en semanal. Una activa por cliente y por tienda. El cliente
elige el día y puede pausarla, reanudarla o cancelarla.

## Tiempo

**Día del negocio**
El día según la hora de Argentina, no la del servidor ni la del navegador. Vercel
corre en UTC, así que un pedido de las 22:00 del día 31 pertenece a ese mes y no
al siguiente. Lo resuelve `toBusinessTime`, y la zona está fija en
`BUSINESS_TIME_ZONE`.

**Período**
El rango que eligen las pantallas de analytics y producción —semana, mes,
año—, siempre en día del negocio. La semana **empieza el lunes**. Vive en
[date-range.ts](../helpers/date-range.ts), compartido por las dos pantallas para
que no se separen.
