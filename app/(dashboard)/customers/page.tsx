import CustomersDataTable from "@/components/dashboard/customers/list/customers-data-table/customers-data-table"
import { Icons } from "@/components/icons"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCustomers } from "@/data/customer"
import { getPermissionsKeys, hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"

export default async function CustomersPage() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:customers")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const customers = await getCustomers({
    include: {
      user: {
        select: { email: true, image: true, name: true, createdAt: true },
      },
      addresses: true,
    },
  })

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Clientes</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Clientes</h1>
      </div>

      {customers && customers.length > 0 ? (
        <Card>
          <CardHeader>
            <div className='space-between flex items-center'>
              <div className='max-w-screen-sm'>
                <CardTitle className='text-xl'>Clientes</CardTitle>
                <CardDescription>
                  Administra tus clientes y visualiza su información.
                </CardDescription>
              </div>
              {userPermissionsKeys.includes("create:customers") && (
                <div className='ml-auto'>
                  <Link
                    href='customers/create-customer'
                    className={cn(buttonVariants({ variant: "default" }))}
                  >
                    <>
                      <Icons.circlePlus className='mr-2 h-4 w-4' />
                      Agregar
                    </>
                  </Link>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <CustomersDataTable customers={customers} />
          </CardContent>
        </Card>
      ) : (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight'>
              Todavía no tenés ningún cliente
            </h3>
            {userPermissionsKeys.includes("create:customers") && (
              <>
                <p className='text-sm text-muted-foreground'>
                  Cargá tu primer cliente haciendo click en el siguiente botón
                </p>

                <Button className='mt-4' asChild>
                  <Link href='/customers/create-customer'>
                    <Icons.circlePlus className='mr-2 h-4 w-4' />
                    Agregar cliente
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
