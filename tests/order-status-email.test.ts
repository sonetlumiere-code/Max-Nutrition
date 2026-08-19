import { describe, expect, it } from "vitest"
import { OrderStatus, ShippingMethod } from "@prisma/client"
import {
  orderStatusCopy,
  orderStatusSubject,
} from "@/lib/mail/order-status-copy"

const AVISABLES = [
  OrderStatus.ACCEPTED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
]

describe("orderStatusSubject", () => {
  it.each(AVISABLES)("tiene asunto para %s", (status) => {
    expect(orderStatusSubject(status)).toBeTruthy()
  })

  it("no avisa cuando el pedido queda pendiente", () => {
    // El cliente ya recibió el detalle al comprar; repetirle que sigue
    // pendiente sería ruido.
    expect(orderStatusSubject(OrderStatus.PENDING)).toBeNull()
  })

  it("cada estado tiene un asunto distinto", () => {
    const asuntos = AVISABLES.map(orderStatusSubject)

    expect(new Set(asuntos).size).toBe(asuntos.length)
  })

  it("los asuntos nombran al comercio", () => {
    AVISABLES.forEach((status) => {
      expect(orderStatusSubject(status)).toContain("Máxima Nutrición")
    })
  })
})

describe("orderStatusCopy", () => {
  it("distingue envío a domicilio de retiro en sucursal", () => {
    const delivery = orderStatusCopy(
      OrderStatus.COMPLETED,
      ShippingMethod.DELIVERY
    )
    const takeAway = orderStatusCopy(
      OrderStatus.COMPLETED,
      ShippingMethod.TAKE_AWAY
    )

    expect(delivery.body).not.toBe(takeAway.body)
    expect(delivery.body).toContain("entregado")
    expect(takeAway.body).toContain("retirar")
  })

  it("al aceptar el pedido anticipa lo que sigue según el envío", () => {
    expect(
      orderStatusCopy(OrderStatus.ACCEPTED, ShippingMethod.DELIVERY).body
    ).toContain("tu casa")
    expect(
      orderStatusCopy(OrderStatus.ACCEPTED, ShippingMethod.TAKE_AWAY).body
    ).toContain("retirarlas")
  })

  it("la cancelación ofrece una vía de contacto", () => {
    const copy = orderStatusCopy(
      OrderStatus.CANCELLED,
      ShippingMethod.DELIVERY
    )

    expect(copy.body).toContain("respondé este mail")
  })

  it("la cancelación dice lo mismo se envíe o se retire", () => {
    expect(
      orderStatusCopy(OrderStatus.CANCELLED, ShippingMethod.DELIVERY).body
    ).toBe(orderStatusCopy(OrderStatus.CANCELLED, ShippingMethod.TAKE_AWAY).body)
  })

  it("ningún estado queda sin texto", () => {
    Object.values(OrderStatus).forEach((status) => {
      Object.values(ShippingMethod).forEach((shippingMethod) => {
        const copy = orderStatusCopy(status, shippingMethod)

        expect(copy.preview.length).toBeGreaterThan(0)
        expect(copy.heading.length).toBeGreaterThan(0)
        expect(copy.body.length).toBeGreaterThan(0)
      })
    })
  })

  it("el asunto y el encabezado hablan del mismo estado", () => {
    // Evita que se cambie uno y se olvide el otro.
    expect(
      orderStatusCopy(OrderStatus.CANCELLED, ShippingMethod.DELIVERY).heading
    ).toContain("cancelado")
    expect(orderStatusSubject(OrderStatus.CANCELLED)).toContain("cancelado")
  })
})
