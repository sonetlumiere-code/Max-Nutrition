"use server"

import prisma from "@/lib/db/db"

export async function getUserPermissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: { include: { permissions: true } } },
  })

  return user?.role?.permissions ?? []
}
