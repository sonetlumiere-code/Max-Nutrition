import { z } from "zod"

export const resetPasswordSchema = z.object({
  email: z.string().email({
    message: "El email es requerido.",
  }),
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
