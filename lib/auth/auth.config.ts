import { updateUser } from "@/actions/auth/user"
import { createCustomer } from "@/actions/customer/create-customer"
import { getUser } from "@/data/user"
import prisma from "@/lib/db/db"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { sendWelcomeEmail } from "../mail/mail"
import { loginSchema } from "../validations/login-validation"

export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          })

          if (!user || !user.password) {
            return null
          }

          const passwordsMatch = await bcrypt.compare(password, user.password)

          if (passwordsMatch) {
            return user
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth-error",
  },
  events: {
    async linkAccount({ user }) {
      if (user.id) {
        await Promise.all([
          updateUser({
            emailVerified: new Date(),
          }),
          createCustomer({
            name: user.name || "",
          }),
          sendWelcomeEmail(user.email || "", user.name || user.email || ""),
        ])
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
} satisfies NextAuthConfig
