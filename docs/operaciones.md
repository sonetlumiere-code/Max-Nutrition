# Operaciones

Cómo se configura y se corre esto en producción: variables de entorno, cobros y
tareas programadas. Para las reglas de negocio ver
[invariantes.md](invariantes.md); para las convenciones de desarrollo,
[CLAUDE.md](../CLAUDE.md).

## Variables de entorno

Están todas en [`.env.example`](../.env.example), con un comentario cada una.
Las que hacen falta para que la aplicación levante:

| Variable | Para qué |
| --- | --- |
| `DATABASE_URL` | Postgres (Neon). El esquema se sincroniza con `prisma db push`; no hay migraciones. |
| `BASE_URL` | URL pública del sitio, usada en los links de los mails. |
| `AUTH_SECRET`, `AUTH_TRUST_HOST` | Sesiones de NextAuth. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Ingreso con Google. |
| `RESEND_API_KEY`, `RESEND_EMAIL` | Envío de mails. |
| `CLOUDINARY_*`, `NEXT_PUBLIC_CLOUDINARY_BASE_URL` | Imágenes de productos. |
| `NEXT_PUBLIC_API_GEOREF` | Autocompletado de direcciones. |
| `SHOP_SETTINGS_ID` | Configuración de la tienda. Sin esto no se puede crear un pedido. |

Y las tres opcionales, que habilitan cobros y suscripciones:

| Variable | Si falta |
| --- | --- |
| `MP_ACCESS_TOKEN` | El pago online avisa que no está disponible; el resto del checkout funciona. |
| `MP_WEBHOOK_SECRET` | Las notificaciones de pago se descartan sin procesar. |
| `CRON_SECRET` | `/api/cron/subscriptions` responde 503 y no se genera ningún pedido. |

## Cargar el catálogo

Los productos y sus recetas se declaran en
[`prisma/catalogo.ts`](../prisma/catalogo.ts) —solo datos, sin lógica— y se
cargan con:

```bash
npm run seed:catalogo
```

Así, **no escribe nada**: informa qué crearía y qué actualizaría, y se planta
antes de tocar la base si el catálogo menciona un ingrediente, un tipo de receta
o una categoría que no existe. Para aplicarlo de verdad:

```bash
npm run seed:catalogo -- --aplicar
```

Es idempotente —correrlo dos veces no duplica— y **no borra ninguna fila**: si
una receta ya cargada tiene un ingrediente que el catálogo no declara, avisa y
lo deja donde está. Como `Product.name` y `Recipe.name` no son únicos en el
esquema, la idempotencia se apoya en buscar por nombre; un producto puede
declarar `renombraDe` para adoptar una fila que ya existe en vez de dejar un
duplicado al lado.

**Las cantidades van siempre en la unidad base** —gramos, mililitros o
unidades— sin importar cómo esté cargado el ingrediente. Un ingrediente en
KILOGRAM con cantidad 150 son 150 gramos, no 150 kilos. Equivocarse ahí
multiplica por mil la lista de compras y el costo.

## Abrir y cerrar la venta online

Cada tienda tiene un interruptor **"Toma pedidos"** en el panel, en editar
tienda. Apagado, la vitrina sigue navegable —el catálogo se ve, los precios se
ven— pero no se puede pedir: no aparece el botón del carrito, el detalle de
producto no deja agregar, el checkout redirige y el servidor rechaza cualquier
pedido que llegue igual.

Lo que **no** frena es la carga manual desde el panel: el equipo puede seguir
tomando pedidos por teléfono y cargándolos a mano. Y las suscripciones no
generan pedidos mientras esté apagado, pero tampoco se pierden: retoman solas
al volver a prenderlo.

Es independiente por tienda, así que se puede abrir viandas y dejar pastelería
cerrada. Es distinto de **"Activa"**, que esconde la tienda entera, y del
horario de atención, que sigue funcionando aparte para los días y horas.

## Pagos con Mercado Pago

El cobro online usa Checkout Pro: el cliente paga en el sitio de Mercado Pago,
así que ningún dato de tarjeta pasa por esta aplicación. El pedido se crea antes
de pagar y queda como pendiente hasta que Mercado Pago confirma el cobro por
webhook — el regreso del cliente al sitio no se toma como comprobante.

Para habilitarlo hacen falta dos variables (ver `.env.example`):

- `MP_ACCESS_TOKEN`: access token del comercio, en **Tus integraciones**.
- `MP_WEBHOOK_SECRET`: clave de firma del webhook, en **Tus integraciones →
  Webhooks**. Sin ella las notificaciones se descartan.

En el panel de Mercado Pago hay que registrar la URL de notificaciones:

```
https://TU-DOMINIO/api/webhooks/mercado-pago
```

Conviene empezar con las credenciales de prueba y las tarjetas de test antes de
pasar a las productivas. El webhook necesita una URL pública, así que en
desarrollo hay que exponer el puerto local con un túnel.

Sin estas variables la integración queda inactiva: el resto del checkout sigue
funcionando y el método Mercado Pago avisa que no está disponible.

## Probar los cobros de punta a punta

Nadie vio nunca entrar un cobro real en esta aplicación: el código está
cubierto por tests, pero los tests doblan a Mercado Pago. Esta es la prueba que
falta, y conviene hacerla entera con credenciales de prueba antes de tocar las
productivas.

### Antes de empezar

El webhook necesita que Mercado Pago pueda llegar a la aplicación, así que hace
falta exponer el puerto local con un túnel (`ngrok http 3000`,
`cloudflared tunnel --url http://localhost:3000`, o el que se prefiera). Anotá
la URL pública que te devuelve: se usa en los tres puntos siguientes.

Cuatro cosas que hacen fracasar el primer intento, en orden de qué tan fácil es
olvidarlas:

1. **`BASE_URL` tiene que apuntar al túnel, no a `localhost`.** La preferencia
   de pago declara su propia `notification_url` a partir de `BASE_URL`
   ([create-payment-preference.ts](../actions/orders/create-payment-preference.ts)):
   si ahí dice `localhost`, Mercado Pago no tiene a dónde notificar y el pedido
   se queda en pendiente para siempre. Por el mismo motivo `auto_return` falla:
   Mercado Pago rechaza volver a una URL que no sea pública.
2. **Reiniciá el dev server después de tocar `.env`.** `BASE_URL` y
   `MP_ACCESS_TOKEN` se leen una sola vez, al cargar el módulo.
3. **La tienda tiene que estar tomando pedidos.** Hoy `acceptsOrders` está
   apagado en las dos tiendas, así que el checkout redirige antes de llegar al
   pago. Prendelo en el panel (editar tienda → "Toma pedidos") y acordate de
   volver a apagarlo al terminar.
4. **La clave de firma es por URL registrada.** Cuando pases del túnel al
   dominio real vas a registrar otra URL, y esa trae **otra**
   `MP_WEBHOOK_SECRET`. Reusar la vieja hace que todas las notificaciones se
   rechacen con 401.

En el panel de Mercado Pago, en **Tus integraciones → Webhooks**, registrá
`https://TU-TUNEL/api/webhooks/mercado-pago`, suscribite a los eventos de pago
y copiá la clave de firma a `MP_WEBHOOK_SECRET`.

### El camino feliz

Con las [tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards)
(en Argentina, Visa `4509 9535 6623 3704`, código `123`, vencimiento `11/30`), y
el nombre del titular como palabra clave para forzar el resultado: `APRO`
aprueba, `OTHE` rechaza, `CONT` deja el pago pendiente.

1. Hacé un pedido desde la tienda eligiendo Mercado Pago.
2. Confirmá que el pedido se creó **antes** de pagar, con `paymentStatus`
   `PENDING`. Es a propósito: el pedido existe aunque el cliente abandone el
   pago.
3. Pagá con `APRO`. Volvés a `/order-confirmed/<id>`.
4. **Acá está lo que importa:** esa vuelta al sitio no marca nada. Mirá los
   logs del dev server: tiene que llegar un `POST /api/webhooks/mercado-pago`
   con 200. Recién entonces el pedido pasa a `PAID`.

Para mirar la base sin escribir SQL:

```bash
npx prisma studio
```

y buscá el pedido en la tabla `Order`.

### Los casos que no son el camino feliz

Son los que justifican el código que ya está escrito, y los únicos que pueden
dar una sorpresa:

| Qué probar | Cómo | Qué tiene que pasar |
| --- | --- | --- |
| Pago rechazado | Titular `OTHE` | El pedido queda `PENDING`, no `CANCELLED`. El cliente puede reintentar. |
| Pago pendiente | Titular `CONT` | Queda `PENDING`. Solo `approved` marca pagado. |
| Firma inválida | `curl -X POST https://TU-TUNEL/api/webhooks/mercado-pago -d '{}'` | **401**, y nada cambia en la base. Es la prueba de que el endpoint público no es una puerta abierta. |
| Notificación simulada desde el panel de MP | Botón "Simular notificación" | Responde 200 y no hace nada: el `data.id` es ficticio y el pago no existe. No es un fallo. |
| Importe distinto | Cambiá el `total` del pedido en Prisma Studio entre el paso 1 y el 3 | El pedido **no** pasa a `PAID` y queda un `console.error` con los dos importes. Se revisa a mano. |
| Sin credenciales | Comentá `MP_ACCESS_TOKEN` y reiniciá | El checkout avisa que el pago online no está disponible y el resto sigue andando. |

### Suscripciones y débito automático

Van aparte porque el cobro recurrente no pasa por el mismo evento. En el panel
de Mercado Pago suscribite además a `subscription_preapproval` y
`subscription_authorized_payment`, en la misma URL.

1. Desde el historial del cliente, convertí un pedido en semanal.
2. Autorizá el débito con una tarjeta de prueba. Hasta que no lo autorices la
   suscripción no genera nada: es lo esperado.
3. Verificá en la tabla `Subscription` que `preapprovalStatus` quedó en
   `authorized`.
4. Dispará la generación a mano, sin esperar al cron:

   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/subscriptions
   ```

5. Probá pausar y cancelar desde la aplicación, y confirmá en el panel de
   Mercado Pago que la preaprobación cambió **allá también**. Si se cancela acá
   y no allá, el cliente sigue debitándose sin forma de frenarlo — es el
   invariante más caro que tiene el sistema.

También conviene probar el otro lado: cancelar la suscripción **desde la cuenta
de Mercado Pago del cliente**, sin pasar por la aplicación, y confirmar que
llega el webhook y la suscripción se desactiva sola.

### Al terminar

Volvé `BASE_URL` a su valor anterior, apagá "Toma pedidos" si todavía no es
momento de abrir, y borrá los pedidos de prueba que hayan quedado en la base
—es la base productiva—.

## Pedidos semanales (suscripciones)

Un cliente puede convertir cualquiera de sus pedidos en un pedido semanal desde
su historial. Cada semana, el día que eligió, el sistema genera un pedido nuevo
con los precios y la disponibilidad de ese momento, y se lo avisa por mail.

La generación la dispara un cron diario declarado en `vercel.json`, que llama a
`/api/cron/subscriptions`. Ese endpoint exige la variable `CRON_SECRET` (ver
`.env.example`): Vercel la envía en el encabezado `Authorization` de sus crons.
Sin la variable el endpoint responde 503 y no genera nada.

La función es idempotente —se apoya en `lastRunAt`—, así que un reintento o una
corrida de más no duplica pedidos. Para ejecutarla a mano:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://TU-DOMINIO/api/cron/subscriptions
```

### Débito automático

Si el pedido que se repite se pagaba con Mercado Pago, la suscripción crea una
preaprobación y el cliente autoriza el débito con su tarjeta. **El importe es
fijo**: el del pedido que originó la suscripción.

Es fijo a propósito. Mercado Pago cobra en su propio calendario y solo permite
cambiar el importe, no la fecha; con un monto variable habría una carrera entre
nuestra actualización y su cobro, y el cliente podría pagar un importe que no
corresponde. Si el pedido de una semana termina costando distinto, se marca
pagado igual —el cliente pagó lo que autorizó— y la diferencia queda anotada en
las notas del pedido para conciliarla.

Hasta que el cliente no autoriza la tarjeta la suscripción no genera pedidos. Si
pausa o cancela, el cambio se envía a Mercado Pago **antes** de aplicarse acá: si
esa llamada falla, la operación se rechaza, porque borrar la suscripción sin
cancelar la preaprobación dejaría al cliente debitado sin forma de detenerlo.

En el panel de Mercado Pago hay que suscribirse también a los eventos
`subscription_preapproval` y `subscription_authorized_payment`, que llegan a la
misma URL de webhook.

Si un cobro falla, el pedido se genera igual y queda pendiente de pago.
