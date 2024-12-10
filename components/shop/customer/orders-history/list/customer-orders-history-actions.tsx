"use client"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PopulatedOrder } from "@/types/types"
import CancelCustomerOrder from "../cancel/cancel-customer-order"
import { OrderStatus } from "@prisma/client"

type CustomerOrdersHistoryActionsProps = {
  order: PopulatedOrder
  onViewOrder: (order: PopulatedOrder) => void
}

const CustomerOrdersHistoryActions = ({
  order,
  onViewOrder,
}: CustomerOrdersHistoryActionsProps) => {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup='true' size='icon' variant='ghost'>
          <Icons.moreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Mostrar menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onViewOrder(order)}>
          <Icons.eye className='w-4 h-4 mr-2' />
          <p>Ver</p>
        </DropdownMenuItem>
        {order.status === OrderStatus.PENDING && (
          <DropdownMenuItem>
            <CancelCustomerOrder order={order} />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CustomerOrdersHistoryActions
