import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CustomerAddressActions from "./customer-address-actions"
import { CustomerAddressLabel, CustomerAddress } from "@prisma/client"
import { Icons } from "@/components/icons"
import { PopulatedShop } from "@/types/types"

type CustomerAddressesListProps = {
  customerAddresses: CustomerAddress[]
  shop: PopulatedShop
}

const CustomerAddressesList = ({
  customerAddresses,
  shop,
}: CustomerAddressesListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Etiqueta</TableHead>
          <TableHead className='hidden md:table-cell'>Dirección</TableHead>
          <TableHead className='hidden md:table-cell'>
            Localidad/Barrio
          </TableHead>
          <TableHead className='hidden md:table-cell'>Código postal</TableHead>
          <TableHead className='text-end'>
            <span>Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customerAddresses.map((address) => (
          <TableRow key={address.id}>
            <TableCell>
              {getAddressLabelWithIcon(address.label, address.labelString)}
            </TableCell>
            <TableCell className='hidden md:table-cell'>
              {address.addressStreet} {address.addressNumber}{" "}
              {address.addressFloor || ""} {address.addressApartment}
            </TableCell>
            <TableCell className='hidden md:table-cell'>
              {address.province}, {address.municipality}, {address.locality}
            </TableCell>
            <TableCell className='hidden md:table-cell'>
              {address.postCode}
            </TableCell>
            <TableCell className='text-end'>
              <CustomerAddressActions address={address} shop={shop} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default CustomerAddressesList

const getAddressLabelWithIcon = (
  label: CustomerAddressLabel,
  labelString: string | null
) => {
  switch (label) {
    case "HOME":
      return (
        <div className='flex items-center'>
          <Icons.mapPin className='mr-2 h-4 w-4' /> Casa
        </div>
      )
    case "WORK":
      return (
        <div className='flex items-center'>
          <Icons.mapPin className='mr-2 h-4 w-4' /> Trabajo
        </div>
      )
    default:
      return (
        <div className='flex items-center'>
          <Icons.mapPin className='mr-2 h-4 w-4' /> {labelString || "Otro"}
        </div>
      )
  }
}
