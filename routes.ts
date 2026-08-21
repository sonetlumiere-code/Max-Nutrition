enum ShopRoutes {
  FOODS = "/foods",
  BAKERY = "/bakery",
}

const shopRoutes: string[] = Object.values(ShopRoutes)

const publicRoutes: string[] = ["/", "/new-verification", ...shopRoutes]

const authRoutes: string[] = [
  "/login",
  "/signup",
  "/reset-password",
  "/new-password",
]

const apiAuthPrefix: string = "/api/auth"
// Lecturas de la vitrina, que se ven sin haber entrado. La comparación es por
// ruta exacta: una ruta dinámica no se cubre listando su prefijo.
const apiPublicRoutes: string[] = ["/api/promotions", "/api/categories"]

// Notificaciones de proveedores externos: llegan por POST y sin sesión. Cada
// una valida su propia firma, que es lo que las autentica.
const webhookPrefix: string = "/api/webhooks"

// Tareas programadas: tampoco tienen sesión. Se autentican con un secreto en
// el encabezado Authorization.
const cronPrefix: string = "/api/cron"

const DEFAULT_REDIRECT_SHOP: string = ShopRoutes.FOODS
const DEFAULT_REDIRECT_DASHBOARD: string = "/dashboard"

export {
  ShopRoutes,
  shopRoutes,
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  apiPublicRoutes,
  webhookPrefix,
  cronPrefix,
  DEFAULT_REDIRECT_SHOP,
  DEFAULT_REDIRECT_DASHBOARD,
}
