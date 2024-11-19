import { Button } from "@/components/ui/button"
import { PopulatedCustomer } from "@/types/types"
import CustomerCreateAddress from "../create/customer-create-address"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Icons } from "@/components/icons"
import CustomerAddressesList from "./customer-addresses-list"

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
                <CardTitle className='text-xl'>Mis direcciones</CardTitle>
                <CardDescription className='hidden md:block'>
                  Listado de mis direcciones
                </CardDescription>
              </div>
              <div className='ml-auto'>
                <CustomerCreateAddress customer={customer}>
                  <Button type='button'>
                    <Icons.plus className='w-4 h-4 mr-1' />
                    Agregar
                  </Button>
                </CustomerCreateAddress>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CustomerAddressesList addresses={customer.address} />
          </CardContent>
          <CardFooter>
            <div className='text-xs text-muted-foreground'>
              Mostrando <strong>{customer.address.length}</strong> direcciones
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-64 p-6'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight'>
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
