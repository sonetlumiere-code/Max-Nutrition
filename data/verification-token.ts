"use server"

import prisma from "@/lib/db/db"
import { VerificationToken } from "@prisma/client"

export const getVerificationToken = async (params: {
  where: {
    email?: string
  }
}): Promise<VerificationToken | null> => {
  try {
    const verificationToken = prisma.verificationToken.findFirst(params)

    return verificationToken
  } catch (error) {
    return null
  }
}
