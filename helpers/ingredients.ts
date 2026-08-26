import { Ingredient, Measurement } from "@prisma/client"
import { BaseMeasurement } from "@/types/types"

/**
 * Costo y conversión de unidades de un ingrediente.
 *
 * Dos reglas mandan acá: las cantidades entran **siempre en unidad base**
 * (gramos, mililitros, unidades) sin importar cómo se compre el ingrediente, y
 * la merma se calcula sobre el bruto —lo que hay que comprar para que quede la
 * cantidad neta de la receta—, no como un recargo sobre la neta.
 */

export function getBaseMeasurement(measurement: Measurement): BaseMeasurement {
  switch (measurement) {
    case Measurement.UNIT:
      return Measurement.UNIT
    case Measurement.GRAM:
      return Measurement.GRAM
    case Measurement.MILLIGRAM:
      return Measurement.GRAM
    case Measurement.KILOGRAM:
      return Measurement.GRAM
    case Measurement.MILLILITER:
      return Measurement.MILLILITER
    case Measurement.LITER:
      return Measurement.MILLILITER
    default:
      throw new Error(`Unknown measurement unit: ${measurement}`)
  }
}

export const conversionFactors: Record<Measurement, number> = {
  KILOGRAM: 1000, // 1 kilogram = 1000 grams
  GRAM: 1, // Base unit
  MILLIGRAM: 0.001, // 1 milligram = 0.001 grams
  LITER: 1000, // 1 liter = 1000 milliliters
  MILLILITER: 1, // Base unit
  UNIT: 1, // Units are counted as-is
}

export const calculateIngredientData = ({
  ingredient,
  quantity, // This value is assumed to be in the base unit already.
  withWaste = true,
}: {
  ingredient: Ingredient
  quantity: number
  withWaste?: boolean
}) => {
  const baseMeasurement = getBaseMeasurement(ingredient.measurement)

  // Compute the price per base unit
  const conversionFactor = conversionFactors[ingredient.measurement] || 1
  const pricePerBaseUnit =
    ingredient.price / (ingredient.amountPerMeasurement * conversionFactor)

  // Merma sobre bruto: para terminar con `quantity` neto hay que comprar
  // quantity / (1 - desperdicio%). Se acota a 99% para no dividir por cero.
  const wastePct = Math.min(Math.max(ingredient.waste, 0), 99)
  const totalQuantity = withWaste ? quantity / (1 - wastePct / 100) : quantity

  // Calculate cost using the per–base-unit price
  const cost = totalQuantity * pricePerBaseUnit

  return {
    adjustedQuantity: quantity, // Given in base unit
    totalQuantity, // Including waste
    cost, // Total cost in base unit price
    baseMeasurement, // The base unit (GRAM, MILLILITER, or UNIT)
  }
}
