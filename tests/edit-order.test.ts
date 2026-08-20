import { beforeEach, describe, expect, it, vi } from "vitest"
import { OrderStatus, PaymentStatus, ShippingMethod } from "@prisma/client"

/**
 * Tests de `editOrder` con la base doblada.
 *
 * Lo que se prueba acá no es la aritmética —eso ya está cubierto por los tests
 * puros— sino las guardas: qué pedidos se pueden tocar, de quién tiene que ser
 * la dirección, cuándo se recalcula el envío y cuándo sale un mail.
 */

const prisma = vi.hoisted(() => ({
  order: { findUnique: vi.fn(), update: vi.fn() },
  customerAddress: { findUnique: vi.fn() },
}))

const verifySession = vi.hoisted(() => vi.fn())
const getShippingZone = vi.hoisted(() => vi.fn())
const sendOrderStatusEmail = vi.hoisted(() => vi.fn())

vi.mock("@/lib/db/db", () => ({ default: prisma }))
vi.mock("@/lib/auth/verify-session", () => ({ verifySession }))
vi.mock("@/data/shipping-zones", () => ({ getShippingZone }))
vi.mock("@/lib/mail/mail", () => ({ sendOrderStatusEmail }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const { editOrder } = await import("@/actions/orders/edit-order")

const sessionWith = (...permissions: [string, string][]) => ({
  user: {
    id: "u-1",
    role: {
      permissions: permissions.map(([actionKey, subjectKey]) => ({
        actionKey,
        subjectKey,
      })),
    },
  },
})

const ADMIN = sessionWith(["update", "orders"])

const EXISTING_ORDER = {
  id: "o-1",
  customerId: "c-1",
  status: OrderStatus.PENDING,
  shippingMethod: ShippingMethod.TAKE_AWAY,
  shippingCost: 0,
  customerAddressId: null,
  total: 10_000,
}

/** Devuelve lo que se le pasó, como haría la base. */
const echoUpdate = ({ data }: { data: Record<string, unknown> }) => ({
  ...EXISTING_ORDER,
  ...data,
  customer: { name: "Ana", user: { email: "ana@example.com" } },
  shop: { key: "viandas" },
})

beforeEach(() => {
  vi.clearAllMocks()
  verifySession.mockResolvedValue(ADMIN)
  prisma.order.findUnique.mockResolvedValue(EXISTING_ORDER)
  prisma.order.update.mockImplementation(echoUpdate)
  sendOrderStatusEmail.mockResolvedValue(true)
})

describe("editOrder — quién puede editar", () => {
  it("rechaza a quien no tiene sesión", async () => {
    verifySession.mockResolvedValue(null)

    const res = await editOrder({
      id: "o-1",
      values: { status: OrderStatus.ACCEPTED },
    })

    expect(res.error).toBeTruthy()
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("rechaza a quien no tiene el permiso update:orders", async () => {
    verifySession.mockResolvedValue(sessionWith(["view", "orders"]))

    const res = await editOrder({
      id: "o-1",
      values: { status: OrderStatus.ACCEPTED },
    })

    expect(res.error).toBeTruthy()
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("no toca un pedido que no existe", async () => {
    prisma.order.findUnique.mockResolvedValue(null)

    const res = await editOrder({
      id: "o-404",
      values: { status: OrderStatus.ACCEPTED },
    })

    expect(res.error).toBe("Pedido no encontrado.")
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("un pedido cancelado es terminal", async () => {
    prisma.order.findUnique.mockResolvedValue({
      ...EXISTING_ORDER,
      status: OrderStatus.CANCELLED,
    })

    const res = await editOrder({
      id: "o-1",
      values: { status: OrderStatus.ACCEPTED },
    })

    expect(res.error).toBe("No se puede modificar un pedido cancelado.")
    expect(prisma.order.update).not.toHaveBeenCalled()
  })
})

describe("editOrder — dirección y costo de envío", () => {
  it("exige una dirección al pasar a envío a domicilio", async () => {
    const res = await editOrder({
      id: "o-1",
      values: { shippingMethod: ShippingMethod.DELIVERY },
    })

    expect(res.error).toBe("Debes seleccionar la dirección de envío.")
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("rechaza una dirección que es de otro cliente", async () => {
    prisma.customerAddress.findUnique.mockResolvedValue({
      id: "a-9",
      customerId: "OTRO-CLIENTE",
      locality: "Lomas",
    })

    const res = await editOrder({
      id: "o-1",
      values: {
        shippingMethod: ShippingMethod.DELIVERY,
        customerAddressId: "a-9",
      },
    })

    expect(res.error).toBe("La dirección no pertenece al cliente del pedido.")
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("rechaza una localidad sin zona de envío activa", async () => {
    prisma.customerAddress.findUnique.mockResolvedValue({
      id: "a-1",
      customerId: "c-1",
      locality: "Ushuaia",
    })
    getShippingZone.mockResolvedValue(null)

    const res = await editOrder({
      id: "o-1",
      values: {
        shippingMethod: ShippingMethod.DELIVERY,
        customerAddressId: "a-1",
      },
    })

    expect(res.error).toContain("Ushuaia")
    expect(prisma.order.update).not.toHaveBeenCalled()
  })

  it("cobra el envío de la zona y lo suma al total", async () => {
    prisma.customerAddress.findUnique.mockResolvedValue({
      id: "a-1",
      customerId: "c-1",
      locality: "Lanús",
    })
    getShippingZone.mockResolvedValue({ cost: 2500 })

    await editOrder({
      id: "o-1",
      values: {
        shippingMethod: ShippingMethod.DELIVERY,
        customerAddressId: "a-1",
      },
    })

    const { data } = prisma.order.update.mock.calls[0][0]
    expect(data.shippingCost).toBe(2500)
    // 10.000 sin envío previo + 2.500 de envío nuevo.
    expect(data.total).toBe(12_500)
  })

  it("al pasar a retiro descuenta el envío que tenía", async () => {
    prisma.order.findUnique.mockResolvedValue({
      ...EXISTING_ORDER,
      shippingMethod: ShippingMethod.DELIVERY,
      shippingCost: 2500,
      customerAddressId: "a-1",
      total: 12_500,
    })

    await editOrder({
      id: "o-1",
      values: { shippingMethod: ShippingMethod.TAKE_AWAY },
    })

    const { data } = prisma.order.update.mock.calls[0][0]
    expect(data.shippingCost).toBe(0)
    expect(data.total).toBe(10_000)
  })

  it("no recalcula el total si no se toca el envío", async () => {
    await editOrder({ id: "o-1", values: { status: OrderStatus.ACCEPTED } })

    const { data } = prisma.order.update.mock.calls[0][0]
    expect(data.total).toBe(EXISTING_ORDER.total)
    expect(getShippingZone).not.toHaveBeenCalled()
  })

  it("no cobra dos veces el envío al reeditar un pedido que ya lo tenía", async () => {
    prisma.order.findUnique.mockResolvedValue({
      ...EXISTING_ORDER,
      shippingMethod: ShippingMethod.DELIVERY,
      shippingCost: 2500,
      customerAddressId: "a-1",
      total: 12_500,
    })
    prisma.customerAddress.findUnique.mockResolvedValue({
      id: "a-2",
      customerId: "c-1",
      locality: "Avellaneda",
    })
    getShippingZone.mockResolvedValue({ cost: 3000 })

    await editOrder({ id: "o-1", values: { customerAddressId: "a-2" } })

    const { data } = prisma.order.update.mock.calls[0][0]
    // Se reemplaza el envío viejo por el nuevo, no se acumulan.
    expect(data.total).toBe(13_000)
  })
})

describe("editOrder — aviso al cliente", () => {
  it("avisa cuando el estado cambia", async () => {
    await editOrder({ id: "o-1", values: { status: OrderStatus.ACCEPTED } })

    expect(sendOrderStatusEmail).toHaveBeenCalledTimes(1)
    expect(sendOrderStatusEmail.mock.calls[0][0]).toMatchObject({
      email: "ana@example.com",
      status: OrderStatus.ACCEPTED,
    })
  })

  it("no avisa si guardan el pedido sin cambiarle el estado", async () => {
    await editOrder({
      id: "o-1",
      values: { status: EXISTING_ORDER.status },
    })

    expect(sendOrderStatusEmail).not.toHaveBeenCalled()
  })

  it("no avisa cuando solo cambia el estado del pago", async () => {
    await editOrder({
      id: "o-1",
      values: { paymentStatus: PaymentStatus.PAID },
    })

    expect(prisma.order.update).toHaveBeenCalled()
    expect(sendOrderStatusEmail).not.toHaveBeenCalled()
  })
})
