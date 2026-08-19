import { describe, expect, it } from "vitest"
import { Ingredient, Measurement } from "@prisma/client"
import {
  calculateIngredientData,
  conversionFactors,
  getBaseMeasurement,
} from "@/helpers/helpers"

/** Ingrediente mínimo: solo los campos que intervienen en el cálculo. */
const ingredient = (overrides: Partial<Ingredient>): Ingredient =>
  ({
    id: "ing",
    name: "Ingrediente",
    measurement: Measurement.KILOGRAM,
    amountPerMeasurement: 1,
    price: 1000,
    waste: 0,
    ...overrides,
  }) as Ingredient

describe("getBaseMeasurement", () => {
  it("lleva las unidades de peso a gramos", () => {
    expect(getBaseMeasurement(Measurement.KILOGRAM)).toBe(Measurement.GRAM)
    expect(getBaseMeasurement(Measurement.GRAM)).toBe(Measurement.GRAM)
    expect(getBaseMeasurement(Measurement.MILLIGRAM)).toBe(Measurement.GRAM)
  })

  it("lleva las unidades de volumen a mililitros", () => {
    expect(getBaseMeasurement(Measurement.LITER)).toBe(Measurement.MILLILITER)
    expect(getBaseMeasurement(Measurement.MILLILITER)).toBe(
      Measurement.MILLILITER
    )
  })

  it("deja las unidades sueltas como están", () => {
    expect(getBaseMeasurement(Measurement.UNIT)).toBe(Measurement.UNIT)
  })

  it("es idempotente: aplicarlo dos veces no cambia el resultado", () => {
    Object.values(Measurement).forEach((measurement) => {
      const once = getBaseMeasurement(measurement)
      expect(getBaseMeasurement(once)).toBe(once)
    })
  })
})

describe("conversionFactors", () => {
  it("expresa cuántas unidades base entra en cada medida", () => {
    expect(conversionFactors.KILOGRAM).toBe(1000)
    expect(conversionFactors.GRAM).toBe(1)
    expect(conversionFactors.MILLIGRAM).toBe(0.001)
    expect(conversionFactors.LITER).toBe(1000)
    expect(conversionFactors.MILLILITER).toBe(1)
    expect(conversionFactors.UNIT).toBe(1)
  })
})

describe("calculateIngredientData — precio por unidad base", () => {
  it("convierte un precio por kilo a precio por gramo", () => {
    // $9000 el kilo, receta de 100 g netos, sin merma.
    const { cost, totalQuantity, baseMeasurement } = calculateIngredientData({
      ingredient: ingredient({ price: 9000, measurement: Measurement.KILOGRAM }),
      quantity: 100,
    })

    expect(baseMeasurement).toBe(Measurement.GRAM)
    expect(totalQuantity).toBe(100)
    expect(cost).toBeCloseTo(900, 6)
  })

  it("respeta amountPerMeasurement: el precio es por el paquete entero", () => {
    // $3500 el paquete de 5 kg => $0,70 por gramo.
    const { cost } = calculateIngredientData({
      ingredient: ingredient({
        price: 3500,
        amountPerMeasurement: 5,
        measurement: Measurement.KILOGRAM,
      }),
      quantity: 1000,
    })

    expect(cost).toBeCloseTo(700, 6)
  })

  it("maneja miligramos, cuyo factor es fraccionario", () => {
    // $500 cada 100 mg => $5 por mg => $5000 por gramo.
    const { cost } = calculateIngredientData({
      ingredient: ingredient({
        price: 500,
        amountPerMeasurement: 100,
        measurement: Measurement.MILLIGRAM,
      }),
      quantity: 1,
    })

    expect(cost).toBeCloseTo(5000, 6)
  })

  it("convierte litros a mililitros", () => {
    const { cost, baseMeasurement } = calculateIngredientData({
      ingredient: ingredient({ price: 1500, measurement: Measurement.LITER }),
      quantity: 250,
    })

    expect(baseMeasurement).toBe(Measurement.MILLILITER)
    expect(cost).toBeCloseTo(375, 6)
  })

  it("cuenta las unidades tal cual", () => {
    const { cost } = calculateIngredientData({
      ingredient: ingredient({ price: 0.07, measurement: Measurement.UNIT }),
      quantity: 100,
    })

    expect(cost).toBeCloseTo(7, 6)
  })
})

describe("calculateIngredientData — merma", () => {
  it("compra de más para terminar con la cantidad neta pedida", () => {
    // Con 20% de merma, para quedarse con 100 g netos hay que comprar 125 g:
    // 125 × (1 − 0,20) = 100.
    const { adjustedQuantity, totalQuantity } = calculateIngredientData({
      ingredient: ingredient({ waste: 20 }),
      quantity: 100,
    })

    expect(adjustedQuantity).toBe(100)
    expect(totalQuantity).toBeCloseTo(125, 6)
    expect(totalQuantity * (1 - 0.2)).toBeCloseTo(100, 6)
  })

  it("no altera la cantidad cuando la merma es cero", () => {
    const { totalQuantity } = calculateIngredientData({
      ingredient: ingredient({ waste: 0 }),
      quantity: 250,
    })

    expect(totalQuantity).toBe(250)
  })

  it("ignora la merma cuando se pide sin ella", () => {
    const { totalQuantity } = calculateIngredientData({
      ingredient: ingredient({ waste: 50 }),
      quantity: 100,
      withWaste: false,
    })

    expect(totalQuantity).toBe(100)
  })

  it("cobra sobre la cantidad comprada, no sobre la neta", () => {
    // $1000/kg = $1 por gramo. Con 50% de merma, 100 g netos cuestan 200 g.
    const { cost } = calculateIngredientData({
      ingredient: ingredient({ price: 1000, waste: 50 }),
      quantity: 100,
    })

    expect(cost).toBeCloseTo(200, 6)
  })

  it("acota la merma al 99% para no dividir por cero", () => {
    const { totalQuantity } = calculateIngredientData({
      ingredient: ingredient({ waste: 100 }),
      quantity: 100,
    })

    expect(Number.isFinite(totalQuantity)).toBe(true)
    expect(totalQuantity).toBeCloseTo(10_000, 6)
  })

  it("trata una merma negativa como cero", () => {
    const { totalQuantity } = calculateIngredientData({
      ingredient: ingredient({ waste: -30 }),
      quantity: 100,
    })

    expect(totalQuantity).toBe(100)
  })

  it("crece de forma monótona con la merma", () => {
    const cantidades = [0, 10, 25, 50, 75].map(
      (waste) =>
        calculateIngredientData({
          ingredient: ingredient({ waste }),
          quantity: 100,
        }).totalQuantity
    )

    cantidades.forEach((cantidad, index) => {
      if (index > 0) expect(cantidad).toBeGreaterThan(cantidades[index - 1])
    })
  })
})
