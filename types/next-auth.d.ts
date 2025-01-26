import { Role } from "@prisma/client"
import NextAuth, { type DefaultSession } from "next-auth"
import { PopulatedRole } from "./types"

export type ExtendedUser = DefaultSession["user"] & {
  role: PopulatedRole
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }
}
