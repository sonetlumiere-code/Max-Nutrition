import { CartItem } from "@/components/cart-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CartListItem from "./cart-list-item"
import { ShoppingCart } from "lucide-react"

type CartContentProps = {
  items: CartItem[]
}

const CartContent = ({ items }: CartContentProps) => (
  <>
    {items.length > 0 ? (
      <ScrollArea className='lg:h-[30vh] h-[60vh]'>
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
      </ScrollArea>
    ) : (
      <div className='flex items-center justify-center h-44'>
        <ShoppingCart className='w-16 h-16 text-muted-foreground' />
      </div>
    )}
  </>
)

export default CartContent
