import "server-only"

import { PermissionKey } from "@/types/types"
import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "./verify-session"

export const userHasPermission = async (
  permissionKey: PermissionKey
): Promise<boolean> => {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return false
  }

  return hasPermission(user, permissionKey)
}
