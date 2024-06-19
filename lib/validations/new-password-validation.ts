import { z } from "zod"

export const newPasswordSchema = z.object({
  password: z.string().min(6, {
    message: "Mínimo 6 caracteres son requeridos.",
  }),
})
