"use server"

import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import {
  partialShopBranchSchema,
  PartialShopBranchSchema,
} from "@/lib/validations/shop-branch-validation"
import { revalidatePath } from "next/cache"

const shopSettingsId = process.env.SHOP_SETTINGS_ID

export async function editShopBranch({
  id,
  values,
}: {
  id: string
  values: PartialShopBranchSchema
}) {
  if (!shopSettingsId) {
    return { error: "Es necesario el ID de la configuración de tienda." }
  }

  const session = await auth()
  const user = session?.user

  if (!user) {
    return { error: "No autorizado." }
  }

  if (!hasPermission(session.user, "update:shopBranches")) {
    return { error: "No autorizado." }
  }

  const validatedFields = partialShopBranchSchema.safeParse(values)

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
    const updatedShopBranch = await prisma.shopBranch.update({
      where: { id },
      data: {
        shopSettingsId,
        addressNumber,
        addressStreet: addressGeoRef?.calle.nombre,
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
        operationalHours:
          operationalHours && operationalHours.length > 0
            ? {
                deleteMany: {},
                create: operationalHours.map(
                  ({ dayOfWeek, startTime, endTime }) => ({
                    dayOfWeek,
                    startTime: startTime || null,
                    endTime: endTime || null,
                  })
                ),
              }
            : {
                deleteMany: {},
                create: [],
              },
        phoneNumber,
        province,
        timezone,
      },
    })

    revalidatePath("/shop-branches")

    return { success: updatedShopBranch }
  } catch (error) {
    console.error("Error updating shop branch:", error)
    return { error: "Hubo un error al actualizar la sucursal." }
  }
}
