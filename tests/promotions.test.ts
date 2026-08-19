import { describe, expect, it } from "vitest"
import { PromotionDiscountType } from "@prisma/client"
import { calculatePromotions } from "@/helpers/helpers"
import { PopulatedProduct, PopulatedPromotion } from "@/types/types"

const VIANDAS = "cat-viandas"
const POSTRES = "cat-postres"

const product = (price: number, categoryIds: string[]): PopulatedProduct =>
  ({
    id: `p-${price}-${categoryIds.join("")}`,
    name: `Producto ${price}`,
    price,
    categories: categoryIds.map((id) => ({ id })),
  }) as PopulatedProduct

/** Solo los campos que mira el cálculo; el resto no interviene. */
type PromotionInput = {
  id?: string
  discountType?: PromotionDiscountType
  discount?: number
  maxApplicableTimes?: number | null
  categories: { categoryId: string; quantity: number }[]
}

const promotion = (overrides: PromotionInput): PopulatedPromotion =>
  ({
    id: "promo",
    name: "Promo",
    discountType: PromotionDiscountType.FIXED,
    discount: 0,
    maxApplicableTimes: null,
    ...overrides,
  }) as unknown as PopulatedPromotion

describe("calculatePromotions — sin promociones", () => {
  it("devuelve el subtotal intacto", () => {
    const result = calculatePromotions({
      items: [{ product: product(1000, [VIANDAS]), quantity: 3 }],
      promotions: [],
    })

    expect(result.subtotalPrice).toBe(3000)
    expect(result.finalPrice).toBe(3000)
    expect(result.totalDiscountAmount).toBe(0)
    expect(result.appliedPromotions).toHaveLength(0)
  })
})

describe("calculatePromotions — descuento fijo", () => {
  it("aplica una vez por cada grupo completo de la condición", () => {
    // "Cada 2 viandas, $500 off". Con 5 viandas entran 2 grupos.
    const result = calculatePromotions({
      items: [{ product: product(1000, [VIANDAS]), quantity: 5 }],
      promotions: [
        promotion({
          discount: 500,
          categories: [{ categoryId: VIANDAS, quantity: 2 }],
        }),
      ],
    })

    expect(result.appliedPromotions[0].appliedTimes).toBe(2)
    expect(result.totalDiscountAmount).toBe(1000)
    expect(result.finalPrice).toBe(4000)
  })

  it("no aplica si el carrito no llega a la condición", () => {
    const result = calculatePromotions({
      items: [{ product: product(1000, [VIANDAS]), quantity: 1 }],
      promotions: [
        promotion({
          discount: 500,
          categories: [{ categoryId: VIANDAS, quantity: 2 }],
        }),
      ],
    })

    expect(result.appliedPromotions).toHaveLength(0)
    expect(result.finalPrice).toBe(1000)
  })

  it("exige TODAS las categorías de la condición", () => {
    // Pide 2 viandas Y 1 postre; el carrito no tiene postres.
    const result = calculatePromotions({
      items: [{ product: product(1000, [VIANDAS]), quantity: 4 }],
      promotions: [
        promotion({
          discount: 500,
          categories: [
            { categoryId: VIANDAS, quantity: 2 },
            { categoryId: POSTRES, quantity: 1 },
          ],
        }),
      ],
    })

    expect(result.appliedPromotions).toHaveLength(0)
  })

  it("se limita por la categoría más escasa", () => {
    // 6 viandas y 1 postre, condición 2 viandas + 1 postre => 1 sola vez.
    const result = calculatePromotions({
      items: [
        { product: product(1000, [VIANDAS]), quantity: 6 },
        { product: product(800, [POSTRES]), quantity: 1 },
      ],
      promotions: [
        promotion({
          discount: 500,
          categories: [
            { categoryId: VIANDAS, quantity: 2 },
            { categoryId: POSTRES, quantity: 1 },
          ],
        }),
      ],
    })

    expect(result.appliedPromotions[0].appliedTimes).toBe(1)
    expect(result.totalDiscountAmount).toBe(500)
  })

  it("respeta el tope de aplicaciones por pedido", () => {
    // 10 viandas darían 5 grupos, pero el tope es 2.
    const result = calculatePromotions({
      items: [{ product: product(1000, [VIANDAS]), quantity: 10 }],
      promotions: [
        promotion({
          discount: 500,
          maxApplicableTimes: 2,
          categories: [{ categoryId: VIANDAS, quantity: 2 }],
        }),
      ],
    })

    expect(result.appliedPromotions[0].appliedTimes).toBe(2)
    expect(result.totalDiscountAmount).toBe(1000)
  })

  it("ignora promociones sin categorías, que nunca podrían cumplirse", () => {
    const result = calculatePromotions({
      items: [{ product: product(1000, [VIANDAS]), quantity: 5 }],
      promotions: [promotion({ discount: 500, categories: [] })],
    })

    expect(result.appliedPromotions).toHaveLength(0)
    expect(result.finalPrice).toBe(5000)
  })
})

describe("calculatePromotions — descuento porcentual", () => {
  it("aplica el porcentaje sobre los productos que califican", () => {
    // 10% sobre las viandas ($3000), no sobre el postre ($800).
    const result = calculatePromotions({
      items: [
        { product: product(1000, [VIANDAS]), quantity: 3 },
        { product: product(800, [POSTRES]), quantity: 1 },
      ],
      promotions: [
        promotion({
          discountType: PromotionDiscountType.PERCENTAGE,
          discount: 10,
          categories: [{ categoryId: VIANDAS, quantity: 1 }],
        }),
      ],
    })

    expect(result.subtotalPrice).toBe(3800)
    expect(result.totalDiscountAmount).toBe(300)
    expect(result.finalPrice).toBe(3500)
  })

  it("se aplica una sola vez, sin importar cuántas unidades haya", () => {
    const result = calculatePromotions({
      items: [{ product: product(1000, [VIANDAS]), quantity: 20 }],
      promotions: [
        promotion({
          discountType: PromotionDiscountType.PERCENTAGE,
          discount: 10,
          categories: [{ categoryId: VIANDAS, quantity: 2 }],
        }),
      ],
    })

    expect(result.appliedPromotions[0].appliedTimes).toBe(1)
    expect(result.totalDiscountAmount).toBe(2000)
  })
})

describe("calculatePromotions — no se apilan", () => {
  it("aplica solo la promoción de mayor descuento", () => {
    const result = calculatePromotions({
      items: [{ product: product(1000, [VIANDAS]), quantity: 4 }],
      promotions: [
        promotion({
          id: "chica",
          discount: 500,
          categories: [{ categoryId: VIANDAS, quantity: 2 }],
        }),
        promotion({
          id: "grande",
          discount: 1500,
          categories: [{ categoryId: VIANDAS, quantity: 4 }],
        }),
      ],
    })

    expect(result.appliedPromotions).toHaveLength(1)
    expect(result.appliedPromotions[0].id).toBe("grande")
    expect(result.totalDiscountAmount).toBe(1500)
  })

  it("compara montos reales, no el valor nominal del descuento", () => {
    // La fija da $500×2 = $1000; la porcentual da 15% de $4000 = $600.
    const result = calculatePromotions({
      items: [{ product: product(1000, [VIANDAS]), quantity: 4 }],
      promotions: [
        promotion({
          id: "fija",
          discount: 500,
          categories: [{ categoryId: VIANDAS, quantity: 2 }],
        }),
        promotion({
          id: "porcentual",
          discountType: PromotionDiscountType.PERCENTAGE,
          discount: 15,
          categories: [{ categoryId: VIANDAS, quantity: 1 }],
        }),
      ],
    })

    expect(result.appliedPromotions[0].id).toBe("fija")
    expect(result.totalDiscountAmount).toBe(1000)
  })
})

describe("calculatePromotions — el total nunca queda negativo", () => {
  it("acota el precio final en cero aunque el descuento lo supere", () => {
    // Promo mal calibrada: $3000 off por cada producto de $500.
    const result = calculatePromotions({
      items: [{ product: product(500, [VIANDAS]), quantity: 10 }],
      promotions: [
        promotion({
          discount: 3000,
          categories: [{ categoryId: VIANDAS, quantity: 1 }],
        }),
      ],
    })

    expect(result.subtotalPrice).toBe(5000)
    expect(result.totalDiscountAmount).toBeGreaterThan(result.subtotalPrice)
    expect(result.finalPrice).toBe(0)
  })
})

describe("calculatePromotions — el monto guardado coincide con lo descontado", () => {
  it("expone discountAmount consistente con el total", () => {
    const result = calculatePromotions({
      items: [{ product: product(1000, [VIANDAS]), quantity: 6 }],
      promotions: [
        promotion({
          discount: 400,
          categories: [{ categoryId: VIANDAS, quantity: 2 }],
        }),
      ],
    })

    const applied = result.appliedPromotions[0]

    expect(applied.discountAmount).toBe(result.totalDiscountAmount)
    expect(applied.discountAmount).toBe(applied.appliedTimes * 400)
    expect(result.subtotalPrice - applied.discountAmount).toBe(
      result.finalPrice
    )
  })
})
