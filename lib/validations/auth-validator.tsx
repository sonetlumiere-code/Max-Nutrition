import { z } from "zod"

export const zodAuthSchema = z.object({
  email: z.string().email({ message: "Email no válido." }),
  password: z.string().min(4, {
    message: "La contraseña debe tener 4 caracteres como mímino.",
  }),
})

export type UserAuthSchema = z.infer<typeof zodAuthSchema>
