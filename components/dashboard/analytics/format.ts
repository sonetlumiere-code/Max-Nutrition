const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

const decimalFormatter = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
})

export const formatCurrency = (value: number) => currencyFormatter.format(value)

export const formatNumber = (value: number) => decimalFormatter.format(value)

/** Versión corta para ejes: $12k, $1,2M. */
export const formatCompactCurrency = (value: number) => {
  if (value === 0) return "$0"
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(".", ",")}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1_000)}k`
  }
  return `$${Math.round(value)}`
}

export const formatPercent = (value: number) =>
  `${value.toFixed(1).replace(".", ",")}%`

const AXIS_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 8, 10]

/**
 * Redondea hacia arriba al siguiente valor "redondo", con escalones finos para
 * que el eje no deje aire de más sobre la barra más alta.
 */
export const niceCeil = (value: number) => {
  if (value <= 0) return 0
  const magnitude = 10 ** Math.floor(Math.log10(value))
  const normalized = value / magnitude
  const step = AXIS_STEPS.find((candidate) => normalized <= candidate) ?? 10

  return step * magnitude
}
