import { z } from "zod"

export const operationalHoursSchema = z.object({
  dayOfWeek: z
    .string()
    .min(1, { message: "El día de la semana es obligatorio." }),
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
