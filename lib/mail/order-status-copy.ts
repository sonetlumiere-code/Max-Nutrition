import { OrderStatus, ShippingMethod } from "@prisma/client"

/**
 * Textos de los avisos de estado de pedido.
 *
 * Viven separados del envío y de la plantilla para poder revisarlos y testearlos
 * sin depender de Resend ni de React Email.
 */

/**
 * Asunto del aviso, o null si ese estado no amerita avisar.
 *
 * "Pendiente" no manda mail: el cliente ya recibió el detalle al comprar, y
 * volver a escribirle para decirle que sigue pendiente es ruido.
 */
export const orderStatusSubject = (status: OrderStatus): string | null => {
  switch (status) {
    case OrderStatus.ACCEPTED:
      return "Confirmamos tu pedido en Máxima Nutrición"
    case OrderStatus.COMPLETED:
      return "Tu pedido de Máxima Nutrición está listo"
    case OrderStatus.CANCELLED:
      return "Tu pedido de Máxima Nutrición fue cancelado"
    default:
      return null
  }
}

export type OrderStatusCopy = {
  preview: string
  heading: string
  body: string
}

/** Cuerpo del aviso, ajustado a si el pedido se envía o se retira. */
export const orderStatusCopy = (
  status: OrderStatus,
  shippingMethod: ShippingMethod
): OrderStatusCopy => {
  const isDelivery = shippingMethod === ShippingMethod.DELIVERY

  switch (status) {
    case OrderStatus.ACCEPTED:
      return {
        preview: "Confirmamos tu pedido en Máxima Nutrición",
        heading: "Confirmamos tu pedido",
        body: isDelivery
          ? "Ya estamos preparando tus viandas. Te avisamos apenas salgan para tu casa."
          : "Ya estamos preparando tus viandas. Te avisamos apenas puedas pasar a retirarlas.",
      }
    case OrderStatus.COMPLETED:
      return {
        preview: "Tu pedido está listo",
        heading: "Tu pedido está listo",
        body: isDelivery
          ? "Tu pedido ya fue entregado. ¡Que lo disfrutes!"
          : "Tu pedido ya está listo para retirar en la sucursal. ¡Que lo disfrutes!",
      }
    case OrderStatus.CANCELLED:
      return {
        preview: "Tu pedido fue cancelado",
        heading: "Tu pedido fue cancelado",
        body: "Cancelamos tu pedido. Si no fuiste vos o creés que hubo un error, respondé este mail y lo resolvemos.",
      }
    default:
      return {
        preview: "Novedades de tu pedido",
        heading: "Novedades de tu pedido",
        body: "Tu pedido está pendiente de confirmación. Te avisamos apenas lo confirmemos.",
      }
  }
}
