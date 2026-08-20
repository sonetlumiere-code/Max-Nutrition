import { DateRangeBounds } from "@/helpers/date-range"

export const ORDERS_ENDPOINT = "/api/orders"

/**
 * Formatea una fecha como "YYYY-MM-DD" usando sus componentes locales.
 *
 * El calendario del filtro entrega la medianoche local del día que el usuario
 * tocó, así que lo que importa es el día que vio en pantalla, no el instante:
 * convertirlo con `toISOString()` correría la fecha un día en cualquier huso al
 * oeste de UTC. Después `getRangeFromDates` interpreta ese día en la hora del
 * negocio, que es el criterio con el que se guardan los pedidos.
 */
export const toPickedDateString = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Arma la URL de la API de pedidos para un rango dado. Cada límite es opcional:
 * los filtros por período mandan solo el inicio (no hay pedidos en el futuro) y
 * el rango manual manda los dos. Sin rango, `null`, se piden todos.
 *
 * La URL es además la clave de SWR, así que dos filtros distintos son dos
 * entradas de caché distintas y volver a un filtro ya visto no espera red.
 */
export const buildOrdersUrl = (range: Partial<DateRangeBounds> | null) => {
  const params = new URLSearchParams()

  if (range?.start) {
    params.set("createdAt[gte]", range.start.toISOString())
  }

  if (range?.end) {
    params.set("createdAt[lte]", range.end.toISOString())
  }

  const query = params.toString()

  return query ? `${ORDERS_ENDPOINT}?${query}` : ORDERS_ENDPOINT
}

/** Identifica cualquier clave de SWR que apunte a la lista de pedidos. */
export const isOrdersKey = (key: unknown): key is string =>
  typeof key === "string" && key.startsWith(ORDERS_ENDPOINT)
