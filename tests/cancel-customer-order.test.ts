import { beforeEach, describe, expect, it, vi } from "vitest"
import { OrderStatus, ShippingMethod } from "@prisma/client"

/**
 * El cliente cancela desde su propio historial, así que el id del pedido viaja
 * desde el navegador. Lo único que impide cancelar el pedido de otro es la
 * verificación de pertenencia que se hace acá.
 */

const prisma = vi.hoisted(() => ({
  order: { findUnique: vi.fn(), update: vi.fn() },
}))

const verifySession = vi.hoisted(() => vi.fn())
const sendOrderStatusEmail = vi.hoisted(() => vi.fn())

vi.mock("@/lib/db/db", () => ({ default: prisma }))
vi.mock("@/lib/auth/verify-session", () => ({ verifySession }))
vi.mock("@/lib/mail/mail", () => ({ sendOrderStatusEmail }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const { cancelCustomerOrder } = await import(
  "@/actions/orders/cancel-customer-order"
)

const SESSION = { user: { id: "u-1" } }

const order = (overrides = {}) => ({
  id: "o-1",
  status: OrderStatus.PENDING,
  shippingMethod: ShippingMethod.DELIVERY,
  customer: {
    // El dueño del pedido: mismo usuario que la sesión.
    userId: "u-1",
    name: "Ana",
    user: { email: "ana@example.com" },
  },
  shop: { key: "viandas" },
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  verifySession.mockResolvedValue(SESSION)
  prisma.order.findUnique.mockResolvedValue(order())
  prisma.order.update.mockResolvedValue({})
  sendOrderStatusEmail.mockResolvedValue(true)
})

describe("cancelCustomerOrder — de quién es el pedido", () => {
  it("rechaza a quien no tiene sesión", async () => {
    verifySession.mockResolvedValue(null)

    const res = await cancelCustomerOrder({ orderId: "o-1" })

    expect(res.error).toBeTruthy()
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("no deja cancelar el pedido de otro cliente", async () => {
    prisma.order.findUnique.mockResolvedValue(
      order({ customer: { userId: "OTRO-USUARIO", user: {} } })
    )

    const res = await cancelCustomerOrder({ orderId: "o-1" })

    expect(res.error).toBe("Pedido no encontrado.")
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("responde lo mismo si el pedido no existe, sin delatar cuál es cuál", async () => {
    prisma.order.findUnique.mockResolvedValue(null)

    const res = await cancelCustomerOrder({ orderId: "o-inexistente" })

    expect(res.error).toBe("Pedido no encontrado.")
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("tampoco deja cancelar un pedido sin cliente asociado", async () => {
    prisma.order.findUnique.mockResolvedValue(order({ customer: null }))

    const res = await cancelCustomerOrder({ orderId: "o-1" })

    expect(res.error).toBe("Pedido no encontrado.")
    expect(prisma.order.update).not.toHaveBeenCalled()
  })
})

describe("cancelCustomerOrder — qué se puede cancelar", () => {
  it("solo cancela pedidos pendientes", async () => {
    for (const status of [
      OrderStatus.ACCEPTED,
      OrderStatus.COMPLETED,
      OrderStatus.CANCELLED,
    ]) {
      vi.clearAllMocks()
      prisma.order.findUnique.mockResolvedValue(order({ status }))

      const res = await cancelCustomerOrder({ orderId: "o-1" })

      expect(res.error).toBe("Solo se pueden cancelar pedidos pendientes.")
      expect(prisma.order.update).not.toHaveBeenCalled()
    }
  })

  it("cancela el pedido propio que está pendiente", async () => {
    const res = await cancelCustomerOrder({ orderId: "o-1" })

    expect(res.success).toBeTruthy()
    expect(prisma.order.update).toHaveBeenCalledWith({
      where: { id: "o-1" },
      data: { status: OrderStatus.CANCELLED },
    })
  })

  it("le manda el comprobante de la cancelación al cliente", async () => {
    await cancelCustomerOrder({ orderId: "o-1" })

    expect(sendOrderStatusEmail).toHaveBeenCalledTimes(1)
    expect(sendOrderStatusEmail.mock.calls[0][0]).toMatchObject({
      email: "ana@example.com",
      status: OrderStatus.CANCELLED,
    })
  })
})
