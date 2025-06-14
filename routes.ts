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
const apiPublicRoutes: string[] = ["/api/promotions", "/api/categories"]

const DEFAULT_REDIRECT_SHOP: string = ShopRoutes.FOODS
const DEFAULT_REDIRECT_DASHBOARD: string = "/dashboard"

export {
  ShopRoutes,
  shopRoutes,
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  apiPublicRoutes,
  DEFAULT_REDIRECT_SHOP,
  DEFAULT_REDIRECT_DASHBOARD,
}
