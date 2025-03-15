enum ShopRoutes {
  FOODS = "/foods",
  BAKERY = "/bakery",
}

const shopRoutes: string[] = Object.values(ShopRoutes)

const publicRoutes: string[] = [
  "/",
  "/new-verification",
  "/home",
  ...shopRoutes,
]

const authRoutes: string[] = [
  "/login",
  "/signup",
  "/reset-password",
  "/new-password",
]

const apiAuthPrefix: string = "/api/auth"

const DEFAULT_REDIRECT_SHOP: string = ShopRoutes.FOODS
const DEFAULT_REDIRECT_DASHBOARD: string = "/welcome"

export {
  ShopRoutes,
  shopRoutes,
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_REDIRECT_SHOP,
  DEFAULT_REDIRECT_DASHBOARD,
}
