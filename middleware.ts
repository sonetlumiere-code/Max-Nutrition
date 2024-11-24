import authConfig from "@/lib/auth/auth.config"
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes"
import { Role } from "@prisma/client"
import NextAuth from "next-auth"
import { decode } from "next-auth/jwt"

const { auth } = NextAuth(authConfig)

const secret = process.env.AUTH_SECRET as string

export default auth(async (req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const sessionToken = req.cookies.get("authjs.session-token")?.value

  const token = await decode({
    token: sessionToken,
    secret,
    salt: "authjs.session-token",
  })

  // const token = await getToken({ req, secret })

  console.log(token)
  const userRole = (token?.role as Role) || "USER"

  // console.log(token)
  // console.log(userRole)

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)

  if (isApiAuthRoute) {
    return
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return
  }

  if (!isPublicRoute) {
    if (userRole !== "ADMIN") {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  return
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
