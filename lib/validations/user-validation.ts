import { z } from "zod"

export const userSchema = z.object({
  roleId: z.string().min(1, { message: "Debes seleccionar el rol." }),
})
