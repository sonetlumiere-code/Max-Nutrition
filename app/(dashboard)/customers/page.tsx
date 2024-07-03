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
            Administra tus productos y visualiza su rendimiento en ventas.
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
                <TableHead>Estado</TableHead>
                <TableHead className='hidden md:table-cell'>Precio</TableHead>
                <TableHead className='hidden md:table-cell'>
                  Ventas Totales
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
                <TableCell className='font-medium'>
                  Máquina de Limonada Láser
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>Borrador</Badge>
                </TableCell>
                <TableCell className='hidden md:table-cell'>$499.99</TableCell>
                <TableCell className='hidden md:table-cell'>25</TableCell>
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
                <TableCell className='font-medium'>
                  Auriculares Hypernova
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>Activo</Badge>
                </TableCell>
                <TableCell className='hidden md:table-cell'>$129.99</TableCell>
                <TableCell className='hidden md:table-cell'>100</TableCell>
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
                <TableCell className='font-medium'>
                  Lámpara de Escritorio AeroGlow
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>Activo</Badge>
                </TableCell>
                <TableCell className='hidden md:table-cell'>$39.99</TableCell>
                <TableCell className='hidden md:table-cell'>50</TableCell>
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
                <TableCell className='font-medium'>
                  Bebida Energética TechTonic
                </TableCell>
                <TableCell>
                  <Badge variant='secondary'>Borrador</Badge>
                </TableCell>
                <TableCell className='hidden md:table-cell'>$2.99</TableCell>
                <TableCell className='hidden md:table-cell'>0</TableCell>
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
                <TableCell className='font-medium'>
                  Controlador Pro Gamer Gear
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>Activo</Badge>
                </TableCell>
                <TableCell className='hidden md:table-cell'>$59.99</TableCell>
                <TableCell className='hidden md:table-cell'>75</TableCell>
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
              <TableRow>
                <TableCell className='hidden sm:table-cell'>
                  <CircleUser className='h-8 w-8 text-muted-foreground' />
                </TableCell>
                <TableCell className='font-medium'>
                  Visor de Realidad Virtual Luminous
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>Activo</Badge>
                </TableCell>
                <TableCell className='hidden md:table-cell'>$199.99</TableCell>
                <TableCell className='hidden md:table-cell'>30</TableCell>
                <TableCell className='hidden md:table-cell'>
                  2024-02-14 02:14 PM
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
            Mostrando <strong>1-10</strong> de <strong>32</strong> productos
          </div>
        </CardFooter>
      </Card>
    </>
  )
}
