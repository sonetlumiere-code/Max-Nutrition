import { OperationalHours } from "@prisma/client"
import { isShopCurrentlyAvailable } from "@/helpers/helpers"

/**
 * Si la tienda está tomando pedidos del público, y si no, por qué no.
 *
 * Son dos cosas distintas que la vitrina tiene que saber diferenciar: que el
 * negocio todavía no abrió la venta online no es lo mismo que estar fuera del
 * horario de atención, y decirle al cliente "podés pedir de 9 a 18" cuando no
 * se va a poder pedir en toda la semana es mentirle.
 */
export type ShopOrderingState =
  | { puedePedir: true }
  /** El negocio apagó la venta online: se muestra el catálogo y nada más. */
  | { puedePedir: false; motivo: "no-toma-pedidos" }
  /** Toma pedidos, pero ahora está cerrado. */
  | { puedePedir: false; motivo: "fuera-de-horario" }

export const getShopOrderingState = (shop: {
  acceptsOrders: boolean
  operationalHours?: OperationalHours[]
}): ShopOrderingState => {
  // El interruptor del negocio manda sobre el horario: si no toma pedidos, da
  // igual que estemos dentro del horario de atención.
  if (!shop.acceptsOrders) {
    return { puedePedir: false, motivo: "no-toma-pedidos" }
  }

  if (!isShopCurrentlyAvailable(shop.operationalHours)) {
    return { puedePedir: false, motivo: "fuera-de-horario" }
  }

  return { puedePedir: true }
}

/** Lo que se le muestra al cliente cuando no puede pedir. */
export const MENSAJE_SIN_PEDIDOS =
  "Todavía no estamos tomando pedidos online. Podés mirar el menú y consultarnos por cualquier plato."
