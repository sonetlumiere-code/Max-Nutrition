"use client"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import EditOrder from "./edit-order/edit-order"
import { useState } from "react"
import { PermissionKey, PopulatedOrder } from "@/types/types"

type OrderItemActionsProps = {
  order: PopulatedOrder
  userPermissionsKeys: PermissionKey[]
}

const OrderItemActions = ({
  order,
  userPermissionsKeys,
}: OrderItemActionsProps) => {
  const [openEditDialog, setOpenEditDialog] = useState(false)
  // const [openExportDialog, setOpenExportDialog] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size='icon' variant='outline' className='h-8 w-8'>
            <Icons.moreVertical className='h-3.5 w-3.5' />
            <span className='sr-only'>More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {userPermissionsKeys.includes("update:orders") && (
            <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
              <Icons.pencil className='w-4 h-4 mr-2' />
              Editar
            </DropdownMenuItem>
          )}
          {/* <DropdownMenuItem onClick={() => setOpenExportDialog(true)}>
            <Icons.file className='w-4 h-4 mr-2' />
            Exportar
          </DropdownMenuItem>
          */}
          {/* {userPermissionsKeys.includes("delete:orders") && (
            <DropdownMenuItem>
              <Icons.trash2 className='w-4 h-4 mr-2' />
              Eliminar
            </DropdownMenuItem>
          )} */}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditOrder
        order={order}
        open={openEditDialog}
        setOpen={setOpenEditDialog}
      />

      {/* <ExportOrder
        order={order}
        open={openExportDialog}
        setOpen={setOpenExportDialog}
      /> */}
    </>
  )
}

export default OrderItemActions
