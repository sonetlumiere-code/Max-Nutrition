import "server-only"

import { MercadoPagoConfig } from "mercadopago"

/**
 * Cliente de Mercado Pago.
 *
 * La integración es opcional: si no hay credenciales configuradas, las
 * funciones que la usan devuelven un error controlado en vez de romper la
 * aplicación, para que el resto del checkout siga funcionando.
 */
export const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN
export const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET

export const isMercadoPagoConfigured = Boolean(MP_ACCESS_TOKEN)

let client: MercadoPagoConfig | null = null

export const getMercadoPagoClient = () => {
  if (!MP_ACCESS_TOKEN) return null

  client ??= new MercadoPagoConfig({
    accessToken: MP_ACCESS_TOKEN,
    options: { timeout: 10_000 },
  })

  return client
}

export { toPaymentStatus } from "@/lib/mercado-pago/payment-status"
