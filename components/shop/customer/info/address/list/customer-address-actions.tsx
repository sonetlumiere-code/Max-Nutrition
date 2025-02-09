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
import { CustomerAddress } from "@prisma/client"
import { useState } from "react"
import CustomerEditAddress from "../edit/customer-edit-address"
import DeleteCustomerAddress from "../delete/delete-customer-address"

type CustomerAddressActionsProps = {
  address: CustomerAddress
  customerAddresses: CustomerAddress[]
}

const CustomerAddressActions = ({
  address,
  customerAddresses,
}: CustomerAddressActionsProps) => {
  const [openEditDialog, setOpenEditDialog] = useState(false)

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
          <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
            <Icons.pencil className='w-4 h-4 mr-2' />
            <p>Editar</p>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DeleteCustomerAddress address={address} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomerEditAddress
        address={address}
        customerAddresses={customerAddresses}
        open={openEditDialog}
        setOpen={setOpenEditDialog}
      />
    </>
  )
}

export default CustomerAddressActions
