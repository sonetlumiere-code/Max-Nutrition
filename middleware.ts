import authConfig from "@/lib/auth/auth.config"
import {
  DEFAULT_REDIRECT_SHOP,
  apiAuthPrefix,
  apiPublicRoutes,
  authRoutes,
  publicRoutes,
  shopRoutes,
} from "@/routes"
import NextAuth from "next-auth"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl, method } = req
  const isLoggedIn = !!req.auth

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isApiPublicRoute = apiPublicRoutes.includes(nextUrl.pathname)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)

  if (isApiAuthRoute) {
    return
  }

  if (isApiPublicRoute && method === "GET") {
    return
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_REDIRECT_SHOP, nextUrl))
    }
    return
  }

  if (!isLoggedIn && !isPublicRoute) {
    const baseRoute =
      shopRoutes.find((route) => nextUrl.pathname.startsWith(route)) || "/"

    return Response.redirect(
      new URL(`/login?redirectTo=${encodeURIComponent(baseRoute)}`, nextUrl)
    )
  }

  return
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
