import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/db/db"
import { Role } from "@prisma/client"
import { getUser, updateUser } from "@/actions/user"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  events: {
    async linkAccount({ user }) {
      if (user) {
        await updateUser(user.id, { emailVerified: new Date() })
      }
    },
  },
  callbacks: {
    async jwt({ token }) {
      if (!token.sub) return token

      const existingUser = await getUser({ where: { id: token.sub } })

      if (!existingUser) return token

      token.role = existingUser.role

      return token
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role as Role
      }

      return session
    },
  },
  session: { strategy: "jwt" },
  jwt: { maxAge: 365 * 24 * 60 * 60 },
  ...authConfig,
})
