import { beforeEach, describe, expect, it, vi } from "vitest"
import { ShopCategory } from "@prisma/client"

/**
 * `calculatePromotions` ya está cubierto por sus propios tests. Lo que falta
 * fijar es lo de arriba: qué promociones se le pasan. El filtro vive en la
 * consulta, así que una promoción apagada o de otra tienda no debería llegar
 * nunca al cálculo.
 */

const getPromotions = vi.hoisted(() => vi.fn())

vi.mock("@/data/promotions", () => ({ getPromotions }))

const { checkPromotion } = await import("@/actions/promotions/check-promotion")

const CATEGORIA = { id: "cat-1", name: "Viandas", shopCategory: ShopCategory.FOOD }

const product = (id: string, price: number) => ({
  id,
  name: `Producto ${id}`,
  price,
  promotionalPrice: price,
  categories: [CATEGORIA],
})

const ITEMS = [{ product: product("p-1", 5000), quantity: 2 }] as never

/** Promoción de 1000 pesos fijos sobre la categoría de viandas. */
const PROMO = {
  id: "promo-1",
  name: "Mil pesos menos",
  discountType: "FIXED",
  discount: 1000,
  maxApplicableTimes: 1,
  isActive: true,
  shopCategory: ShopCategory.FOOD,
  categories: [{ categoryId: "cat-1", quantity: 2 }],
  allowedShippingMethods: [],
  allowedPaymentMethods: [],
}

const whereUsado = () => getPromotions.mock.calls[0][0].where

beforeEach(() => {
  vi.clearAllMocks()
  getPromotions.mockResolvedValue([])
})

describe("checkPromotion — qué promociones se consideran", () => {
  it("pide solo las activas de esa tienda", async () => {
    await checkPromotion({ items: ITEMS, shopCategory: ShopCategory.FOOD })

    expect(whereUsado()).toEqual({
      shopCategory: ShopCategory.FOOD,
      isActive: true,
    })
  })

  it("pregunta por la tienda del pedido, no por una fija", async () => {
    await checkPromotion({ items: ITEMS, shopCategory: ShopCategory.BAKERY })

    expect(whereUsado().shopCategory).toBe(ShopCategory.BAKERY)
  })

  it("trae las categorías, que es lo que la condición necesita", async () => {
    await checkPromotion({ items: ITEMS, shopCategory: ShopCategory.FOOD })

    expect(getPromotions.mock.calls[0][0].include).toEqual({ categories: true })
  })
})

describe("checkPromotion — resultado", () => {
  it("sin promociones devuelve el subtotal intacto", async () => {
    const res = await checkPromotion({
      items: ITEMS,
      shopCategory: ShopCategory.FOOD,
    })

    expect(res.finalPrice).toBe(10_000)
    expect(res.appliedPromotions).toEqual([])
  })

  it("aplica la promoción que vino de la consulta", async () => {
    getPromotions.mockResolvedValue([PROMO])

    const res = await checkPromotion({
      items: ITEMS,
      shopCategory: ShopCategory.FOOD,
    })

    expect(res.finalPrice).toBe(9000)
    expect(res.appliedPromotions).toHaveLength(1)
  })

  it("si la consulta falla y devuelve null, cobra sin descuento en vez de romper", async () => {
    getPromotions.mockResolvedValue(null)

    const res = await checkPromotion({
      items: ITEMS,
      shopCategory: ShopCategory.FOOD,
    })

    expect(res.finalPrice).toBe(10_000)
    expect(res.appliedPromotions).toEqual([])
  })
})
