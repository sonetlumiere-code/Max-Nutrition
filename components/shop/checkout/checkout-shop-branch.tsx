import { Icons } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { translateDayOfWeek } from "@/helpers/helpers"
import { PopulatedShopBranch } from "@/types/types"
import { DayOfWeek } from "@prisma/client"

type CheckoutOperationalHoursProps = {
  shopBranch: PopulatedShopBranch
}

const CheckoutShopBranch = ({ shopBranch }: CheckoutOperationalHoursProps) => {
  const weekdays: Partial<DayOfWeek>[] = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
  ]

  const weekdaysHours = shopBranch.operationalHours.filter((hour) =>
    weekdays.includes(hour.dayOfWeek as keyof typeof DayOfWeek)
  )

  const areWeekdaysSameHours =
    weekdaysHours.length === 5 &&
    weekdaysHours.every(
      (hour) =>
        hour.startTime === weekdaysHours[0].startTime &&
        hour.endTime === weekdaysHours[0].endTime
    )

  const saturdayHours = shopBranch.operationalHours.find(
    (hour) => hour.dayOfWeek === "SATURDAY"
  )
  const sundayHours = shopBranch.operationalHours.find(
    (hour) => hour.dayOfWeek === "SUNDAY"
  )

  let message = ""

  if (areWeekdaysSameHours) {
    message = `Abierto de ${translateDayOfWeek(
      weekdays[0]
    )} a ${translateDayOfWeek(weekdays[4])} de ${
      weekdaysHours[0].startTime
    } a ${weekdaysHours[0].endTime}`
  } else {
    message += weekdaysHours
      .map(
        (hour) =>
          `${translateDayOfWeek(hour.dayOfWeek)}: ${hour.startTime} a ${
            hour.endTime
          }`
      )
      .join(", ")
  }

  if (saturdayHours && saturdayHours.startTime && saturdayHours.endTime) {
    message += ` y ${translateDayOfWeek("SATURDAY")} de ${
      saturdayHours.startTime
    } a ${saturdayHours.endTime}`
  }

  if (sundayHours && sundayHours.startTime && sundayHours.endTime) {
    message += `\n${translateDayOfWeek("SUNDAY")}: ${sundayHours.startTime} a ${
      sundayHours.endTime
    }`
  }

  return (
    <Alert>
      <Icons.store className='h-4 w-4' />
      <AlertTitle>{shopBranch.label}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}

export default CheckoutShopBranch
