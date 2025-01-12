"use server"

import { auth } from "@/lib/auth/auth"
import { deleteFromCloudinary } from "@/lib/cloudinary/cloudinary-config"

async function deleteImage(
  publicId: string
): Promise<{ success?: string; error?: string }> {
  const session = await auth()

  if (!session) {
    return { error: "No autorizado." }
  }

  if (!publicId) {
    return { error: "No hay imagen para eliminar." }
  }

  try {
    const result = await deleteFromCloudinary(publicId)

    if (result.result !== "ok") {
      throw new Error("Error eliminando imagen.")
    }

    return { success: "Imagen eliminada." }
  } catch (error) {
    console.error("Error: ", error)
    return { error: "Error eliminando imagen." }
  }
}

export default deleteImage
