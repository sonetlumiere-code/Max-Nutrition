/* eslint-disable @next/next/no-img-element */
import { useCart } from "@/components/cart-provider"
import { QuantityInput } from "@/components/shared/quantity-input"
import { Badge } from "@/components/ui/badge"
import { TableCell, TableRow } from "@/components/ui/table"
import { LineItem } from "@/types/types"

const CartListItem = ({ cartItem }: { cartItem: LineItem }) => {
  const { decrementQuantity, incrementQuantity, removeItem, shop } = useCart()

  const { shopCategory } = shop

  return (
    <TableRow>
      <TableCell className='font-medium text-left space-x-2 flex w-11/12'>
        <img
          src={
            cartItem.product.image
              ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${cartItem.product.image}`
              : "/img/no-image.jpg"
          }
          className='h-10 w-10 rounded-md'
          alt={cartItem.product.name}
        />
        <div className='space-y-2'>
          <h3>{cartItem.product.name}</h3>
          <div className='flex gap-2'>
            {shopCategory === "FOOD" && (
              <Badge variant='secondary'>
                {cartItem.variation.withSalt ? "Con sal" : "Sin sal"}
              </Badge>
            )}
            <p className='text-muted-foreground'>${cartItem.product.price}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className='font-medium space-x-2 justify-end w-1/12'>
        <QuantityInput
          value={cartItem.quantity}
          onIncrement={() => incrementQuantity(cartItem.id)}
          onDecrement={() => {
            if (cartItem.quantity > 1) {
              decrementQuantity(cartItem.id)
            } else {
              removeItem(cartItem.id)
            }
          }}
          minQuantity={0}
        />
      </TableCell>
    </TableRow>
  )
}

export default CartListItem
