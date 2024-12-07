import { DayOfWeek } from "@prisma/client"
import { z } from "zod"

export const operationalHoursSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, {
      message: "La hora de inicio debe estar en formato HH:MM.",
    })
    .optional()
    .nullable(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, {
      message: "La hora de finalización debe estar en formato HH:MM.",
    })
    .optional()
    .nullable(),
})
