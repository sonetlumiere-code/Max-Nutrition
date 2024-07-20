"use client"

import { useCart } from "@/components/cart-provider"
import { ShoppingCart } from "lucide-react"

const CartButton = () => {
  const { items } = useCart()

  return (
    <div className='relative'>
      <ShoppingCart className='w-6 h-6 text-muted-foreground' />
      <div className='absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium'>
        {items.length}
      </div>
    </div>
  )
}

export default CartButton
