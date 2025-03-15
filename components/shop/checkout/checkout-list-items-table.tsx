"use client"

/* eslint-disable @next/next/no-img-element */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/cart-provider"

const CheckoutListItems = () => {
  const { items, shop } = useCart()
  const { shopCategory } = shop

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vianda</TableHead>
          <TableHead className='whitespace-nowrap'>
            {/* Con/Sin sal */}
          </TableHead>
          <TableHead className='hidden md:table-cell'>Precio</TableHead>
          <TableHead className='text-end'>Cantidad</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items?.map((item) => (
          <TableRow key={item.id}>
            <TableCell className='font-medium flex gap-3'>
              <img
                src={
                  item.product.image
                    ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${item.product.image}`
                    : "/img/no-image.jpg"
                }
                className='h-10 w-10 rounded-md'
                alt={item.product.name}
              />
              <p className='text-sm'>{item.product.name}</p>
            </TableCell>
            <TableCell className='whitespace-nowrap'>
              {shopCategory === "FOOD" && (
                <>
                  {item.variation.withSalt ? (
                    <Badge variant='secondary'>Con sal</Badge>
                  ) : (
                    <Badge variant='secondary'>Sin sal</Badge>
                  )}
                </>
              )}
            </TableCell>
            <TableCell className='hidden md:table-cell'>
              ${item.product?.price}
            </TableCell>
            <TableCell className='text-end'>x {item.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default CheckoutListItems
