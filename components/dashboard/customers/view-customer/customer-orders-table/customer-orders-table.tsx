import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import CustomerOrdersTableActions from "@/components/dashboard/customers/view-customer/customer-orders-table/customer-orders-table-actions"
import { PermissionKey, PopulatedCustomer } from "@/types/types"
import { format } from "date-fns"
import {
  translateOrderStatus,
  translateShippingMethod,
} from "@/helpers/helpers"

type CustomerOrdersTableProps = {
  customer: PopulatedCustomer
  userPermissionsKeys: PermissionKey[]
}

const CustomersOrdersTable = ({
  customer,
  userPermissionsKeys,
}: CustomerOrdersTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead className='hidden md:table-cell'>Entrega</TableHead>
          <TableHead className='hidden md:table-cell'>Estado</TableHead>
          <TableHead className='hidden md:table-cell'>Total</TableHead>
          <TableHead className='text-end'>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customer.orders?.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{format(order.createdAt, "dd/MM/yyyy")}</TableCell>
            <TableCell className='hidden md:table-cell'>
              <Badge className='text-xs' variant='secondary'>
                {translateShippingMethod(order.shippingMethod)}
              </Badge>
            </TableCell>
            <TableCell className='hidden md:table-cell'>
              <Badge
                className={cn("", {
                  "bg-amber-500 hover:bg-amber-500/80":
                    order.status === "PENDING",
                  "bg-sky-500 hover:bg-sky-500/80": order.status === "ACCEPTED",
                  "bg-emerald-500 hover:bg-emerald-500/80":
                    order.status === "COMPLETED",
                  "bg-destructive hover:bg-destructive/80":
                    order.status === "CANCELLED",
                })}
              >
                {translateOrderStatus(order.status)}
              </Badge>
            </TableCell>
            <TableCell className='hidden md:table-cell'>
              ${order.total}
            </TableCell>
            {(userPermissionsKeys.includes("view:orders") ||
              userPermissionsKeys.includes("update:orders") ||
              userPermissionsKeys.includes("delete:orders")) && (
              <TableCell className='text-end'>
                <CustomerOrdersTableActions
                  order={order}
                  userPermissionsKeys={userPermissionsKeys}
                />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default CustomersOrdersTable
