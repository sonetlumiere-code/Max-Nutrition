import { z } from "zod"

export const settingsSchema = z.object({
  operationalHours: z.string(),
})
