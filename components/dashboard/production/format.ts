import { Measurement } from "@prisma/client"

const number = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 })

/**
 * Muestra una cantidad en la unidad más práctica para comprar: los gramos y
 * mililitros pasan a kilos y litros cuando el número lo justifica.
 */
export const formatQuantity = (quantity: number, measurement: Measurement) => {
  if (measurement === Measurement.GRAM && quantity >= 1000) {
    return `${number.format(quantity / 1000)} kg`
  }
  if (measurement === Measurement.MILLILITER && quantity >= 1000) {
    return `${number.format(quantity / 1000)} L`
  }

  const suffix =
    measurement === Measurement.GRAM
      ? "g"
      : measurement === Measurement.MILLILITER
      ? "ml"
      : quantity === 1
      ? "unidad"
      : "unidades"

  return `${number.format(quantity)} ${suffix}`
}
