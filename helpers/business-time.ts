import {
  getMonth,
  getYear,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns"
import { PopulatedOrder, TimePeriod } from "@/types/types"

/**
 * El reloj del negocio.
 *
 * Vercel corre en UTC y el navegador del admin puede estar en cualquier lado,
 * así que los períodos de los reportes se calculan siempre en la hora de
 * Argentina: un pedido de las 22:00 del día 31 pertenece a ese mes y no al
 * siguiente.
 */

export const BUSINESS_TIME_ZONE = "America/Argentina/Buenos_Aires"

// Convierte una fecha al reloj de pared del negocio, para que los límites de
// semana/mes/año no dependan de la zona horaria del navegador del admin.
export const toBusinessTime = (date: Date) =>
  new Date(date.toLocaleString("en-US", { timeZone: BUSINESS_TIME_ZONE }))

// Cada período es el período calendario en curso: la semana desde el lunes,
// el mes y el año actuales. Así el filtro y la agrupación usan el mismo límite.
// Privado: solo lo usa groupOrdersByPeriod, acá abajo.
const getStartDate = (tab: TimePeriod) => {
  const now = toBusinessTime(new Date())
  switch (tab) {
    case "week":
      return startOfWeek(now, { weekStartsOn: 1 })
    case "month":
      return startOfMonth(now)
    case "year":
      return startOfYear(now)
    default:
      return null
  }
}

export function groupOrdersByPeriod(orders: PopulatedOrder[], period: TimePeriod) {
  const startDate = getStartDate(period)
  const groupedOrders: { [key: string]: PopulatedOrder[] } = {}

  for (const order of orders) {
    const orderDate = toBusinessTime(new Date(order.createdAt))
    const isInDateRange =
      !startDate ||
      isWithinInterval(orderDate, {
        start: startDate,
        end: toBusinessTime(new Date()),
      })
    if (!isInDateRange) continue

    let key = "all"
    if (period === "week") {
      key = startOfWeek(orderDate, { weekStartsOn: 1 }).toISOString()
    } else if (period === "month") {
      const month = getMonth(orderDate) + 1
      const year = getYear(orderDate)
      key = `${year}-${String(month).padStart(2, "0")}`
    } else if (period === "year") {
      key = String(getYear(orderDate))
    }

    groupedOrders[key] ??= []
    groupedOrders[key].push(order)
  }

  return groupedOrders
}
