import DeletePromotion from "@/components/dashboard/promotions/delete-promotion/delete-promotion"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
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
import { getPromotions } from "@/data/promotions"
import { getPermissionsKeys, hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { redirect } from "next/navigation"

const PromotionsPage = async () => {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:promotions")) {
    return redirect("/welcome")
  }

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const promotions = await getPromotions()
  const promotionsLength = promotions?.length || 0

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/promotions'>Promociones</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Promociones</h1>
      </div>

      {promotionsLength > 0 ? (
        <Card>
          <CardHeader>
            <div className='space-between flex items-center'>
              <div className='max-w-screen-sm'>
                <CardTitle className='text-xl'>Promociones</CardTitle>
                <CardDescription className='hidden md:block'>
                  Gestiona y actualiza el inventario de las promociones.
                </CardDescription>
              </div>
              {userPermissionsKeys.includes("create:promotions") && (
                <div className='ml-auto'>
                  <Link
                    href='promotions/create-promotion'
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
                  <TableHead>Nombre</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    Descripción
                  </TableHead>
                  <TableHead className='hidden md:table-cell'>Estado</TableHead>
                  <TableHead className='text-end'>
                    <span>Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions?.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>{promotion.name}</TableCell>
                    <TableCell className='max-w-28 hidden md:table-cell'>
                      <p className='truncate'>{promotion.description}</p>
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>
                      {promotion.isActive ? (
                        <Badge className='bg-emerald-500 hover:bg-emerald-500/80'>
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant='destructive'>Inactiva</Badge>
                      )}
                    </TableCell>
                    {(userPermissionsKeys.includes("update:promotions") ||
                      userPermissionsKeys.includes("delete:promotions")) && (
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
                              "update:promotions"
                            ) && (
                              <Link
                                href={`promotions/edit-promotion/${promotion.id}`}
                              >
                                <DropdownMenuItem>
                                  <Icons.pencil className='w-4 h-4 mr-2' />
                                  Editar
                                </DropdownMenuItem>
                              </Link>
                            )}
                            {userPermissionsKeys.includes(
                              "delete:promotions"
                            ) && (
                              <DropdownMenuItem>
                                <DeletePromotion promotion={promotion} />
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
          <CardFooter>
            <div className='text-xs text-muted-foreground'>
              Mostrando <strong>{promotionsLength}</strong> promoci
              {promotionsLength > 1 ? "o" : "ó"}n
              {promotionsLength > 1 ? "es" : ""}
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight'>
              Todavía no tenés ninguna promoción
            </h3>
            {userPermissionsKeys.includes("create:promotions") && (
              <>
                <p className='text-sm text-muted-foreground'>
                  Cargá tu primera promoción haciendo click en el siguiente
                  botón
                </p>

                <Button className='mt-4' asChild>
                  <Link href='/promotions/create-promotion'>
                    <Icons.circlePlus className='mr-2 h-4 w-4' />
                    Agregar promoción
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

export default PromotionsPage
