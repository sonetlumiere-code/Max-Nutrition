"use client"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { createOrder } from "@/actions/orders/create-order"
import { useCart } from "@/components/cart-provider"
import { PopulatedCustomer } from "@/types/types"
import { Session } from "next-auth"
import { Role } from "@prisma/client"

interface UseCreateOrder {
  isLoading: boolean
  placeOrder: () => Promise<void>
}

export const useCreateOrder = (
  session: Session | null,
  customer: PopulatedCustomer | null,
  addressId: string
): UseCreateOrder => {
  const { items, setOpen, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const placeOrder = async () => {
    if (session?.user.role === Role.ADMIN) {
      setOpen(false)
      console.warn("Admin cannot place an order in shop")
      return
    }

    if (!customer) {
      console.warn("No customer to place order")
      return
    }

    setIsLoading(true)

    const res = await createOrder({
      customerId: customer.id,
      customerAddressId: addressId,
      paymentMethod: "Cash",
      shippingMethod: "Delivery",
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        variation: {
          withSalt: item.variation.withSalt,
        },
      })),
    })

    setIsLoading(false)

    if (res.success) {
      setOpen(false)
      clearCart()
      toast({
        title: "Pedido creado",
        description: "Tu pedido se ha creado correctamente.",
      })
    } else if (res.error) {
      toast({
        variant: "destructive",
        title: "Error creando pedido",
        description: res.error,
      })
    }
  }

  return {
    isLoading,
    placeOrder,
  }
}
