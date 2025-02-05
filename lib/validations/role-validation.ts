import { z } from "zod"

export const roleSchema = z.object({
  name: z.string().min(1, { message: "Ingresa el nombre del rol." }),
  permissionsIds: z.record(z.string().array().optional()),
})

export type RoleSchema = z.infer<typeof roleSchema>
