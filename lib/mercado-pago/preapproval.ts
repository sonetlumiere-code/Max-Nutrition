import "server-only"

import { PreApproval } from "mercadopago"
import { getMercadoPagoClient } from "@/lib/mercado-pago/client"

const baseUrl = process.env.BASE_URL

/**
 * Preaprobaciones de Mercado Pago: la autorización que da el cliente para que
 * se le debite un monto fijo cada semana.
 *
 * El monto es fijo a propósito. Mercado Pago cobra en su propio calendario y
 * solo permite cambiar el importe, no la fecha; con un monto variable habría
 * una carrera entre nuestra actualización y su cobro, y el cliente podría
 * terminar pagando un importe que no corresponde.
 */

export const PREAPPROVAL_STATUS = {
  PENDING: "pending",
  AUTHORIZED: "authorized",
  PAUSED: "paused",
  CANCELLED: "cancelled",
} as const

export type PreapprovalStatus =
  (typeof PREAPPROVAL_STATUS)[keyof typeof PREAPPROVAL_STATUS]

/** Crea la preaprobación y devuelve el link donde el cliente autoriza la tarjeta. */
export const createPreapproval = async ({
  subscriptionId,
  payerEmail,
  amount,
  shopKey,
}: {
  subscriptionId: string
  payerEmail: string
  amount: number
  shopKey: string
}) => {
  const client = getMercadoPagoClient()

  if (!client) return { error: "Los pagos online no están disponibles." }
  if (!baseUrl) return { error: "Falta configurar la URL del sitio." }

  try {
    const preapproval = await new PreApproval(client).create({
      body: {
        reason: "Pedido semanal de Máxima Nutrición",
        external_reference: subscriptionId,
        payer_email: payerEmail,
        back_url: `${baseUrl}/${shopKey}/subscriptions`,
        status: PREAPPROVAL_STATUS.PENDING,
        auto_recurring: {
          frequency: 1,
          frequency_type: "weeks",
          transaction_amount: Number(amount.toFixed(2)),
          currency_id: "ARS",
        },
      },
    })

    if (!preapproval.id || !preapproval.init_point) {
      return { error: "No se pudo generar la autorización de pago." }
    }

    return {
      success: {
        preapprovalId: preapproval.id,
        authorizationUrl: preapproval.init_point,
      },
    }
  } catch (error) {
    console.error("Error creando la preaprobación:", error)
    return { error: "Hubo un error al preparar el débito automático." }
  }
}

/**
 * Cambia el estado de la preaprobación en Mercado Pago.
 *
 * Se usa para pausar, reanudar y —sobre todo— cancelar: si la cancelación no
 * llega a Mercado Pago, al cliente le siguen debitando.
 */
export const updatePreapprovalStatus = async ({
  preapprovalId,
  status,
}: {
  preapprovalId: string
  status: PreapprovalStatus
}) => {
  const client = getMercadoPagoClient()

  if (!client) return { error: "Los pagos online no están disponibles." }

  try {
    await new PreApproval(client).update({
      id: preapprovalId,
      body: { status },
    })

    return { success: true }
  } catch (error) {
    console.error(
      `Error actualizando la preaprobación ${preapprovalId} a ${status}:`,
      error
    )
    return { error: "No se pudo actualizar el débito automático." }
  }
}

/** Consulta el estado real de la preaprobación contra Mercado Pago. */
export const getPreapproval = async (preapprovalId: string) => {
  const client = getMercadoPagoClient()

  if (!client) return null

  try {
    return await new PreApproval(client).get({ id: preapprovalId })
  } catch (error) {
    console.error(`Error consultando la preaprobación ${preapprovalId}:`, error)
    return null
  }
}
