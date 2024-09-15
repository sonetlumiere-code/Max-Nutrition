import { Icon } from "@/components/icons"

export const navItems: {
  href: string
  label: string
  icon: Icon
}[] = [
  { href: "/welcome", label: "Inicio", icon: "home" },
  { href: "/orders", label: "Pedidos", icon: "shoppingCart" },
  { href: "/products", label: "Productos", icon: "pizza" },
  { href: "/categories", label: "Categorías", icon: "box" },
  { href: "/recipes", label: "Recetas", icon: "notebookText" },
  { href: "/ingredients", label: "Ingredientes", icon: "wheat" },
  { href: "/customers", label: "Clientes", icon: "users" },
  { href: "/promotions", label: "Promociones", icon: "badgePercent" },
  { href: "/shippings", label: "Envíos", icon: "truck" },
  { href: "/analytics", label: "Analytics", icon: "lineChart" },
] as const
