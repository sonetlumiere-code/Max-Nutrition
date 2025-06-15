import { cache } from "react"
import { auth } from "./auth"

export const verifySession = cache(async () => {
  const session = await auth()
  return session
})
