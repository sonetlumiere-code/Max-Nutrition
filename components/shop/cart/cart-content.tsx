import { CartItem } from "@/components/cart-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart } from "lucide-react"
import CartCostPreview from "./cart-cost-preview"
import CartList from "./cart-list"

type CartContentProps = {
  items: CartItem[]
}

const CartContent = ({ items }: CartContentProps) => {
  return (
    <>
      {items.length > 0 ? (
        <div className='flex flex-col gap-3 justify-between'>
          <ScrollArea className='h-[42vh]'>
            <CartList items={items} />
          </ScrollArea>

          <CartCostPreview />
        </div>
      ) : (
        <div className='flex items-center justify-center h-44'>
          <ShoppingCart className='w-16 h-16 text-muted-foreground' />
        </div>
      )}
    </>
  )
}

export default CartContent
