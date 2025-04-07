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
import DeleteCustomerAddress from "../delete/delete-customer-address"
import Link from "next/link"
import { PopulatedShop } from "@/types/types"

type CustomerAddressActionsProps = {
  address: CustomerAddress
  shop: PopulatedShop
}

const CustomerAddressActions = ({
  address,
  shop,
}: CustomerAddressActionsProps) => {
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
          <DropdownMenuItem asChild>
            <Link
              href={`/${shop.key}/customer-info/edit-address/${address.id}?redirectTo=/${shop.key}/customer-info`}
            >
              <Icons.pencil className='w-4 h-4 mr-2' />
              Editar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DeleteCustomerAddress address={address} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export default CustomerAddressActions
