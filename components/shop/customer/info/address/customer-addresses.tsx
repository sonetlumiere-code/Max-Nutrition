import { Button } from "@/components/ui/button"
import { PopulatedCustomer } from "@/types/types"
import CustomerCreateAddress from "./create/customer-create-address"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"

type CustomerAddressesProps = {
  customer: PopulatedCustomer
}

const CustomerAddresses = ({ customer }: CustomerAddressesProps) => {
  return (
    <>
      {customer.address && customer.address?.length > 0 ? (
        <Card>
          <CardHeader>
            <div className='space-between flex items-center'>
              <div className='max-w-screen-sm'>
                <CardTitle className='text-base md:text-xl'>
                  Mis direcciones
                </CardTitle>
                <CardDescription className='hidden md:block'>
                  Agrega tus direcciones
                </CardDescription>
              </div>
              <div className='ml-auto'>
                <CustomerCreateAddress customer={customer}>
                  <Button type='button'>Agregar</Button>
                </CustomerCreateAddress>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dirección</TableHead>
                  <TableHead className='hidden md:table-cell'>Barrio</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    Código postal
                  </TableHead>
                  <TableHead className='text-end'>
                    <span>Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.address.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell>{address.address}</TableCell>
                    <TableCell className='hidden md:table-cell'>
                      {address.city}
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>
                      {address.postCode}
                    </TableCell>
                    <TableCell className='text-end'>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup='true'
                            size='icon'
                            variant='ghost'
                          >
                            <Icons.moreHorizontal className='h-4 w-4' />
                            <span className='sr-only'>Mostrar menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>edit</DropdownMenuItem>
                          <DropdownMenuItem>delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className='text-xs text-muted-foreground'>
              Mostrando <strong>1-10</strong> de{" "}
              <strong>{customer.address.length}</strong> direcciones
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-64 p-6'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-base md:text-2xl font-bold tracking-tight'>
              Todavía no tenés ninguna dirección
            </h3>
            <p className='text-sm text-muted-foreground'>
              Cargá tu primera dirección haciendo click en el siguiente botón
            </p>

            <CustomerCreateAddress customer={customer}>
              <Button type='button' className='mt-4'>
                Agregar dirección
              </Button>
            </CustomerCreateAddress>
          </div>
        </div>
      )}
    </>
  )
}

export default CustomerAddresses
