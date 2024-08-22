import { CircleUser, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

export default function CustomersPage() {
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
                <TableHead>Ciudad</TableHead>
                <TableHead className='hidden md:table-cell'>
                  Código Postal
                </TableHead>
                <TableHead className='hidden md:table-cell'>
                  Creado el
                </TableHead>
                <TableHead>
                  <span>Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className='hidden sm:table-cell'>
                  <CircleUser className='h-8 w-8 text-muted-foreground' />
                </TableCell>
                <TableCell className='font-medium'>Juan Pérez</TableCell>
                <TableCell>Calle Falsa 123</TableCell>
                <TableCell>Ciudad de México</TableCell>
                <TableCell className='hidden md:table-cell'>01234</TableCell>
                <TableCell className='hidden md:table-cell'>
                  2023-07-12 10:42 AM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup='true' size='icon' variant='ghost'>
                        <MoreHorizontal className='h-4 w-4' />
                        <span className='sr-only'>Mostrar menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='hidden sm:table-cell'>
                  <CircleUser className='h-8 w-8 text-muted-foreground' />
                </TableCell>
                <TableCell className='font-medium'>Ana López</TableCell>
                <TableCell>Avenida Siempre Viva 742</TableCell>
                <TableCell>Guadalajara</TableCell>
                <TableCell className='hidden md:table-cell'>56789</TableCell>
                <TableCell className='hidden md:table-cell'>
                  2023-10-18 03:21 PM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup='true' size='icon' variant='ghost'>
                        <MoreHorizontal className='h-4 w-4' />
                        <span className='sr-only'>Mostrar menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='hidden sm:table-cell'>
                  <CircleUser className='h-8 w-8 text-muted-foreground' />
                </TableCell>
                <TableCell className='font-medium'>Carlos Sánchez</TableCell>
                <TableCell>Calle Principal 45</TableCell>
                <TableCell>Monterrey</TableCell>
                <TableCell className='hidden md:table-cell'>34567</TableCell>
                <TableCell className='hidden md:table-cell'>
                  2023-11-29 08:15 AM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup='true' size='icon' variant='ghost'>
                        <MoreHorizontal className='h-4 w-4' />
                        <span className='sr-only'>Mostrar menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='hidden sm:table-cell'>
                  <CircleUser className='h-8 w-8 text-muted-foreground' />
                </TableCell>
                <TableCell className='font-medium'>Lucía Gómez</TableCell>
                <TableCell>Avenida Las Flores 678</TableCell>
                <TableCell>Tijuana</TableCell>
                <TableCell className='hidden md:table-cell'>89012</TableCell>
                <TableCell className='hidden md:table-cell'>
                  2023-12-25 11:59 PM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup='true' size='icon' variant='ghost'>
                        <MoreHorizontal className='h-4 w-4' />
                        <span className='sr-only'>Mostrar menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='hidden sm:table-cell'>
                  <CircleUser className='h-8 w-8 text-muted-foreground' />
                </TableCell>
                <TableCell className='font-medium'>Diego Rodríguez</TableCell>
                <TableCell>Calle Secundaria 987</TableCell>
                <TableCell>Querétaro</TableCell>
                <TableCell className='hidden md:table-cell'>23456</TableCell>
                <TableCell className='hidden md:table-cell'>
                  2024-01-01 12:00 AM
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup='true' size='icon' variant='ghost'>
                        <MoreHorizontal className='h-4 w-4' />
                        <span className='sr-only'>Mostrar menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className='text-xs text-muted-foreground'>
            Mostrando <strong>1-5</strong> de <strong>32</strong> clientes
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
