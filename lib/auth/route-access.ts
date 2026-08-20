import {
  apiAuthPrefix,
  apiPublicRoutes,
  authRoutes,
  cronPrefix,
  publicRoutes,
  shopRoutes,
  webhookPrefix,
} from "@/routes"

/**
 * Qué trato le corresponde a una ruta antes de mirar si hay sesión.
 *
 * Vive separado del middleware para poder fijarlo por tests: de esta decisión
 * depende qué queda expuesto sin autenticar, y es el tipo de cosa que se
 * rompe sin que nadie lo note hasta que alguien la encuentra.
 */
export type RouteAccess =
  /** Pasa sin sesión: se autentica sola o es pública a propósito. */
  | { kind: "bypass"; reason: "auth-api" | "webhook" | "cron" | "public-api" }
  /** Pantallas de login y afines: si ya hay sesión, se sale de ahí. */
  | { kind: "auth" }
  /** Se ve con o sin sesión. */
  | { kind: "public" }
  /** Exige sesión; `baseRoute` es adónde volver después de entrar. */
  | { kind: "protected"; baseRoute: string }

/**
 * Un prefijo cubre la ruta exacta y lo que cuelga debajo, no cualquier ruta
 * que empiece con esas letras: sin el límite de segmento, una ruta futura
 * llamada `/api/webhooks-internos` quedaría sin autenticar por parecerse.
 */
const isUnder = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`)

export const resolveRouteAccess = (
  pathname: string,
  method: string
): RouteAccess => {
  if (isUnder(pathname, apiAuthPrefix)) {
    return { kind: "bypass", reason: "auth-api" }
  }

  // Las notificaciones de proveedores externos llegan por POST y sin sesión:
  // cada una valida su propia firma o su secreto, que es lo que las autentica.
  if (isUnder(pathname, webhookPrefix)) {
    return { kind: "bypass", reason: "webhook" }
  }

  if (isUnder(pathname, cronPrefix)) {
    return { kind: "bypass", reason: "cron" }
  }

  // Solo de lectura: la misma ruta por POST sigue exigiendo sesión.
  if (apiPublicRoutes.includes(pathname) && method === "GET") {
    return { kind: "bypass", reason: "public-api" }
  }

  if (authRoutes.includes(pathname)) {
    return { kind: "auth" }
  }

  if (publicRoutes.includes(pathname)) {
    return { kind: "public" }
  }

  return {
    kind: "protected",
    baseRoute: shopRoutes.find((route) => pathname.startsWith(route)) || "/",
  }
}
