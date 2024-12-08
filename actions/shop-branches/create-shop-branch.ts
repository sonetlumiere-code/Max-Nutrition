"use server"

import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/db"
import { shopBranchSchema } from "@/lib/validations/shop-branch-validation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

type ShopBranchSchema = z.infer<typeof shopBranchSchema>

export async function createShopBranch(values: ShopBranchSchema) {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
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
          create: operationalHours
            ?.filter((hours) => hours.startTime && hours.endTime)
            .map((hours) => ({
              dayOfWeek: hours.dayOfWeek,
              startTime: new Date(`1970-01-01T${hours.startTime}:00Z`),
              endTime: new Date(`1970-01-01T${hours.endTime}:00Z`),
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
