import { getShops } from "@/data/shops"
import { getPermissionsKeys, hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Icons } from "@/components/icons"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

export default async function ShopsPage() {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:shops")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const shops = await getShops()

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tiendas</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Tiendas</h1>
      </div>

      {shops && shops.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Tiendas</CardTitle>
            <CardDescription>
              Administra tus tiendas y visualiza su información.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  {/* <TableHead className='hidden md:table-cell'>Título</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    Descripción
                  </TableHead> */}
                  <TableHead className='hidden md:table-cell'>URL</TableHead>
                  <TableHead className='hidden md:table-cell'>Activa</TableHead>
                  <TableHead className='text-end'>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops?.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell>{shop.name}</TableCell>
                    {/* <TableCell className='max-w-40 hidden md:table-cell'>
                      {shop.title}
                    </TableCell>
                    <TableCell className='max-w-32 hidden md:table-cell'>
                      {shop.description}
                    </TableCell> */}
                    <TableCell className='max-w-28 hidden md:table-cell'>
                      <Button variant='link' className='px-0' asChild>
                        <Link
                          href={`${process.env.BASE_URL}/${shop.key}`}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {`${process.env.BASE_URL}/${shop.key}`}
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell className='max-w-28 hidden md:table-cell'>
                      {shop.isActive ? (
                        <Badge className='bg-emerald-500 hover:bg-emerald-500/80 cursor-pointer'>
                          Si
                        </Badge>
                      ) : (
                        <Badge variant='destructive' className='cursor-pointer'>
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-end'>
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
                          {userPermissionsKeys.includes("update:shops") && (
                            <Link href={`shops/edit-shop/${shop.id}`}>
                              <DropdownMenuItem>
                                <Icons.pencil className='w-4 h-4 mr-2' />
                                Editar
                              </DropdownMenuItem>
                            </Link>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight'>
              Todavía no tenés ninguna tienda
            </h3>
            {/* {userPermissionsKeys.includes("create:shops") && (
              <>
                <p className='text-sm text-muted-foreground'>
                  Cargá tu primera tienda haciendo click en el siguiente botón
                </p>

                <Button className='mt-4' asChild>
                  <Link href='/shops/create-shop'>
                    <Icons.circlePlus className='mr-2 h-4 w-4' />
                    Agregar tienda
                  </Link>
                </Button>
              </>
            )} */}
          </div>
        </div>
      )}
    </>
  )
}
