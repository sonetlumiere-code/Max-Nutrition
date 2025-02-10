"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { PermissionKey, PopulatedOrder } from "@/types/types"
import { useState } from "react"
import ViewOrder from "@/components/dashboard/orders/list/actions/view-order/view-order"
import EditOrder from "@/components/dashboard/orders/list/actions/edit-order/edit-order"

type CustomerOrdersTableActionsProps = {
  order: PopulatedOrder
  userPermissionsKeys: PermissionKey[]
}

const CustomerOrdersTableActions = ({
  order,
  userPermissionsKeys,
}: CustomerOrdersTableActionsProps) => {
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size='icon' variant='ghost' className='h-8 w-8'>
            <Icons.moreVertical className='h-3.5 w-3.5' />
            <span className='sr-only'>More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {userPermissionsKeys.includes("view:orders") && (
            <DropdownMenuItem onClick={() => setOpenViewDialog(true)}>
              <Icons.eye className='w-4 h-4 mr-2' />
              Ver
            </DropdownMenuItem>
          )}
          {userPermissionsKeys.includes("update:orders") && (
            <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
              <Icons.pencil className='w-4 h-4 mr-2' />
              Editar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ViewOrder
        order={order}
        open={openViewDialog}
        setOpen={setOpenViewDialog}
      />

      <EditOrder
        order={order}
        open={openEditDialog}
        setOpen={setOpenEditDialog}
      />
    </>
  )
}

export default CustomerOrdersTableActions
