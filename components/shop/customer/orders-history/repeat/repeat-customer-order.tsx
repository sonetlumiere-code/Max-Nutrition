"use client"

import { useState } from "react"
import { getOrderItemsToRepeat } from "@/actions/orders/repeat-order"
import { useCart } from "@/components/cart-provider"
import { Icons } from "@/components/icons"
import { toast } from "@/components/ui/use-toast"
import { PopulatedOrder } from "@/types/types"

type RepeatCustomerOrderProps = {
  order: PopulatedOrder
}

const RepeatCustomerOrder = ({ order }: RepeatCustomerOrderProps) => {
  const { addItem, setOpen, shop } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const onRepeat = async () => {
    setIsLoading(true)
    const res = await getOrderItemsToRepeat({ orderId: order.id })
    setIsLoading(false)

    if (res.error || !res.success) {
      toast({
        variant: "destructive",
        title: "No se pudo repetir el pedido.",
        description: res.error,
      })
      return
    }

    const { items, unavailable, shopCategory } = res.success

    // El carrito es por tienda: repetir un pedido de la otra tienda mezclaría
    // productos que no corresponden.
    if (shopCategory && shopCategory !== shop.shopCategory) {
      toast({
        variant: "destructive",
        title: "Ese pedido es de otra tienda.",
        description: "Entrá a la tienda correspondiente para repetirlo.",
      })
      return
    }

    if (!items.length) {
      toast({
        variant: "destructive",
        title: "No quedan productos disponibles.",
        description:
          "Ninguno de los productos de ese pedido está disponible en este momento.",
      })
      return
    }

    items.forEach((item) => {
      addItem(item.product, item.quantity, { withSalt: item.withSalt })
    })

    const units = items.reduce((sum, item) => sum + item.quantity, 0)

    toast({
      title: `Se agregaron ${units} ${units === 1 ? "producto" : "productos"}.`,
      description: unavailable.length
        ? `No están disponibles: ${unavailable.join(", ")}.`
        : "Revisá el carrito para confirmar tu pedido.",
    })

    setOpen(true)
  }

  return (
    <span
      onClick={isLoading ? undefined : onRepeat}
      aria-disabled={isLoading}
      className='flex w-full items-center'
    >
      {isLoading ? (
        <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        <Icons.copy className='mr-2 h-4 w-4' />
      )}
      <p>Repetir pedido</p>
    </span>
  )
}

export default RepeatCustomerOrder
