"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { UserSchema, userSchema } from "@/lib/validations/user-validation"
import { revalidatePath } from "next/cache"

export async function editUser({
  id,
  values,
}: {
  id: string
  values: UserSchema
}) {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:users")) {
    return { error: "No autorizado." }
  }

  const validatedFields = userSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const { roleId } = validatedFields.data

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        roleId,
      },
    })

    revalidatePath("/users")

    return { success: updatedUser }
  } catch (error) {
    console.error("Error updating user:", error)
    return { error: "Hubo un error al actualizar el usuario." }
  }
}
