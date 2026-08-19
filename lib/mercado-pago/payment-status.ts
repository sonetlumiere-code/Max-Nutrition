import { PaymentStatus } from "@prisma/client"

/**
 * Traduce el estado de un pago de Mercado Pago al estado del pedido.
 *
 * Solo "approved" se considera cobrado. Cualquier estado intermedio, o uno
 * nuevo que Mercado Pago agregue en el futuro, queda pendiente: es preferible
 * revisar un pago a mano antes que dar por cobrado algo que no lo está.
 */
export const toPaymentStatus = (
  mercadoPagoStatus?: string | null
): PaymentStatus => {
  switch (mercadoPagoStatus) {
    case "approved":
      return PaymentStatus.PAID
    case "rejected":
    case "cancelled":
    case "charged_back":
      return PaymentStatus.FAILED
    default:
      return PaymentStatus.PENDING
  }
}
