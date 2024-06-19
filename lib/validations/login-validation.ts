import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email({
    message: "El email es requirido.",
  }),
  password: z.string().min(6, {
    message: "Mínimo 6 caracteres son requeridos.",
  }),
})
