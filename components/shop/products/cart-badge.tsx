"use client"

import { useCart } from "@/components/cart-provider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Product } from "@prisma/client"

type CartBadgeProps = {
  product: Product
  className?: string
}

const CartBadge = ({ product, className }: CartBadgeProps) => {
  const cart = useCart()

  const cartItem = cart.items.find((item) => item.product.id === product.id)

  return cartItem ? (
    <Badge
      variant='destructive'
      className={cn("absolute end-0 m-1 z-20", className)}
    >
      {cartItem.quantity}
    </Badge>
  ) : null
}

export default CartBadge
