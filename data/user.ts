"server-only"

import { excludeFromList, excludeFromObject } from "@/helpers/helpers"
import prisma from "@/lib/db/db"
import { PopulatedUser, PopulatedSafeUser } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getUsers = async (args?: Prisma.UserFindManyArgs) => {
  try {
    const users = await prisma.user.findMany(args)

    return users as PopulatedUser[]
  } catch (error) {
    console.error("Error fetching users:", error)
    return null
  }
}

export const getSafeUsers = async (
  args?: Prisma.UserFindManyArgs
): Promise<PopulatedSafeUser[] | null> => {
  try {
    const users = await prisma.user.findMany(args)

    return excludeFromList(users, ["password"])
  } catch (error) {
    console.error("Error fetching users:", error)
    return null
  }
}

export const getUser = async (args: Prisma.UserFindFirstArgs) => {
  try {
    const user = await prisma.user.findFirst(args)

    return user as PopulatedUser
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export const getSafeUser = async (
  args: Prisma.UserFindFirstArgs
): Promise<PopulatedSafeUser | null> => {
  try {
    const user = await prisma.user.findFirst(args)

    if (user) {
      return excludeFromObject(user, ["password"])
    }

    return null
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}
