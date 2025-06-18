// "use server"

// import { hasPermission } from "@/helpers/helpers"
// import { verifySession } from "@/lib/auth/verify-session"
// import prisma from "@/lib/db/db"
// import { shopSchema, ShopSchema } from "@/lib/validations/shop-validation"
// import { revalidatePath } from "next/cache"

// export async function createShop(values: ShopSchema) {
//   const session = await verifySession()
//   const user = session?.user

//   if (!user) {
//     return { error: "No autorizado." }
//   }

//   if (!hasPermission(session.user, "create:shops")) {
//     return { error: "No autorizado." }
//   }

//   const validatedFields = shopSchema.safeParse(values)

//   if (!validatedFields.success) {
//     return { error: "Campos inválidos." }
//   }

//   const {
//     name,
//     key,
//     title,
//     description,
//     message,
//     isActive,
//     bannerImage,
//     shopCategory,
//   } = validatedFields.data

//   try {
//     const shop = await prisma.shop.create({
//       data: {
//         name,
//         key,
//         title,
//         description,
//         message,
//         isActive,
//         bannerImage,
//         shopCategory,
//       },
//     })

//     revalidatePath("/shops")

//     return { success: shop }
//   } catch (error) {
//     console.error("Error creating shop:", error)
//     return { error: "Hubo un error al crear la tienda." }
//   }
// }
