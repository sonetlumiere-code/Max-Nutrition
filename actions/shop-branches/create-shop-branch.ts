"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import {
  ShopBranchSchema,
  shopBranchSchema,
} from "@/lib/validations/shop-branch-validation"
import { revalidatePath } from "next/cache"

const shopSettingsId = process.env.SHOP_SETTINGS_ID

export async function createShopBranch(values: ShopBranchSchema) {
  if (!shopSettingsId) {
    return { error: "Es necesario el ID de la configuración de tienda." }
  }

  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "create:shopBranches")) {
    return { error: "No autorizado." }
  }

  const validatedFields = shopBranchSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campos inválidos." }
  }

  const {
    addressNumber,
    addressGeoRef,
    branchType,
    description,
    email,
    image,
    isActive,
    label,
    latitude,
    longitude,
    locality,
    managerName,
    municipality,
    operationalHours,
    phoneNumber,
    province,
    timezone,
  } = validatedFields.data

  try {
    const shopBranch = await prisma.shopBranch.create({
      data: {
        addressNumber,
        addressStreet: addressGeoRef.calle.nombre,
        branchType,
        description,
        email,
        image,
        isActive,
        label,
        latitude,
        longitude,
        locality,
        managerName,
        municipality,
        phoneNumber,
        province,
        timezone,
        operationalHours: {
          create: operationalHours?.map((hours) => ({
            dayOfWeek: hours.dayOfWeek,
            startTime: hours.startTime || null,
            endTime: hours.endTime || null,
          })),
        },
      },
    })

    revalidatePath("/shop-branches")

    return { success: shopBranch }
  } catch (error) {
    console.error("Error creating shop branch:", error)
    return { error: "Hubo un error al crear la sucursal." }
  }
}
