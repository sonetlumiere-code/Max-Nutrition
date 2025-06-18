"use server"

import { verifySession } from "@/lib/auth/verify-session"
import { deleteFromCloudinary } from "@/lib/cloudinary/cloudinary-config"

async function deleteImage(
  publicId: string
): Promise<{ success?: string; error?: string }> {
  const session = await verifySession()

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
