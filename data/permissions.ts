import "server-only"

import prisma from "@/lib/db/db"
import { Permission, Prisma } from "@prisma/client"

export const getPermissions = async (args?: Prisma.PermissionFindManyArgs) => {
  try {
    const permissions = await prisma.permission.findMany(args)

    return permissions as Permission[]
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return null
  }
}

export const getPermission = async (args: Prisma.PermissionFindFirstArgs) => {
  try {
    const permission = await prisma.permission.findFirst(args)

    return permission as Permission
  } catch (error) {
    console.error("Error fetching permission:", error)
    return null
  }
}
