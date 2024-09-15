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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getShippingZones } from "@/data/shipping-zones"
import { getShippingSettings } from "@/data/shipping-settings"
import DeleteShippingZone from "@/components/dashboard/shipping-zones/delete-shipping-zone/delete-shipping-zone"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import EditShippingSettings from "@/components/dashboard/shipping-settings/edit-shipping-settings/edit-shipping-settings"
import { ShippingSettings } from "@prisma/client"

const Shippings = async () => {
  const [shippingZones, shippingSettings] = await Promise.all([
    getShippingZones(),
    getShippingSettings(),
  ])

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/shippings'>Envíos</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Envíos</h1>
      </div>

      <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
        <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
          {shippingZones && shippingZones.length > 0 ? (
            <Card>
              <CardHeader>
                <div className='space-between flex items-center'>
                  <div className='max-w-screen-sm'>
                    <CardTitle className='text-xl'>Zonas de envío</CardTitle>
                    <CardDescription className='hidden md:block'>
                      Gestiona y actualiza tus zonas de envío.
                    </CardDescription>
                  </div>
                  <div className='ml-auto'>
                    <Link
                      href='shipping-zones/create-shipping-zone'
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
                      <TableHead>Zona</TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Costo
                      </TableHead>
                      <TableHead>
                        <span>Acciones</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shippingZones.map((shippingZone) => (
                      <TableRow key={shippingZone.id}>
                        <TableCell>{shippingZone.zone}</TableCell>
                        <TableCell className='max-w-28 hidden md:table-cell'>
                          <p className='truncate'>{shippingZone.cost}</p>
                        </TableCell>
                        <TableCell>
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
                              <Link
                                href={`shipping-zones/edit-shipping-zone/${shippingZone.id}`}
                              >
                                <DropdownMenuItem>
                                  <Icons.pencil className='w-4 h-4 mr-2' />
                                  Editar
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <DeleteShippingZone
                                  shippingZone={shippingZone}
                                />
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
                  Mostrando <strong>1-10</strong> de{" "}
                  <strong>{shippingZones.length}</strong> zonas de envío
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-64 p-12'>
              <div className='flex flex-col items-center gap-1 text-center'>
                <h3 className='text-2xl font-bold tracking-tight'>
                  Todavía no tenés ninguna zona de envío
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Cargá tu primera zona de envío haciendo click en el siguiente
                  botón
                </p>

                <Button className='mt-4' asChild>
                  <Link href='/shipping-zones/create-shipping-zone'>
                    <Icons.circlePlus className='mr-2 h-4 w-4' />
                    Agregar Zona de envío
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
          <EditShippingSettings
            shippingSettings={shippingSettings as ShippingSettings}
          />
        </div>
      </div>
    </>
  )
}

export default Shippings
