"use server"

import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import prisma from "@/lib/db/db"
import { RoleSchema, roleSchema } from "@/lib/validations/role-validation"
import { revalidatePath } from "next/cache"

export async function editRole({
  id,
  values,
}: {
  id: string
  values: RoleSchema
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:roles")) {
    return { error: "No autorizado." }
  }

  const validatedFields = roleSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { name, permissionsIds = [] } = validatedFields.data

  try {
    const permissionIds = Object.values(permissionsIds).flat()

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name: name.toUpperCase(),
        permissions: {
          set: permissionIds.map((permissionId) => ({ id: permissionId })),
        },
      },
    })

    revalidatePath("/roles")

    return { success: updatedRole }
  } catch (error) {
    console.error("Error updating role:", error)
    return { error: "Hubo un error al actualizar el rol." }
  }
}
