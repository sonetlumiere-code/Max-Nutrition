import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/db/db"
import authConfig from "./auth.config"
import { Role } from "@prisma/client"
import { getUser } from "@/data/user"

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        return true
      }

      const existingUser = await getUser({ where: { id: user.id } })

      if (!existingUser?.emailVerified) {
        return false
      }

      return true
    },

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
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  jwt: { maxAge: 7 * 24 * 60 * 60 }, // 1 week
  ...authConfig,
})
