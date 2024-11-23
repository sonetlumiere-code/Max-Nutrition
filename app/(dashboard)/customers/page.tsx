/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
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
import { getCustomers } from "@/data/customer"
import { format } from "date-fns"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { Icons } from "@/components/icons"

export default async function CustomersPage() {
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
          <CardDescription>
            Administra tus clientes y visualiza su información.
          </CardDescription>
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
                    {customer.user?.image ? (
                      <img
                        src={customer.user.image}
                        alt='Customer Image'
                        className='h-8 w-8 text-muted-foreground rounded-full'
                      />
                    ) : (
                      <Icons.circleUser className='h-8 w-8 text-muted-foreground' />
                    )}
                  </TableCell>
                  <TableCell className='font-medium'>
                    {customer.user?.name}
                  </TableCell>
                  <TableCell className='hidden sm:table-cell'>
                    <Button
                      variant='link'
                      size='default'
                      className='group px-0'
                    >
                      {customer.user?.email}
                      <Icons.clipboard className='h-4 w-4 ml-1 invisible group-hover:visible' />
                    </Button>
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
                        {/* <DropdownMenuItem>
                          <Pencil className='h-4 w-4 mr-2' /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash className='h-4 w-4 mr-2' /> Eliminar
                        </DropdownMenuItem> */}
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
