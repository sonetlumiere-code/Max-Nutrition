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
import { useState } from "react"
import CancelCustomerOrder from "../cancel/cancel-customer-order"
// import CustomerEditOrder from "../edit/customer-edit-order"
import CustomerViewOrder from "../view/customer-orders-history-item"
import { OrderStatus } from "@prisma/client"

type CustomerOrdersHistoryActionsProps = {
  order: PopulatedOrder
}

const CustomerOrdersHistoryActions = ({
  order,
}: CustomerOrdersHistoryActionsProps) => {
  const [openViewDialog, setOpenViewDialog] = useState(false)
  // const [openEditDialog, setOpenEditDialog] = useState(false)

  return (
    <>
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
          <DropdownMenuItem onClick={() => setOpenViewDialog(true)}>
            <Icons.eye className='w-4 h-4 mr-2' />
            <p>Ver</p>
          </DropdownMenuItem>
          {order.status === OrderStatus.Pending && (
            <>
              {/* <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
                <Icons.pencil className='w-4 h-4 mr-2' />
                <p>Editar</p>
              </DropdownMenuItem> */}
              <DropdownMenuItem>
                <CancelCustomerOrder order={order} />
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <CustomerEditOrder
        order={order}
        open={openEditDialog}
        setOpen={setOpenEditDialog}
      /> */}

      <CustomerViewOrder
        order={order}
        open={openViewDialog}
        setOpen={setOpenViewDialog}
      />
    </>
  )
}

export default CustomerOrdersHistoryActions
