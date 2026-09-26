import "server-only"

import prisma from "@/lib/db/db"
import { PopulatedShop } from "@/types/types"
import { Prisma } from "@prisma/client"

export const getShops = async (args?: Prisma.ShopFindManyArgs) => {
  try {
    const shops = await prisma.shop.findMany(args)

    return shops
  } catch (error) {
    console.error("Error fetching shops:", error)
    return null
  }
}

/**
 * Una clave de tienda nunca lleva punto: el proxy da por hecho que una ruta con
 * punto es un archivo y ni la pasa por la autenticación.
 *
 * Importa por lo que llega sin que nadie lo pida. `/robots.txt`,
 * `/wp-login.php` o `/.env` no existen como archivos, así que caen en
 * `[shopKey]`; sin este corte, cada visita de un bot despierta a Neon para
 * buscar una tienda que no puede existir.
 */
const canBeShopKey = (key: string) => !key.includes(".")

export const getShop = async (args: Prisma.ShopFindFirstArgs) => {
  const key = args.where?.key

  if (typeof key === "string" && !canBeShopKey(key)) {
    return null
  }

  try {
    const shop = await prisma.shop.findFirst(args)

    return shop as PopulatedShop
  } catch (error) {
    console.error("Error fetching shop:", error)
    return null
  }
}
