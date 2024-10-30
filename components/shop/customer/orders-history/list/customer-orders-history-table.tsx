"use client"

import { useState } from "react"
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
import CustomerOrdersHistoryActions from "./customer-orders-history-actions"
import {
  translateOrderStatus,
  translateShippingMethod,
} from "@/helpers/helpers"
import CustomerViewOrder from "../view/customer-orders-history-item"

type CustomerOrdersHistoryTableProps = {
  orders: PopulatedOrder[]
}

const CustomerOrdersHistoryTable = ({
  orders,
}: CustomerOrdersHistoryTableProps) => {
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<PopulatedOrder | null>(
    null
  )

  const handleViewOrder = (order: PopulatedOrder) => {
    setSelectedOrder(order)
    setOpenViewDialog(true)
  }

  return (
    <>
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
              <TableCell className='text-xs md:text-sm'>
                {order.createdAt.toLocaleDateString()}
              </TableCell>
              <TableCell className='hidden sm:table-cell'>
                <Badge className='text-xs' variant='secondary'>
                  {translateShippingMethod(order.shippingMethod)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={cn("", {
                    "bg-amber-500 hover:bg-amber-500/80":
                      order.status === "Pending",
                    "bg-sky-500 hover:bg-sky-500/80":
                      order.status === "Accepted",
                    "bg-emerald-500 hover:bg-emerald-500/80":
                      order.status === "Completed",
                    "bg-destructive hover:bg-destructive/80":
                      order.status === "Cancelled",
                  })}
                >
                  {translateOrderStatus(order.status)}
                </Badge>
              </TableCell>
              <TableCell className='hidden sm:table-cell'>
                ${order.total}
              </TableCell>
              <TableCell className='text-right'>
                <CustomerOrdersHistoryActions
                  order={order}
                  onViewOrder={handleViewOrder}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedOrder && (
        <CustomerViewOrder
          order={selectedOrder}
          open={openViewDialog}
          setOpen={setOpenViewDialog}
        />
      )}
    </>
  )
}

export default CustomerOrdersHistoryTable
