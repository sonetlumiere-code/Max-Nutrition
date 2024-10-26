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

  const cartItem = cart.items.filter((item) => item.product.id === product.id)

  const quantity = cartItem.reduce((acc, curr) => acc + curr.quantity, 0)

  return quantity > 0 ? (
    <Badge
      variant='destructive'
      className={cn("absolute end-0 m-1 z-20", className)}
    >
      {quantity}
    </Badge>
  ) : null
}

export default CartBadge
