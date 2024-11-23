/* eslint-disable @next/next/no-img-element */
import { CartItem, useCart } from "@/components/cart-provider"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"

const CartListItem = ({ cartItem }: { cartItem: CartItem }) => {
  const { decrementQuantity, incrementQuantity, removeItem } = useCart()

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
            <Badge variant='secondary'>
              {cartItem.variation.withSalt ? "Con sal" : "Sin sal"}
            </Badge>
            <p className='text-muted-foreground'>${cartItem.product.price}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className='font-medium space-x-2 justify-end w-1/12'>
        <div className='flex items-center border-2 rounded-md justify-between max-w-24'>
          <Button
            variant='link'
            size='icon'
            className='rounded-full p-1 hover:bg-muted transition-colors'
            onClick={
              cartItem.quantity === 1
                ? () => removeItem(cartItem.id)
                : () => decrementQuantity(cartItem.id)
            }
          >
            {cartItem.quantity === 1 ? (
              <Icons.trash2 className='w-4 h-4 text-destructive' />
            ) : (
              <Icons.minus className='w-4 h-4' />
            )}
          </Button>
          <div className='text-sm font-bold min-w-4 text-center'>
            {cartItem.quantity}
          </div>
          <Button
            variant='link'
            size='icon'
            className='rounded-full p-1 hover:bg-muted transition-colors'
            onClick={() => incrementQuantity(cartItem.id)}
          >
            <Icons.plus className='w-4 h-4' />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default CartListItem
