/**
 * Aritmética de dinero de los pedidos.
 *
 * La comparten la creación manual desde la tienda y la generación automática
 * de las suscripciones: si cada una hiciera su propia cuenta, con el tiempo un
 * pedido recurrente terminaría cobrando distinto que el mismo pedido hecho a
 * mano.
 */

/** Los importes se guardan con dos decimales: son pesos, no flotantes libres. */
export const roundMoney = (value: number) => Math.round(value * 100) / 100

export const calculateSubtotal = (
  items: { product: { price: number }; quantity: number }[]
) =>
  roundMoney(
    items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
  )

/** El envío se suma después del descuento, nunca antes. */
export const calculateTotal = (finalPrice: number, shippingCost: number) =>
  roundMoney(finalPrice + shippingCost)
