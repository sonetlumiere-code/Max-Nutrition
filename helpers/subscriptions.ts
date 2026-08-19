import { DayOfWeek } from "@prisma/client"
import { toBusinessTime } from "@/helpers/helpers"
import { toBusinessDateString } from "@/helpers/date-range"

/** getDay() de JavaScript empieza en domingo. */
const WEEKDAYS: DayOfWeek[] = [
  DayOfWeek.SUNDAY,
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
]

/** Día de la semana de una fecha, en la hora del negocio. */
export const businessWeekday = (date: Date): DayOfWeek =>
  WEEKDAYS[toBusinessTime(date).getDay()]

export type DueSubscription = {
  weekday: DayOfWeek
  isActive: boolean
  lastRunAt: Date | null
}

/**
 * Decide si una suscripción tiene que generar su pedido ahora.
 *
 * Se apoya en lastRunAt para ser idempotente: si el cron corre dos veces el
 * mismo día —por un reintento o por una configuración duplicada— el cliente no
 * recibe dos pedidos.
 */
export const isSubscriptionDue = (
  subscription: DueSubscription,
  now: Date = new Date()
) => {
  if (!subscription.isActive) return false
  if (businessWeekday(now) !== subscription.weekday) return false
  if (!subscription.lastRunAt) return true

  return toBusinessDateString(subscription.lastRunAt) !==
    toBusinessDateString(now)
}

export const WEEKDAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.MONDAY]: "Lunes",
  [DayOfWeek.TUESDAY]: "Martes",
  [DayOfWeek.WEDNESDAY]: "Miércoles",
  [DayOfWeek.THURSDAY]: "Jueves",
  [DayOfWeek.FRIDAY]: "Viernes",
  [DayOfWeek.SATURDAY]: "Sábado",
  [DayOfWeek.SUNDAY]: "Domingo",
}

export const translateWeekday = (weekday: DayOfWeek) => WEEKDAY_LABELS[weekday]
