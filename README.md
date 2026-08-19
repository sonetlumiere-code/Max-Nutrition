This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

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

## Tests

The business math — unit conversions, ingredient cost with merma, promotions,
period boundaries and the production aggregations — is covered by unit tests:

```bash
npm test
```

Date handling is expected to be independent of the machine's time zone, since
the business operates in Argentina while a build server usually runs in UTC.
The suite is worth running under another zone before touching that code:

```bash
TZ=UTC npm test
```

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
