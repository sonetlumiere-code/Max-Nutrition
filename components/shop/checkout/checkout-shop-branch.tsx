import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { translateDayOfWeek } from "@/helpers/helpers"
import { PopulatedShopBranch } from "@/types/types"
import { DayOfWeek } from "@prisma/client"

type CheckoutOperationalHoursProps = {
  shopBranch: PopulatedShopBranch
}

type HourGroup = {
  startDay: DayOfWeek
  endDay: DayOfWeek
  startTime: string
  endTime: string
}

const CheckoutShopBranch = ({ shopBranch }: CheckoutOperationalHoursProps) => {
  const weekdays: Partial<DayOfWeek>[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ]

  const groupConsecutiveDays = (
    hours: typeof shopBranch.operationalHours
  ): HourGroup[] => {
    const groups: HourGroup[] = []
    let currentGroup: HourGroup | null = null

    for (let i = 0; i < hours.length; i++) {
      const hour = hours[i]

      if (
        currentGroup &&
        hour.startTime === currentGroup.startTime &&
        hour.endTime === currentGroup.endTime &&
        hours[i - 1]?.dayOfWeek ===
          weekdays[weekdays.indexOf(hour.dayOfWeek as DayOfWeek) - 1]
      ) {
        currentGroup.endDay = hour.dayOfWeek as DayOfWeek
      } else {
        if (currentGroup) groups.push(currentGroup)
        currentGroup = {
          startDay: hour.dayOfWeek as DayOfWeek,
          endDay: hour.dayOfWeek as DayOfWeek,
          startTime: hour.startTime || "",
          endTime: hour.endTime || "",
        }
      }
    }

    if (currentGroup) groups.push(currentGroup)
    return groups
  }

  const validOperationalHours = shopBranch.operationalHours.filter(
    (hour) => hour.startTime && hour.endTime
  )

  const weekdaysHours = validOperationalHours
    .filter((hour) =>
      weekdays.includes(hour.dayOfWeek as keyof typeof DayOfWeek)
    )
    .sort(
      (a, b) =>
        weekdays.indexOf(a.dayOfWeek as DayOfWeek) -
        weekdays.indexOf(b.dayOfWeek as DayOfWeek)
    )

  const groupedWeekdays = groupConsecutiveDays(weekdaysHours)

  const saturdayHours = validOperationalHours.find(
    (hour) => hour.dayOfWeek === "SATURDAY"
  )
  const sundayHours = validOperationalHours.find(
    (hour) => hour.dayOfWeek === "SUNDAY"
  )

  let message = groupedWeekdays
    .map((group) =>
      group.startDay === group.endDay
        ? `${translateDayOfWeek(group.startDay)}: ${group.startTime} a ${
            group.endTime
          }`
        : `Abierto de ${translateDayOfWeek(
            group.startDay
          )} a ${translateDayOfWeek(group.endDay)} de ${group.startTime} a ${
            group.endTime
          }`
    )
    .join(", ")

  if (saturdayHours) {
    message += ` y ${translateDayOfWeek("SATURDAY")} de ${
      saturdayHours.startTime
    } a ${saturdayHours.endTime}`
  }

  if (sundayHours) {
    message += `\n${translateDayOfWeek("SUNDAY")}: ${sundayHours.startTime} a ${
      sundayHours.endTime
    }`
  }

  return (
    <Alert className='border-none'>
      {/* <Icons.store className='h-4 w-4' /> */}
      <AlertTitle>{shopBranch.label}</AlertTitle>
      <AlertDescription className='text-muted-foreground'>
        {message}
      </AlertDescription>
    </Alert>
  )
}

export default CheckoutShopBranch
