import { DayOfWeek } from "@prisma/client"
import { z } from "zod"

export const operationalHoursSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (val && !/^\d{2}:\d{2}$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La hora de inicio debe estar en formato HH:MM.",
          path: ["startTime"],
        })
      }
    }),
  endTime: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      if (val && !/^\d{2}:\d{2}$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La hora de finalización debe estar en formato HH:MM.",
          path: ["endTime"],
        })
      }
    }),
})
