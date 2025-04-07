import { Button } from "@/components/ui/button"
import { PopulatedCustomer, PopulatedShop } from "@/types/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import CustomerAddressesList from "./customer-addresses-list"
import Link from "next/link"

type CustomerAddressesProps = {
  customer: PopulatedCustomer
  shop: PopulatedShop
}

const CustomerAddresses = ({ customer, shop }: CustomerAddressesProps) => {
  const customerAddressesLength = customer.addresses?.length || 0

  return (
    <>
      {customer.addresses && customerAddressesLength > 0 ? (
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
                <Button asChild>
                  <Link
                    href={`/${shop.key}/customer-info/create-address?redirectTo=/${shop.key}/customer-info`}
                  >
                    Agregar dirección
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CustomerAddressesList
              customerAddresses={customer.addresses}
              shop={shop}
            />
          </CardContent>
          <CardFooter>
            <div className='text-xs text-muted-foreground'>
              Mostrando <strong>{customerAddressesLength}</strong> direcci
              {customerAddressesLength > 1 ? "o" : "ó"}n
              {customerAddressesLength > 1 ? "es" : ""}
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-64 p-6'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight'>
              Todavía no tenés ninguna dirección
            </h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Cargá tu primera dirección haciendo click en el siguiente botón
            </p>

            <Button asChild>
              <Link
                href={`/${shop.key}/customer-info/create-address?redirectTo=/${shop.key}/customer-info`}
              >
                Agregar dirección
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default CustomerAddresses
