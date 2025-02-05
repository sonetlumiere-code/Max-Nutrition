import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(1, {
    message: "El nombre es requerido.",
  }),
  email: z.string().email({
    message: "El email es requerido.",
  }),
  password: z
    .string()
    .min(6, { message: "Mínimo 6 caracteres son requeridos." }),
})

export type SignupSchema = z.infer<typeof signupSchema>
