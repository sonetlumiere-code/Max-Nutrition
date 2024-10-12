import { PopulatedOrder } from "@/types/types"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import CustomerOrdersHistoryActions from "./list/customer-orders-history-actions"
import { getStatusBadgeClass, translateOrderStatus } from "@/helpers/helpers"

type CustomerOrdersHistoryListProps = {
  orders: PopulatedOrder[]
}

const CustomerOrdersHistoryList = ({
  orders,
}: CustomerOrdersHistoryListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead className='hidden sm:table-cell'>Entrega</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className='hidden sm:table-cell'>Total</TableHead>
          <TableHead className='text-right'>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders?.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
            <TableCell className='hidden sm:table-cell'>
              <Badge className='text-xs' variant='secondary'>
                {order.shippingMethod}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={cn("", getStatusBadgeClass(order.status))}>
                {translateOrderStatus(order.status)}
              </Badge>
            </TableCell>
            <TableCell className='hidden sm:table-cell'>
              ${order.total}
            </TableCell>
            <TableCell className='text-right'>
              <CustomerOrdersHistoryActions order={order} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default CustomerOrdersHistoryList
