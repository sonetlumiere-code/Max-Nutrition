import "server-only"

import prisma from "@/lib/db/db"
import { Prisma, VerificationToken } from "@prisma/client"

export const getVerificationToken = async (
  args: Prisma.VerificationTokenFindFirstArgs
): Promise<VerificationToken | null> => {
  try {
    const verificationToken = prisma.verificationToken.findFirst(args)

    return verificationToken
  } catch (error) {
    return null
  }
}
