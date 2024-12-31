"use server"

import { auth } from "@/lib/auth/auth"
import { uploadToCloudinary } from "@/lib/cloudinary/cloudinary-config"

async function uploadImage(
  formData: FormData
): Promise<{ message?: string; public_id?: string; error?: string }> {
  try {
    const session = await auth()

    if (!session) {
      return { error: "No autorizado." }
    }

    const imageFile = formData.get("imageFile") as File

    if (!imageFile) {
      return { error: "No hay imagen para subir" }
    }

    const result = await uploadToCloudinary(imageFile)

    return {
      message: "Imagen subida correctamente",
      public_id: result.public_id,
    }
  } catch (error) {
    console.error("Error uploading image:", error)
    return { error: "Error subiendo imagen." }
  }
}

export default uploadImage
