import "server-only"

import prisma from "@/lib/db/db"
import { PopulatedRole } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getRoles = async (args?: Prisma.RoleFindManyArgs) => {
  try {
    const roles = await prisma.role.findMany(args)

    return roles as PopulatedRole[]
  } catch (error) {
    console.error("Error fetching roles:", error)
    return null
  }
}

export const getRole = async (args: Prisma.RoleFindFirstArgs) => {
  try {
    const role = await prisma.role.findFirst(args)

    return role as PopulatedRole
  } catch (error) {
    console.error("Error fetching role:", error)
    return null
  }
}
