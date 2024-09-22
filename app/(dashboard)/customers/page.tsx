import {
  CircleUser,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash,
  MessageSquareMore,
  Clipboard,
} from "lucide-react"
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

export default async function CustomersPage() {
  const customers = await getCustomers()
  console.log(customers)
  return (
    <>
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
                <TableHead>Dirección</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className='hidden md:table-cell'>Teléfono</TableHead>
                <TableHead className='hidden md:table-cell'>
                  Creado el
                </TableHead>
                <TableHead>
                  <span>Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers?.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className='hidden sm:table-cell'>
                    {customer.user.image ? (
                      <img
                        src={customer.user.image}
                        className='h-8 w-8 text-muted-foreground rounded-full'
                      />
                    ) : (
                      <CircleUser className='h-8 w-8 text-muted-foreground' />
                    )}
                  </TableCell>
                  <TableCell className='font-medium'>
                    {customer.user.name}
                  </TableCell>
                  <TableCell>DIRECCION</TableCell>
                  <TableCell>
                    <Button
                      variant='link'
                      size='default'
                      className='ml-2 group'
                    >
                      {customer.user.email}
                      <Clipboard className='h-4 w-4 ml-2 invisible group-hover:visible' />
                    </Button>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    {/* {customer.user.phone} */}
                    <Button variant='outline' size='default' className='ml-2'>
                      +541137553624
                      <MessageSquareMore className='h-4 w-4' />
                    </Button>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    {new Date(customer.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup='true'
                          size='icon'
                          variant='ghost'
                        >
                          <MoreHorizontal className='h-4 w-4' />
                          <span className='sr-only'>Mostrar menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className='h-4 w-4 mr-2' /> Ver datos
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className='h-4 w-4 mr-2' /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Trash className='h-4 w-4 mr-2' /> Eliminar
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
            Mostrando <strong>1-{customers?.length}</strong> de{" "}
            <strong>{customers?.length}</strong> clientes
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
