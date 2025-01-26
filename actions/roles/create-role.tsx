"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { roleSchema } from "@/lib/validations/role-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type roleSchema = z.infer<typeof roleSchema>

export async function createRole(values: roleSchema) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:roles")) {
    return { error: "No autorizado." }
  }

  const validatedFields = roleSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, permissionsIds = {} } = validatedFields.data

  try {
    const permissionIds = Object.values(permissionsIds).flat()

    const newRole = await prisma.role.create({
      data: {
        name: name.toUpperCase(),
        group: "STAFF",
        permissions: {
          connect: permissionIds.map((permissionId) => ({ id: permissionId })),
        },
      },
    })

    revalidatePath("/roles")

    return { success: newRole }
  } catch (error) {
    console.error("Error creating role:", error)
    return { error: "Hubo un error al crear el rol." }
  }
}
