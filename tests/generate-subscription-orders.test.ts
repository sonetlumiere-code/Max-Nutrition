import { beforeEach, describe, expect, it, vi } from "vitest"
import { DayOfWeek, ShippingMethod, ShopCategory } from "@prisma/client"

/**
 * El cron de suscripciones no pasa por `createOrder`: crea el pedido contra la
 * base directamente. Es la puerta que se escapa de cualquier control puesto
 * solo en la acción, así que el interruptor del negocio tiene que respetarse
 * también acá.
 */

const prisma = vi.hoisted(() => ({
  subscription: { findMany: vi.fn(), update: vi.fn() },
  product: { findMany: vi.fn() },
  order: { create: vi.fn() },
}))

const mocks = vi.hoisted(() => ({
  checkPromotion: vi.fn(),
  getShippingZone: vi.fn(),
  sendOrderDetailsEmail: vi.fn(),
}))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/db/db", () => ({ default: prisma }))
vi.mock("@/actions/promotions/check-promotion", () => ({
  checkPromotion: mocks.checkPromotion,
}))
vi.mock("@/data/shipping-zones", () => ({
  getShippingZone: mocks.getShippingZone,
}))
vi.mock("@/lib/mail/mail", () => ({
  sendOrderDetailsEmail: mocks.sendOrderDetailsEmail,
}))

const { generateSubscriptionOrders } = await import(
  "@/lib/subscriptions/generate-orders"
)

/** Un lunes al mediodía en Argentina. */
const LUNES = new Date("2026-05-18T15:00:00.000Z")

const PRODUCTO = {
  id: "p-1",
  name: "Vianda",
  price: 20000,
  promotionalPrice: 20000,
  show: true,
  stock: true,
  categories: [],
}

const suscripcion = (acceptsOrders: boolean) => ({
  id: "s-1",
  customerId: "c-1",
  shopId: "shop-1",
  isActive: true,
  weekday: DayOfWeek.MONDAY,
  lastRunAt: null,
  shippingMethod: ShippingMethod.TAKE_AWAY,
  shopBranchId: "b-1",
  paymentMethod: "CASH",
  mercadoPagoPreapprovalId: null,
  preapprovalStatus: null,
  items: [{ productId: "p-1", quantity: 2, withSalt: true }],
  customer: { name: "Ana", user: { email: "ana@example.com" } },
  shop: { id: "shop-1", key: "viandas", shopCategory: ShopCategory.FOOD, acceptsOrders },
  address: null,
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, "warn").mockImplementation(() => {})
  vi.spyOn(console, "error").mockImplementation(() => {})
  prisma.product.findMany.mockResolvedValue([PRODUCTO])
  prisma.order.create.mockResolvedValue({ id: "o-1", items: [] })
  prisma.subscription.update.mockResolvedValue({})
  mocks.checkPromotion.mockResolvedValue({
    appliedPromotions: [],
    finalPrice: 40000,
  })
  mocks.sendOrderDetailsEmail.mockResolvedValue(true)
})

describe("generateSubscriptionOrders — interruptor del negocio", () => {
  it("genera el pedido cuando la tienda toma pedidos", async () => {
    prisma.subscription.findMany.mockResolvedValue([suscripcion(true)])

    const resultado = await generateSubscriptionOrders(LUNES)

    expect(prisma.order.create).toHaveBeenCalledTimes(1)
    expect(resultado.created).toBe(1)
  })

  it("no genera nada si la tienda no está tomando pedidos", async () => {
    prisma.subscription.findMany.mockResolvedValue([suscripcion(false)])

    const resultado = await generateSubscriptionOrders(LUNES)

    expect(prisma.order.create).not.toHaveBeenCalled()
    expect(resultado.created).toBe(0)
  })

  it("deja dicho por qué se salteó, para que no parezca una falla", async () => {
    prisma.subscription.findMany.mockResolvedValue([suscripcion(false)])

    const resultado = await generateSubscriptionOrders(LUNES)

    expect(resultado.skipped).toEqual([
      { subscriptionId: "s-1", reason: "La tienda no está tomando pedidos." },
    ])
  })

  it("no marca la suscripción como corrida, así retoma sola al reabrir", async () => {
    prisma.subscription.findMany.mockResolvedValue([suscripcion(false)])

    await generateSubscriptionOrders(LUNES)

    expect(prisma.subscription.update).not.toHaveBeenCalled()
  })
})
