"use client"

import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import React from "react"

const CartNavButton = () => {
  const { items, setOpen } = useCart()

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => setOpen(true)}
      className='relative'
    >
      <ShoppingCart className='w-6 h-6 text-muted-foreground' />
      <div className='absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium'>
        {items.reduce((acc, curr) => acc + curr.quantity, 0)}
      </div>
    </Button>
  )
}

export default CartNavButton
