import { DayOfWeek, OperationalHours } from "@prisma/client"
import { HourGroup } from "@/types/types"
import { translateDayOfWeek } from "@/helpers/helpers"

/**
 * Horario de atención de una tienda.
 *
 * Decide si se puede pedir ahora —lo consulta el servidor antes de aceptar un
 * pedido— y arma el cartel que le promete al cliente cuándo puede hacerlo. Las
 * dos cosas se resuelven con el reloj de Argentina, no con el del servidor.
 */

export function getOperationalHoursMessage(
  operationalHours: OperationalHours[]
): string {
  const daysOfWeek = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ]

  const validOperationalHours = operationalHours
    .filter((hour) => hour.startTime && hour.endTime)
    .sort(
      (a, b) =>
        daysOfWeek.indexOf(a.dayOfWeek as DayOfWeek) -
        daysOfWeek.indexOf(b.dayOfWeek as DayOfWeek)
    )

  if (validOperationalHours.length === 0) return "No hay horarios disponibles"

  const groupConsecutiveDays = (
    hours: typeof validOperationalHours
  ): HourGroup[] => {
    const groups: HourGroup[] = []
    let currentGroup: HourGroup | null = null

    for (let i = 0; i < hours.length; i++) {
      const hour = hours[i]
      const prevDayIndex = daysOfWeek.indexOf(hour.dayOfWeek as DayOfWeek) - 1
      const prevDay = prevDayIndex >= 0 ? daysOfWeek[prevDayIndex] : null

      if (
        currentGroup &&
        hour.startTime === currentGroup.startTime &&
        hour.endTime === currentGroup.endTime &&
        hours[i - 1]?.dayOfWeek === prevDay
      ) {
        currentGroup.endDay = hour.dayOfWeek as DayOfWeek
      } else {
        if (currentGroup) groups.push(currentGroup)
        currentGroup = {
          startDay: hour.dayOfWeek as DayOfWeek,
          endDay: hour.dayOfWeek as DayOfWeek,
          startTime: hour.startTime!, // non-null assertion
          endTime: hour.endTime!, // non-null assertion
        }
      }
    }

    if (currentGroup) groups.push(currentGroup)
    return groups
  }

  const groupedHours = groupConsecutiveDays(validOperationalHours)

  const message = groupedHours
    .map((group) => {
      const isFullDay = group.startTime === "00:00" && group.endTime === "23:59"
      if (group.startDay === group.endDay) {
        return isFullDay
          ? `${translateDayOfWeek(group.startDay)}`
          : `${translateDayOfWeek(group.startDay)}: ${group.startTime} a ${
              group.endTime
            }`
      } else {
        return isFullDay
          ? `de ${translateDayOfWeek(group.startDay)} a ${translateDayOfWeek(
              group.endDay
            )}`
          : `${translateDayOfWeek(group.startDay)} a ${translateDayOfWeek(
              group.endDay
            )} de ${group.startTime} a ${group.endTime}`
      }
    })
    .join(", ")

  return message
}

export function isShopCurrentlyAvailable(
  operationalHours?: OperationalHours[]
): boolean {
  if (!operationalHours) {
    return false
  }
  // Get current date/time in Buenos Aires time zone
  const now = new Date()
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const formattedTime = timeFormatter.format(now)
  const [rawHour, currentMinute] = formattedTime.split(":").map(Number)
  // Adjust hour if it equals 24, converting to 0 (for times after midnight)
  const currentHour = rawHour === 24 ? 0 : rawHour

  // Get the weekday name in English (e.g. "Monday")
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
  })
  const dayName = dayFormatter.format(now)

  // Map English weekday names to your enum values
  const dayMapping: Record<string, DayOfWeek> = {
    Monday: DayOfWeek.MONDAY,
    Tuesday: DayOfWeek.TUESDAY,
    Wednesday: DayOfWeek.WEDNESDAY,
    Thursday: DayOfWeek.THURSDAY,
    Friday: DayOfWeek.FRIDAY,
    Saturday: DayOfWeek.SATURDAY,
    Sunday: DayOfWeek.SUNDAY,
  }

  const currentDayOfWeek = dayMapping[dayName]

  // Find today's operational hours (ensuring both startTime and endTime are defined)
  const todayHours = operationalHours.find(
    (h) => h.dayOfWeek === currentDayOfWeek && h.startTime && h.endTime
  )

  // Check if hours exist and are non-null
  if (!todayHours || !todayHours.startTime || !todayHours.endTime) return false

  // Parse startTime and endTime
  const [startHour, startMinute] = todayHours.startTime.split(":").map(Number)
  const [endHour, endMinute] = todayHours.endTime.split(":").map(Number)

  // Convert all times to minutes since midnight
  const currentTotal = currentHour * 60 + currentMinute
  const startTotal = startHour * 60 + startMinute
  const endTotal = endHour * 60 + endMinute

  // Check if current time is within the interval
  return currentTotal >= startTotal && currentTotal <= endTotal
}
