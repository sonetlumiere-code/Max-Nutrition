import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  DayOfWeek,
  PaymentMethod,
  ShippingMethod,
  ShopCategory,
} from "@prisma/client"

/**
 * Tests de `createOrder` con la base doblada.
 *
 * Es el camino por el que entra la plata, así que lo que se fija acá son las
 * guardas y lo que termina guardado: qué se puede comprar, a qué precio, con
 * qué envío, y que ninguna de esas cosas dependa de lo que mandó el cliente.
 */

const prisma = vi.hoisted(() => ({
  order: { create: vi.fn() },
}))

const mocks = vi.hoisted(() => ({
  verifySession: vi.fn(),
  getShop: vi.fn(),
  getShopSettings: vi.fn(),
  getShippingSettings: vi.fn(),
  getProducts: vi.fn(),
  getCustomer: vi.fn(),
  getShopBranch: vi.fn(),
  getShippingZone: vi.fn(),
  checkPromotion: vi.fn(),
  sendOrderDetailsEmail: vi.fn(),
}))

// El módulo lee SHOP_SETTINGS_ID al importarse, así que tiene que estar antes.
vi.hoisted(() => {
  process.env.SHOP_SETTINGS_ID = "shop-settings-1"
})

vi.mock("@/lib/db/db", () => ({ default: prisma }))
vi.mock("@/lib/auth/verify-session", () => ({
  verifySession: mocks.verifySession,
}))
vi.mock("@/data/shops", () => ({ getShop: mocks.getShop }))
vi.mock("@/data/shop-settings", () => ({
  getShopSettings: mocks.getShopSettings,
}))
vi.mock("@/data/shipping-settings", () => ({
  getShippingSettings: mocks.getShippingSettings,
}))
vi.mock("@/data/products", () => ({ getProducts: mocks.getProducts }))
vi.mock("@/data/customer", () => ({ getCustomer: mocks.getCustomer }))
vi.mock("@/data/shop-branches", () => ({ getShopBranch: mocks.getShopBranch }))
vi.mock("@/data/shipping-zones", () => ({
  getShippingZone: mocks.getShippingZone,
}))
vi.mock("@/actions/promotions/check-promotion", () => ({
  checkPromotion: mocks.checkPromotion,
}))
vi.mock("@/lib/mail/mail", () => ({
  sendOrderDetailsEmail: mocks.sendOrderDetailsEmail,
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const { createOrder } = await import("@/actions/orders/create-order")

const SHOP_CATEGORY = ShopCategory.FOOD

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

const product = (id: string, price: number, overrides = {}) => ({
  id,
  name: `Producto ${id}`,
  price,
  promotionalPrice: price,
  stock: true,
  show: true,
  categories: [{ shopCategory: SHOP_CATEGORY }],
  ...overrides,
})

const MILANESA = product("p-1", 5000)
const BOWL = product("p-2", 3000)
const CATALOG = [MILANESA, BOWL]

/** Horario que cubre toda la semana, para que la tienda esté siempre abierta. */
const ALWAYS_OPEN = Object.values(DayOfWeek).map((dayOfWeek) => ({
  dayOfWeek,
  startTime: "00:00",
  endTime: "23:59",
}))

const CUSTOMER = {
  id: "c-1",
  name: "Ana",
  user: { email: "ana@example.com" },
  addresses: [{ id: "a-1", locality: "Lanús" }],
}

const takeAwayOrder = (overrides = {}) => ({
  origin: "SHOP" as const,
  shopCategory: SHOP_CATEGORY,
  shippingMethod: ShippingMethod.TAKE_AWAY,
  paymentMethod: PaymentMethod.CASH,
  shopBranchId: "b-1",
  items: [
    { productId: "p-1", quantity: 2, variation: { withSalt: true } },
  ],
  ...overrides,
})

const createdData = () => prisma.order.create.mock.calls[0][0].data

beforeEach(() => {
  vi.clearAllMocks()
  mocks.verifySession.mockResolvedValue(sessionWith(["create", "orders"]))
  mocks.getShop.mockResolvedValue({
    id: "shop-1",
    key: "viandas",
    operationalHours: ALWAYS_OPEN,
  })
  mocks.getShopSettings.mockResolvedValue({
    allowedPaymentMethods: Object.values(PaymentMethod),
  })
  mocks.getShippingSettings.mockResolvedValue({
    allowedShippingMethods: Object.values(ShippingMethod),
    minProductsQuantityForDelivery: 0,
  })
  // El getProducts real filtra por los ids pedidos; el doble tiene que hacer
  // lo mismo o la acción cree que faltan productos.
  mocks.getProducts.mockImplementation(async ({ where }) =>
    CATALOG.filter((p) => where.id.in.includes(p.id))
  )
  mocks.getCustomer.mockResolvedValue(CUSTOMER)
  mocks.getShopBranch.mockResolvedValue({ id: "b-1", isActive: true })
  mocks.getShippingZone.mockResolvedValue({ cost: 2500 })
  mocks.checkPromotion.mockImplementation(async ({ items }) => ({
    appliedPromotions: [],
    finalPrice: items.reduce(
      (sum: number, item: { product: { price: number }; quantity: number }) =>
        sum + item.product.price * item.quantity,
      0
    ),
  }))
  prisma.order.create.mockImplementation(async ({ data }) => ({
    id: "o-1",
    ...data,
    customer: CUSTOMER,
    items: [],
  }))
})

describe("createOrder — quién y cuándo", () => {
  it("rechaza a quien no tiene sesión", async () => {
    mocks.verifySession.mockResolvedValue(null)

    const res = await createOrder({ values: takeAwayOrder() })

    expect(res.error).toBeTruthy()
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("rechaza si la tienda está cerrada", async () => {
    mocks.getShop.mockResolvedValue({
      id: "shop-1",
      key: "viandas",
      operationalHours: [],
    })

    const res = await createOrder({ values: takeAwayOrder() })

    expect(res.error).toContain("Horario no operacional")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("desde el panel exige el permiso create:orders", async () => {
    mocks.verifySession.mockResolvedValue(sessionWith(["view", "orders"]))

    const res = await createOrder({
      values: takeAwayOrder({ origin: "DASHBOARD", customerId: "c-1" }),
    })

    expect(res.error).toContain("No autorizado")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("desde el panel exige indicar el cliente", async () => {
    const res = await createOrder({
      values: takeAwayOrder({ origin: "DASHBOARD" }),
    })

    // Lo ataja la validación del esquema antes que la guarda de la acción, así
    // que el mensaje es el genérico; lo que importa es que no se cree nada.
    expect(res.error).toBeTruthy()
    expect(prisma.order.create).not.toHaveBeenCalled()
  })
})

describe("createOrder — qué se puede comprar", () => {
  it("rechaza un producto que no existe o está oculto", async () => {
    // getProducts filtra por show: true, así que un producto oculto no vuelve.
    mocks.getProducts.mockResolvedValue([])

    const res = await createOrder({ values: takeAwayOrder() })

    expect(res.error).toBe("ID de producto inválido.")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("rechaza un producto sin stock", async () => {
    mocks.getProducts.mockResolvedValue([
      product("p-1", 5000, { stock: false, name: "Milanesa" }),
    ])

    const res = await createOrder({ values: takeAwayOrder() })

    expect(res.error).toContain("sin stock")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("rechaza un producto de otra tienda", async () => {
    mocks.getProducts.mockResolvedValue([
      product("p-1", 5000, { categories: [{ shopCategory: "OTRA_TIENDA" }] }),
    ])

    const res = await createOrder({ values: takeAwayOrder() })

    expect(res.error).toContain("no pertenecen a esta tienda")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("rechaza un método de pago que la tienda no habilitó", async () => {
    mocks.getShopSettings.mockResolvedValue({
      allowedPaymentMethods: [PaymentMethod.MERCADO_PAGO],
    })

    const res = await createOrder({ values: takeAwayOrder() })

    expect(res.error).toContain("método de pago")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("rechaza un método de envío que la tienda no habilitó", async () => {
    mocks.getShippingSettings.mockResolvedValue({
      allowedShippingMethods: [ShippingMethod.DELIVERY],
      minProductsQuantityForDelivery: 0,
    })

    const res = await createOrder({ values: takeAwayOrder() })

    expect(res.error).toContain("método de envío")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })
})

describe("createOrder — precios", () => {
  it("cobra el precio de la base, no el que mandó el cliente", async () => {
    await createOrder({
      values: takeAwayOrder({
        items: [
          {
            productId: "p-1",
            quantity: 2,
            variation: { withSalt: true },
            // Un cliente malicioso mandando su propio precio.
            price: 1,
          },
        ],
      }),
    })

    const data = createdData()
    expect(data.subtotal).toBe(10_000)
    expect(data.total).toBe(10_000)
    expect(data.items.create[0].unitPrice).toBe(5000)
  })

  it("congela el precio unitario al momento de la venta", async () => {
    await createOrder({ values: takeAwayOrder() })

    expect(createdData().items.create[0].unitPrice).toBe(MILANESA.price)
  })

  it("consolida el mismo producto y variante en un solo ítem", async () => {
    await createOrder({
      values: takeAwayOrder({
        items: [
          { productId: "p-1", quantity: 2, variation: { withSalt: true } },
          { productId: "p-1", quantity: 3, variation: { withSalt: true } },
        ],
      }),
    })

    const items = createdData().items.create
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(5)
  })

  it("mantiene separadas las dos variantes del mismo producto", async () => {
    await createOrder({
      values: takeAwayOrder({
        items: [
          { productId: "p-1", quantity: 2, variation: { withSalt: true } },
          { productId: "p-1", quantity: 3, variation: { withSalt: false } },
        ],
      }),
    })

    const items = createdData().items.create
    expect(items).toHaveLength(2)
    expect(items.map((i: { withSalt: boolean }) => i.withSalt).sort()).toEqual([
      false,
      true,
    ])
  })

  it("guarda el descuento de la promoción y cobra el precio final", async () => {
    mocks.checkPromotion.mockResolvedValue({
      appliedPromotions: [
        {
          id: "promo-1",
          name: "2x1",
          discountType: "PERCENTAGE",
          discount: 10,
          appliedTimes: 1,
          discountAmount: 1000,
          allowedShippingMethods: [ShippingMethod.TAKE_AWAY],
          allowedPaymentMethods: [PaymentMethod.CASH],
        },
      ],
      finalPrice: 9000,
    })

    await createOrder({ values: takeAwayOrder() })

    const data = createdData()
    // El subtotal queda a precio de lista y el total ya con el descuento.
    expect(data.subtotal).toBe(10_000)
    expect(data.total).toBe(9000)
    expect(data.appliedPromotions.create[0]).toMatchObject({
      promotionId: "promo-1",
      discountAmount: 1000,
    })
  })

  it("rechaza la promoción si el medio de pago no califica", async () => {
    mocks.checkPromotion.mockResolvedValue({
      appliedPromotions: [
        {
          id: "promo-1",
          name: "Solo transferencia",
          discountType: "PERCENTAGE",
          discount: 10,
          appliedTimes: 1,
          discountAmount: 1000,
          allowedShippingMethods: [ShippingMethod.TAKE_AWAY],
          allowedPaymentMethods: [PaymentMethod.BANK_TRANSFER],
        },
      ],
      finalPrice: 9000,
    })

    const res = await createOrder({ values: takeAwayOrder() })

    expect(res.error).toContain("método de pago")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })
})

describe("createOrder — envío", () => {
  const deliveryOrder = (overrides = {}) =>
    takeAwayOrder({
      shippingMethod: ShippingMethod.DELIVERY,
      customerAddressId: "a-1",
      ...overrides,
    })

  it("suma el costo de la zona al total", async () => {
    await createOrder({ values: deliveryOrder() })

    const data = createdData()
    expect(data.shippingCost).toBe(2500)
    expect(data.total).toBe(12_500)
  })

  it("rechaza una dirección que no es del cliente", async () => {
    const res = await createOrder({
      values: deliveryOrder({ customerAddressId: "a-de-otro" }),
    })

    expect(res.error).toBe("ID de dirección de cliente inválido.")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("rechaza una localidad sin zona activa", async () => {
    mocks.getShippingZone.mockResolvedValue(null)

    const res = await createOrder({ values: deliveryOrder() })

    expect(res.error).toContain("Lanús")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("exige el mínimo de unidades para enviar a domicilio", async () => {
    mocks.getShippingSettings.mockResolvedValue({
      allowedShippingMethods: Object.values(ShippingMethod),
      minProductsQuantityForDelivery: 5,
    })

    const res = await createOrder({ values: deliveryOrder() })

    expect(res.error).toContain("5")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("un retiro no guarda dirección ni cobra envío", async () => {
    await createOrder({
      values: takeAwayOrder({ customerAddressId: "a-1" }),
    })

    const data = createdData()
    expect(data.customerAddressId).toBeNull()
    expect(data.shippingCost).toBe(0)
    expect(data.shopBranchId).toBe("b-1")
  })

  it("rechaza una sucursal inexistente o inactiva", async () => {
    mocks.getShopBranch.mockResolvedValue(null)

    const res = await createOrder({ values: takeAwayOrder() })

    expect(res.error).toBe("ID de sucursal inválido.")
    expect(prisma.order.create).not.toHaveBeenCalled()
  })

  it("un envío a domicilio no guarda sucursal", async () => {
    await createOrder({ values: deliveryOrder() })

    expect(createdData().shopBranchId).toBeNull()
  })
})

describe("createOrder — aviso al cliente", () => {
  it("manda el detalle solo si se lo pide", async () => {
    await createOrder({ values: takeAwayOrder() })
    expect(mocks.sendOrderDetailsEmail).not.toHaveBeenCalled()

    await createOrder({ values: takeAwayOrder(), sendEmail: true })
    expect(mocks.sendOrderDetailsEmail).toHaveBeenCalledTimes(1)
  })
})
