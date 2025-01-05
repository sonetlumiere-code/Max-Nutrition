/* eslint-disable @next/next/no-img-element */
import DeleteCustomer from "@/components/dashboard/customers/delete-customer/delete-customer"
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import UserAvatar from "@/components/user-avatar"
import { getCustomers } from "@/data/customer"
import { auth } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CustomersPage() {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return redirect("/")
  }

  const customers = await getCustomers({
    include: {
      user: {
        select: { email: true, image: true, name: true, createdAt: true },
      },
      address: true,
    },
  })

  const customersLength = customers?.length || 0

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

      <Card>
        <CardHeader>
          <div className='space-between flex items-center'>
            <div className='max-w-screen-sm'>
              <CardTitle className='text-xl'>Clientes</CardTitle>
              <CardDescription>
                Administra tus clientes y visualiza su información.
              </CardDescription>
            </div>
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='hidden w-[100px] sm:table-cell'>
                  <span className='sr-only'>Imagen</span>
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className='hidden sm:table-cell'>Email</TableHead>
                <TableHead className='hidden md:table-cell'>Teléfono</TableHead>
                <TableHead className='hidden md:table-cell'>
                  Creado el
                </TableHead>
                <TableHead className='text-end'>
                  <span>Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers?.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className='hidden sm:table-cell'>
                    {customer.user ? (
                      <UserAvatar user={customer.user} />
                    ) : (
                      <Icons.circleUser className='h-11 w-11 text-muted-foreground' />
                    )}
                  </TableCell>
                  <TableCell className='font-medium'>{customer.name}</TableCell>
                  <TableCell className='hidden sm:table-cell'>
                    {customer.user ? (
                      <Button
                        variant='link'
                        size='default'
                        className='group px-0'
                      >
                        {customer.user?.email}
                        <Icons.clipboard className='h-4 w-4 ml-1 invisible group-hover:visible' />
                      </Button>
                    ) : null}
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    {customer.phone ? (
                      <Button variant='outline' size='default'>
                        {customer.phone}
                        <Icons.messageSquareMore className='h-4 w-4 ml-1' />
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    {format(customer.createdAt, "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className='text-end'>
                    <DropdownMenu>
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
                        <Link href={`customers/${customer.id}`}>
                          <DropdownMenuItem>
                            <Icons.eye className='h-4 w-4 mr-2' /> Ver
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`customers/edit-customer/${customer.id}`}>
                          <DropdownMenuItem>
                            <Icons.pencil className='h-4 w-4 mr-2' /> Editar
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem>
                          <DeleteCustomer customer={customer} />
                        </DropdownMenuItem>
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
            Mostrando <strong>{customersLength}</strong> client
            {customersLength > 1 ? "es" : "e"}
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
