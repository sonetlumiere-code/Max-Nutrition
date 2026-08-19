import { describe, expect, it } from "vitest"
import { Measurement } from "@prisma/client"
import {
  aggregateBags,
  aggregateIngredients,
  aggregateProducts,
  aggregateRecipeGroups,
} from "@/helpers/production"
import { PopulatedOrder } from "@/types/types"

const ingredient = (
  id: string,
  name: string,
  price: number,
  waste = 0,
  measurement: Measurement = Measurement.KILOGRAM
) => ({ id, name, price, waste, measurement, amountPerMeasurement: 1 })

const CARNE = ingredient("i-carne", "Carne", 9000, 20)
const ARROZ = ingredient("i-arroz", "Arroz", 3500)
const SAL = ingredient("i-sal", "Sal", 270)

/** Producto con dos componentes: principal y guarnición. */
const MILANESA = {
  id: "p-mila",
  name: "Milanesa con arroz",
  productRecipes: [
    {
      type: { name: "Principal" },
      recipe: {
        recipeIngredients: [
          { quantity: 200, ingredient: CARNE },
          { quantity: 2, ingredient: SAL },
        ],
      },
    },
    {
      type: { name: "Guarnición" },
      recipe: { recipeIngredients: [{ quantity: 150, ingredient: ARROZ }] },
    },
  ],
}

/** Comparte el arroz con la milanesa: sirve para probar la acumulación. */
const BOWL = {
  id: "p-bowl",
  name: "Bowl de arroz",
  productRecipes: [
    {
      type: { name: "Principal" },
      recipe: { recipeIngredients: [{ quantity: 250, ingredient: ARROZ }] },
    },
  ],
}

const order = (
  customerName: string,
  items: { product: unknown; quantity: number; withSalt: boolean }[]
) => ({ customer: { name: customerName }, items }) as unknown as PopulatedOrder

const ORDERS: PopulatedOrder[] = [
  order("Ana", [
    { product: MILANESA, quantity: 3, withSalt: true },
    { product: BOWL, quantity: 2, withSalt: false },
  ]),
  order("Beto", [{ product: MILANESA, quantity: 4, withSalt: false }]),
  order("Ana", [{ product: BOWL, quantity: 1, withSalt: true }]),
]

describe("aggregateProducts", () => {
  it("suma las unidades de cada producto separando la variante", () => {
    const products = aggregateProducts(ORDERS)
    const milanesa = products.find((p) => p.name === MILANESA.name)!
    const bowl = products.find((p) => p.name === BOWL.name)!

    expect(milanesa).toMatchObject({ withSalt: 3, withoutSalt: 4, total: 7 })
    expect(bowl).toMatchObject({ withSalt: 1, withoutSalt: 2, total: 3 })
  })

  it("el total de cada producto es la suma de sus variantes", () => {
    aggregateProducts(ORDERS).forEach((product) => {
      expect(product.total).toBe(product.withSalt + product.withoutSalt)
    })
  })

  it("devuelve vacío si no hay pedidos", () => {
    expect(aggregateProducts([])).toEqual([])
  })
})

describe("aggregateIngredients", () => {
  it("acumula un mismo ingrediente usado por productos distintos", () => {
    // Arroz: 150 g × 7 milanesas + 250 g × 3 bowls = 1050 + 750 = 1800 g.
    const arroz = aggregateIngredients(ORDERS).find(
      (i) => i.name === "Arroz"
    )!

    expect(arroz.baseQuantity).toBeCloseTo(1800, 6)
  })

  it("escala la cantidad por las unidades pedidas", () => {
    // Carne: 200 g × 7 milanesas = 1400 g netos.
    const carne = aggregateIngredients(ORDERS).find(
      (i) => i.name === "Carne"
    )!

    expect(carne.baseQuantity).toBeCloseTo(1400, 6)
  })

  it("aplica la merma sobre la cantidad a comprar, no sobre la neta", () => {
    // 1400 g netos con 20% de merma => 1750 g a comprar.
    const carne = aggregateIngredients(ORDERS).find(
      (i) => i.name === "Carne"
    )!

    expect(carne.totalQuantity).toBeCloseTo(1750, 6)
    expect(carne.waste).toBe(20)
  })

  it("no infla la cantidad cuando no hay merma", () => {
    const arroz = aggregateIngredients(ORDERS).find(
      (i) => i.name === "Arroz"
    )!

    expect(arroz.totalQuantity).toBeCloseTo(arroz.baseQuantity, 6)
  })

  it("cobra la cantidad comprada al precio por unidad base", () => {
    // Carne a $9000/kg = $9/g × 1750 g = $15.750.
    const carne = aggregateIngredients(ORDERS).find(
      (i) => i.name === "Carne"
    )!

    expect(carne.cost).toBeCloseTo(15_750, 6)
  })

  it("expresa todo en la unidad base", () => {
    aggregateIngredients(ORDERS).forEach((ingredient) => {
      expect(ingredient.measurement).toBe(Measurement.GRAM)
    })
  })

  it("no repite ingredientes en el resultado", () => {
    const ids = aggregateIngredients(ORDERS).map((i) => i.ingredientId)

    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("aggregateRecipeGroups", () => {
  it("agrupa por producto y separa cada componente", () => {
    const milanesa = aggregateRecipeGroups(ORDERS).find(
      (g) => g.productName === MILANESA.name
    )!

    expect(milanesa.recipeGroups.map((r) => r.productRecipeType)).toEqual([
      "Principal",
      "Guarnición",
    ])
  })

  it("cada componente lleva solo sus propios ingredientes", () => {
    const milanesa = aggregateRecipeGroups(ORDERS).find(
      (g) => g.productName === MILANESA.name
    )!
    const principal = milanesa.recipeGroups.find(
      (r) => r.productRecipeType === "Principal"
    )!

    expect(principal.ingredients.map((i) => i.name).sort()).toEqual([
      "Carne",
      "Sal",
    ])
  })

  it("el costo del producto es la suma de sus componentes", () => {
    aggregateRecipeGroups(ORDERS).forEach((group) => {
      const suma = group.recipeGroups.reduce(
        (total, recipe) =>
          total + recipe.ingredients.reduce((s, i) => s + i.cost, 0),
        0
      )

      expect(group.totalCost).toBeCloseTo(suma, 6)
    })
  })

  it("informa las unidades vendidas de cada producto", () => {
    const groups = aggregateRecipeGroups(ORDERS)

    expect(
      groups.find((g) => g.productName === MILANESA.name)!.totalQuantitySold
    ).toBe(7)
    expect(
      groups.find((g) => g.productName === BOWL.name)!.totalQuantitySold
    ).toBe(3)
  })

  it("el costo total coincide con el de la lista de compras", () => {
    // Las dos vistas deben cerrar contra el mismo número.
    const porReceta = aggregateRecipeGroups(ORDERS).reduce(
      (sum, group) => sum + group.totalCost,
      0
    )
    const porIngrediente = aggregateIngredients(ORDERS).reduce(
      (sum, ingredient) => sum + ingredient.cost,
      0
    )

    expect(porReceta).toBeCloseTo(porIngrediente, 6)
  })
})

describe("aggregateBags", () => {
  it("junta los pedidos de un mismo cliente en un solo bolsón", () => {
    const bags = aggregateBags(ORDERS)

    expect(bags.customers).toEqual(["Ana", "Beto"])
    expect(bags.rows).toHaveLength(2)
  })

  it("suma las unidades del cliente a través de sus pedidos", () => {
    // Ana pidió 2 bowls en un pedido y 1 en otro.
    const ana = aggregateBags(ORDERS).rows.find((r) => r.customer === "Ana")!

    expect(ana.quantities[BOWL.name]).toBe(3)
    expect(ana.quantities[MILANESA.name]).toBe(3)
  })

  it("marca en cero los productos que el cliente no pidió", () => {
    const beto = aggregateBags(ORDERS).rows.find((r) => r.customer === "Beto")!

    expect(beto.quantities[BOWL.name]).toBe(0)
  })

  it("el total por producto coincide con la producción", () => {
    const bags = aggregateBags(ORDERS)
    const products = aggregateProducts(ORDERS)

    products.forEach((product) => {
      const suma = bags.rows.reduce(
        (total, row) => total + (row.quantities[product.name] || 0),
        0
      )

      expect(suma).toBe(product.total)
    })
  })

  it("agrupa los pedidos sin cliente bajo una misma etiqueta", () => {
    const anonimos = [
      order("", [{ product: BOWL, quantity: 1, withSalt: true }]),
    ]
    anonimos[0].customer = undefined

    const bags = aggregateBags(anonimos)

    expect(bags.customers).toEqual(["N/A"])
    expect(bags.rows[0].quantities[BOWL.name]).toBe(1)
  })
})
