import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CartListItem from "./cart-list-item"
import { CartItem } from "@/components/cart-provider"

type CartListProps = {
  items: CartItem[]
}

const CartList = ({ items }: CartListProps) => {
  return (
    <Table className='border'>
      <TableHeader>
        <TableRow>
          <TableHead className='text-left'>Producto</TableHead>
          <TableHead className='text-right'>Cantidad</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <CartListItem key={item.id} cartItem={item} />
        ))}
      </TableBody>
    </Table>
  )
}

export default CartList
