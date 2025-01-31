import { Icon } from "@/components/icons"
import { PermissionKey } from "@/types/types"

export const navItems: {
  href: string
  label: string
  icon: Icon
  permissionKey: PermissionKey
}[] = [
  // {
  //   href: "/shop-branches",
  //   label: "Sucursales",
  //   icon: "store",
  //   permissionKey: "view:shopBranches",
  // },
  {
    href: "/orders",
    label: "Pedidos",
    icon: "shoppingCart",
    permissionKey: "view:orders",
  },
  {
    href: "/products",
    label: "Productos",
    icon: "pizza",
    permissionKey: "view:products",
  },
  {
    href: "/categories",
    label: "Categorías",
    icon: "box",
    permissionKey: "view:categories",
  },
  {
    href: "/recipes",
    label: "Recetas",
    icon: "notebookText",
    permissionKey: "view:recipes",
  },
  {
    href: "/ingredients",
    label: "Ingredientes",
    icon: "wheat",
    permissionKey: "view:ingredients",
  },
  {
    href: "/promotions",
    label: "Promociones",
    icon: "badgePercent",
    permissionKey: "view:promotions",
  },
  {
    href: "/shippings",
    label: "Envíos",
    icon: "truck",
    permissionKey: "view:shippingZones",
  },
  {
    href: "/customers",
    label: "Clientes",
    icon: "users",
    permissionKey: "view:customers",
  },
  // {
  //   href: "/users",
  //   label: "Usuarios",
  //   icon: "user",
  //   permissionKey: "view:users",
  // },
  // {
  //   href: "/roles",
  //   label: "Roles",
  //   icon: "shield",
  //   permissionKey: "view:roles",
  // },
  // {
  //   href: "/permissions",
  //   label: "Permisos",
  //   icon: "lock",
  //   permissionKey: "view:permissions",
  // },
  // {
  //   href: "/settings",
  //   label: "Configuración",
  //   icon: "cog",
  //   permissionKey: "view:shopSettings",
  // },
] as const
