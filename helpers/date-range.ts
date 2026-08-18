import { BUSINESS_TIME_ZONE, toBusinessTime } from "@/helpers/helpers"
import { AnalyticsPeriod } from "@/types/types"

export type DateRangeBounds = { start: Date; end: Date }

/**
 * Diferencia entre la hora de pared del negocio y el instante real, tal como la
 * ve este runtime. Es 0 si el servidor ya corre en el huso del negocio. Se
 * redondea al minuto porque los offsets horarios nunca tienen fracciones.
 */
const getBusinessSkewMs = (date: Date) => {
  const skew = toBusinessTime(date).getTime() - date.getTime()
  return Math.round(skew / 60_000) * 60_000
}

/** Inversa de toBusinessTime: de hora de pared del negocio a instante real. */
export const fromBusinessTime = (wallClock: Date) =>
  new Date(wallClock.getTime() - getBusinessSkewMs(wallClock))

/**
 * Límites del período calendario en curso y del período anterior equivalente,
 * calculados sobre la hora del negocio y devueltos como instantes UTC.
 */
export const getPeriodRange = (period: AnalyticsPeriod) => {
  const nowBusiness = toBusinessTime(new Date())
  const year = nowBusiness.getFullYear()
  const month = nowBusiness.getMonth()
  const date = nowBusiness.getDate()

  let currentStart: Date
  let previousStart: Date

  if (period === "week") {
    // Semana desde el lunes.
    const weekday = (nowBusiness.getDay() + 6) % 7
    currentStart = new Date(year, month, date - weekday)
    previousStart = new Date(year, month, date - weekday - 7)
  } else if (period === "month") {
    currentStart = new Date(year, month, 1)
    previousStart = new Date(year, month - 1, 1)
  } else {
    currentStart = new Date(year, 0, 1)
    previousStart = new Date(year - 1, 0, 1)
  }

  return {
    start: fromBusinessTime(currentStart),
    end: fromBusinessTime(nowBusiness),
    previousStart: fromBusinessTime(previousStart),
    previousEnd: fromBusinessTime(currentStart),
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Convierte dos fechas "YYYY-MM-DD" en un rango de instantes que cubre los días
 * completos en la hora del negocio, de la medianoche del primero al último
 * milisegundo del segundo. Devuelve null si las fechas no son válidas.
 */
export const getRangeFromDates = (
  from?: string,
  to?: string
): DateRangeBounds | null => {
  if (!from || !to || !ISO_DATE.test(from) || !ISO_DATE.test(to)) return null

  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number)
  const [toYear, toMonth, toDay] = to.split("-").map(Number)

  const start = new Date(fromYear, fromMonth - 1, fromDay, 0, 0, 0, 0)
  const end = new Date(toYear, toMonth - 1, toDay, 23, 59, 59, 999)

  // El constructor de Date normaliza los desbordes en silencio (el mes 13 pasa
  // a enero del año siguiente), así que se comprueba que la fecha construida
  // sea realmente la que se pidió.
  const isFaithful = (date: Date, year: number, month: number, day: number) =>
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day

  if (!isFaithful(start, fromYear, fromMonth, fromDay)) return null
  if (!isFaithful(end, toYear, toMonth, toDay)) return null
  if (start > end) return null

  return { start: fromBusinessTime(start), end: fromBusinessTime(end) }
}

/** Formatea una fecha como "YYYY-MM-DD" en la hora del negocio. */
export const toBusinessDateString = (date: Date) => {
  const business = toBusinessTime(date)
  const month = String(business.getMonth() + 1).padStart(2, "0")
  const day = String(business.getDate()).padStart(2, "0")

  return `${business.getFullYear()}-${month}-${day}`
}

export { BUSINESS_TIME_ZONE }
