/**
 * Interpretación de los eventos de suscripción de Mercado Pago.
 *
 * Se mantiene puro para poder fijar por tests qué hace cada notificación:
 * de estos eventos depende que a un cliente se le siga debitando o no.
 */

export const MP_SUBSCRIPTION_EVENTS = {
  /** Cambió el estado de la preaprobación (autorizada, pausada, cancelada). */
  PREAPPROVAL: "subscription_preapproval",
  /** Se generó un cobro de una cuota de la suscripción. */
  AUTHORIZED_PAYMENT: "subscription_authorized_payment",
} as const

export type MercadoPagoEvent =
  | { kind: "payment"; id: string }
  | { kind: "preapproval"; id: string }
  | { kind: "authorized_payment"; id: string }
  | { kind: "ignored" }

/** Clasifica una notificación según su tipo y el id que trae. */
export const classifyEvent = (
  type: string | null | undefined,
  dataId: string | null | undefined
): MercadoPagoEvent => {
  if (!dataId) return { kind: "ignored" }

  switch (type) {
    case "payment":
      return { kind: "payment", id: String(dataId) }
    case MP_SUBSCRIPTION_EVENTS.PREAPPROVAL:
      return { kind: "preapproval", id: String(dataId) }
    case MP_SUBSCRIPTION_EVENTS.AUTHORIZED_PAYMENT:
      return { kind: "authorized_payment", id: String(dataId) }
    default:
      return { kind: "ignored" }
  }
}

/**
 * Traduce el estado de una preaprobación al de la suscripción local.
 *
 * Solo "authorized" habilita a generar pedidos: mientras el cliente no haya
 * autorizado la tarjeta, o si pausó o canceló, la suscripción queda inactiva.
 */
export const isPreapprovalActive = (status?: string | null) =>
  status === "authorized"

/**
 * Decide si un cobro recurrente salda un pedido.
 *
 * Con monto fijo, el cliente paga lo que autorizó. Si el total del pedido de
 * esa semana difiere, el pedido se marca pagado igual —el cliente cumplió—
 * pero la diferencia se informa para que el comercio la concilie.
 */
export const reconcileRecurringCharge = ({
  chargedAmount,
  orderTotal,
}: {
  chargedAmount: number
  orderTotal: number
}) => {
  const difference = Math.round((orderTotal - chargedAmount) * 100) / 100

  return {
    shouldMarkPaid: true,
    difference,
    matches: Math.abs(difference) <= 0.01,
  }
}
