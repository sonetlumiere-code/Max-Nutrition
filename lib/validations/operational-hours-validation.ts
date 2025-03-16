import { DayOfWeek } from "@prisma/client"
import { z } from "zod"

export const operationalHoursSchema = z
  .object({
    dayOfWeek: z.nativeEnum(DayOfWeek),
    startTime: z
      .string()
      .optional()
      .superRefine((value, ctx) => {
        if (value) {
          const timeRegex = /^\d{2}:\d{2}$/
          if (!timeRegex.test(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "La hora de inicio debe estar en formato HH:MM.",
            })
          } else {
            const [hours, minutes] = value.split(":").map(Number)
            if (hours > 23 || minutes > 59) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  "La hora de inicio debe tener un máximo de 23 horas y 59 minutos.",
              })
            }
          }
        }
      }),
    endTime: z
      .string()
      .optional()
      .superRefine((value, ctx) => {
        if (value) {
          const timeRegex = /^\d{2}:\d{2}$/
          if (!timeRegex.test(value)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "La hora de finalización debe estar en formato HH:MM.",
            })
          } else {
            const [hours, minutes] = value.split(":").map(Number)
            if (hours > 23 || minutes > 59) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  "La hora de finalización debe tener un máximo de 23 horas y 59 minutos.",
              })
            }
          }
        }
      }),
  })
  .superRefine((data, ctx) => {
    const { startTime, endTime } = data

    if (startTime && !endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Si se proporciona una hora de inicio, también debe proporcionar una hora de finalización.",
        path: ["endTime"],
      })
    } else if (!startTime && endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Si se proporciona una hora de finalización, también debe proporcionar una hora de inicio.",
        path: ["startTime"],
      })
    } else if (startTime && endTime) {
      const [startHours, startMinutes] = startTime.split(":").map(Number)
      const [endHours, endMinutes] = endTime.split(":").map(Number)

      if (
        endHours < startHours ||
        (endHours === startHours && endMinutes <= startMinutes)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "La hora de finalización debe ser mayor que la hora de inicio.",
          path: ["endTime"],
        })
      }
    }
  })
