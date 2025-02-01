import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getCustomer } from "@/data/customer"
import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"

interface ViewCustomerProps {
  params: { customerId: string }
}

const ViewCustomer = async ({ params }: ViewCustomerProps) => {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:customers")) {
    return redirect("/welcome")
  }

  const { customerId } = params

  const customer = await getCustomer({
    where: { id: customerId },
    include: {
      addresses: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  })

  if (!customer) {
    redirect("/customers")
  }

  const customerAddressesLength = customer?.addresses?.length || 0

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/customers'>Clientes</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{customer.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h2 className='font-semibold text-lg'>Detalle de cliente</h2>

      <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-4 lg:gap-8'>
        <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Información</CardTitle>
              <CardDescription className='hidden md:block'>
                Información personal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                <div className='grid gap-1'>
                  <p className='text-sm font-medium leading-none'>Nombre</p>
                  <p className='text-sm text-muted-foreground'>
                    {customer.name || customer.user?.name}
                  </p>
                </div>

                <div className='grid gap-1'>
                  <p className='text-sm font-medium leading-none'>Email</p>
                  <p className='text-sm text-muted-foreground'>
                    {customer.user?.email || "-"}
                  </p>
                </div>

                <div className='grid gap-1'>
                  <p className='text-sm font-medium leading-none'>Teléfono</p>
                  <p className='text-sm text-muted-foreground'>
                    {customer.phone || "-"}
                  </p>
                </div>

                <div className='grid gap-1'>
                  <p className='text-sm font-medium leading-none'>
                    Fecha de nacimiento
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {customer.birthdate
                      ? format(new Date(customer.birthdate), "dd/MM/yyyy")
                      : "-"}
                  </p>
                </div>

                <div className='grid gap-1'>
                  <p className='text-sm font-medium leading-none'>
                    Fecha de registro
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    {format(new Date(customer.createdAt), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
          {customerAddressesLength > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Direcciones</CardTitle>
                <CardDescription className='hidden md:block'>
                  Direcciones del cliente para envíos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {customer.addresses?.map((address, i) => (
                    <>
                      <address
                        key={address.id}
                        className='grid gap-0.5 not-italic text-sm text-muted-foreground'
                      >
                        <span>
                          {address?.addressStreet} {address?.addressNumber}{" "}
                          {address?.addressFloor || ""}{" "}
                          {address?.addressApartment}
                        </span>
                        <span>
                          {address?.province}, {address?.municipality},
                          {address?.locality}
                        </span>{" "}
                        <span>Código postal: {address?.postCode}</span>
                      </address>

                      {i < customerAddressesLength - 1 ? <Separator /> : null}
                    </>
                  ))}
                </div>
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
                  Sin direcciones para envíos
                </h3>
                <p className='text-sm text-muted-foreground'>
                  El cliente aún no registró ninguna dirección para recibir
                  envíos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ViewCustomer
