"server-only"

import prisma from "@/lib/db/db"

export const getPasswordResetToken = async (args: {
  where: {
    token?: string
    email?: string
  }
}) => {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findFirst(args)

    return passwordResetToken
  } catch (error) {
    return null
  }
}
