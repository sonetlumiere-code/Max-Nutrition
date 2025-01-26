import { updateUser } from "@/actions/auth/user"
import { getUser } from "@/data/user"
import prisma from "@/lib/db/db"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import { sendWelcomeEmail } from "../mail/mail"
import authConfig from "./auth.config"
import { createCustomerByUser } from "@/actions/onboarding/create-customer-by-user"
import { PopulatedRole } from "@/types/types"

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  events: {
    async linkAccount({ user }) {
      if (user.id) {
        const role = await prisma.role.findUnique({
          where: { name: "USER" },
        })

        try {
          await Promise.all([
            updateUser(user.id, {
              emailVerified: new Date(),
              ...(role ? { roleId: role.id } : {}),
            }),
            createCustomerByUser({
              userId: user.id,
              name: user.name || "",
            }),
            sendWelcomeEmail({
              email: user.email || "",
              userName: user.name || user.email || "",
            }),
          ])
        } catch (error) {
          console.error("Error during linkAccount event:", error)
        }
      }
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

      const existingUser = await getUser({
        where: { id: token.sub },
        include: { role: { include: { permissions: true } } },
      })

      if (!existingUser) return token

      token.role = existingUser.role

      return token
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role as PopulatedRole
      }

      return session
    },
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  jwt: { maxAge: 7 * 24 * 60 * 60 }, // 1 week
  ...authConfig,
})
