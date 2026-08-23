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
