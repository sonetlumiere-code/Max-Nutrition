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

const DEFAULT_REDIRECT: string = ShopRoutes.FOODS

export {
  ShopRoutes,
  shopRoutes,
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_REDIRECT,
}
