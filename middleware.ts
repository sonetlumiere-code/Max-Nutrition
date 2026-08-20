import authConfig from "@/lib/auth/auth.config"
import { resolveRouteAccess } from "@/lib/auth/route-access"
import { DEFAULT_REDIRECT_SHOP } from "@/routes"
import NextAuth from "next-auth"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl, method } = req
  const isLoggedIn = !!req.auth

  const access = resolveRouteAccess(nextUrl.pathname, method)

  if (access.kind === "bypass" || access.kind === "public") {
    return
  }

  if (access.kind === "auth") {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_REDIRECT_SHOP, nextUrl))
    }
    return
  }

  if (!isLoggedIn) {
    return Response.redirect(
      new URL(
        `/login?redirectTo=${encodeURIComponent(access.baseRoute)}`,
        nextUrl
      )
    )
  }

  return
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
