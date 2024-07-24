import { UploadApiResponse, v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const folder = "MaxNutrition"

const uploadToCloudinary = async (image: File): Promise<UploadApiResponse> => {
  const fileBuffer = await image.arrayBuffer()
  const mime = image.type
  const encoding = "base64"
  const base64Data = Buffer.from(fileBuffer).toString("base64")
  const fileUri = `data:${mime};${encoding},${base64Data}`

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload(fileUri, {
        folder,
        invalidate: true,
      })
      .then((result) => {
        console.log(result)
        resolve(result)
      })
      .catch((error) => {
        console.error(error)
        reject(error)
      })
  })
}

const deleteFromCloudinary = async (publicId: string) => {
  const res = await cloudinary.uploader.destroy(`${folder}/${publicId}`)
  return res
}

export { uploadToCloudinary, deleteFromCloudinary }
