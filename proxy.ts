import authConfig from "@/lib/auth/auth.config"
import { resolveRouteAccess } from "@/lib/auth/route-access"
import { DEFAULT_REDIRECT_SHOP } from "@/routes"
import NextAuth from "next-auth"

const { auth } = NextAuth(authConfig)

/**
 * Se llamaba `middleware` hasta Next 16. Además del nombre cambia dónde corre:
 * el proxy usa el runtime de Node y no se puede configurar, así que ya no hay
 * que cuidar que lo que se importe acá sea compatible con el runtime edge.
 *
 * Qué pasa sin sesión y qué no vive en `resolveRouteAccess`, que está testeado
 * aparte; acá queda solamente la redirección.
 */
export const proxy = auth((req) => {
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
