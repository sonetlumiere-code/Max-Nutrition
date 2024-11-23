"use client"

import { useCart } from "@/components/cart-provider"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"

const CartIconButton = () => {
  const { items, setOpen } = useCart()

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => setOpen(true)}
      className='relative'
    >
      <Icons.shoppingCart className='w-6 h-6 text-muted-foreground' />
      <div className='absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs font-medium'>
        <small>{items.reduce((acc, curr) => acc + curr.quantity, 0)}</small>
      </div>
    </Button>
  )
}

export default CartIconButton
