import { getShopBranches } from "@/data/shop-branches"
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
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
import DeleteShopBranch from "@/components/dashboard/shop-branches/delete-shop-branch/delete-shop-branch"
import { Badge } from "@/components/ui/badge"
import { auth } from "@/lib/auth/auth"
import { getPermissionsKeys, hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"

const ShopBranchesPage = async () => {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:shopBranches")) {
    return redirect("/welcome")
  }

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const shopBranches = await getShopBranches()
  const shopBranchesLength = shopBranches?.length || 0

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sucursales</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Sucursales</h1>
      </div>

      {shopBranchesLength > 0 ? (
        <Card>
          <CardHeader>
            <div className='space-between flex items-center'>
              <div className='max-w-screen-sm'>
                <CardTitle className='text-xl'>Sucursales</CardTitle>
                <CardDescription className='hidden md:block'>
                  Gestiona y actualiza tus sucursales.
                </CardDescription>
              </div>
              {userPermissionsKeys.includes("create:shopBranches") && (
                <div className='ml-auto'>
                  <Link
                    href='shop-branches/create-shop-branch'
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Etiqueta</TableHead>
                  <TableHead>Activa</TableHead>
                  <TableHead className='text-end'>
                    <span>Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shopBranches?.map((shopBranch) => (
                  <TableRow key={shopBranch.id}>
                    <TableCell>{shopBranch.label}</TableCell>
                    <TableCell>
                      <Badge>{shopBranch.isActive ? "Si" : "No"}</Badge>
                    </TableCell>
                    {(userPermissionsKeys.includes("update:shopBranches") ||
                      userPermissionsKeys.includes("delete:shopBranches")) && (
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
                            {userPermissionsKeys.includes(
                              "update:shopBranches"
                            ) && (
                              <Link
                                href={`shop-branches/edit-shop-branch/${shopBranch.id}`}
                              >
                                <DropdownMenuItem>
                                  <Icons.pencil className='w-4 h-4 mr-2' />
                                  Editar
                                </DropdownMenuItem>
                              </Link>
                            )}
                            {userPermissionsKeys.includes(
                              "delete:shopBranches"
                            ) && (
                              <DropdownMenuItem>
                                <DeleteShopBranch shopBranch={shopBranch} />
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
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
              Todavía no tenés ninguna sucursal
            </h3>
            {userPermissionsKeys.includes("create:shopBranches") && (
              <>
                <p className='text-sm text-muted-foreground'>
                  Cargá tu primera sucursal haciendo click en el siguiente botón
                </p>

                <Button className='mt-4' asChild>
                  <Link href='shop-branches/create-shop-branch'>
                    <Icons.circlePlus className='mr-2 h-4 w-4' />
                    Agregar sucursal
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

export default ShopBranchesPage
