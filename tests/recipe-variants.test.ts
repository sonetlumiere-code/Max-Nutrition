import { describe, expect, it } from "vitest"
import { IngredientVariantScope } from "@prisma/client"
import {
  REFERENCE_VARIANT_WITH_SALT,
  appliesToVariant,
  ingredientsForVariant,
} from "@/helpers/recipe-variants"

const { ALWAYS, ONLY_WITH_SALT, ONLY_WITHOUT_SALT } = IngredientVariantScope

describe("appliesToVariant", () => {
  it("lo que va siempre entra en las dos variantes", () => {
    expect(appliesToVariant(ALWAYS, true)).toBe(true)
    expect(appliesToVariant(ALWAYS, false)).toBe(true)
  })

  it("la sal entra solo en la vianda con sal", () => {
    expect(appliesToVariant(ONLY_WITH_SALT, true)).toBe(true)
    expect(appliesToVariant(ONLY_WITH_SALT, false)).toBe(false)
  })

  it("el reemplazo entra solo en la vianda sin sal", () => {
    expect(appliesToVariant(ONLY_WITHOUT_SALT, false)).toBe(true)
    expect(appliesToVariant(ONLY_WITHOUT_SALT, true)).toBe(false)
  })

  it("una fila sin variante definida se comporta como antes de la columna", () => {
    // Las recetas cargadas antes de que existiera variantScope no deben
    // desaparecer de la lista de compras.
    expect(appliesToVariant(undefined, true)).toBe(true)
    expect(appliesToVariant(undefined, false)).toBe(true)
    expect(appliesToVariant(null, true)).toBe(true)
    expect(appliesToVariant(null, false)).toBe(true)
  })
})

describe("ingredientsForVariant", () => {
  const SAL = { id: "sal", variantScope: ONLY_WITH_SALT }
  const HIERBAS = { id: "hierbas", variantScope: ONLY_WITHOUT_SALT }
  const CARNE = { id: "carne", variantScope: ALWAYS }
  const VIEJO = { id: "viejo" }

  // Anotado a mano: el array mezcla filas con variante y una vieja sin la
  // columna, que es justo lo que el helper tiene que tolerar.
  const RECETA: { id: string; variantScope?: IngredientVariantScope }[] = [
    SAL,
    HIERBAS,
    CARNE,
    VIEJO,
  ]

  it("la versión con sal lleva la sal y no el reemplazo", () => {
    expect(ingredientsForVariant(RECETA, true).map((i) => i.id)).toEqual([
      "sal",
      "carne",
      "viejo",
    ])
  })

  it("la versión sin sal lleva el reemplazo y no la sal", () => {
    expect(ingredientsForVariant(RECETA, false).map((i) => i.id)).toEqual([
      "hierbas",
      "carne",
      "viejo",
    ])
  })

  it("tolera una receta vacía o ausente", () => {
    expect(ingredientsForVariant([], true)).toEqual([])
    expect(ingredientsForVariant(null, true)).toEqual([])
    expect(ingredientsForVariant(undefined, false)).toEqual([])
  })

  it("no muta la lista original", () => {
    const original = [...RECETA]
    ingredientsForVariant(RECETA, false)

    expect(RECETA).toEqual(original)
  })

  it("la variante de referencia de las pantallas de costo es la con sal", () => {
    expect(REFERENCE_VARIANT_WITH_SALT).toBe(true)
    expect(
      ingredientsForVariant(RECETA, REFERENCE_VARIANT_WITH_SALT).map(
        (i) => i.id
      )
    ).toContain("sal")
  })
})
