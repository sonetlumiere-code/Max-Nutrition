import DeleteCategory from "@/components/dashboard/categories/delete-category/delete-category"
import { Icons } from "@/components/icons"
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
import { getCategories } from "@/data/categories"
import { getPermissionsKeys, hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CategoriesPage() {
  const session = await auth()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:categories")) {
    return redirect("/welcome")
  }

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const categories = await getCategories()
  const categoriesLength = categories?.length || 0

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/categories'>Categorías</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Categorías</h1>
      </div>

      {categoriesLength > 0 ? (
        <Card>
          <CardHeader>
            <div className='space-between flex items-center'>
              <div className='max-w-screen-sm'>
                <CardTitle className='text-xl'>Categorías</CardTitle>
                <CardDescription className='hidden md:block'>
                  Gestiona y actualiza las categorías.
                </CardDescription>
              </div>
              {userPermissionsKeys.includes("create:categories") && (
                <div className='ml-auto'>
                  <Link
                    href='categories/create-category'
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
                  <TableHead className='text-end'>
                    <span>Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    {(userPermissionsKeys.includes("update:categories") ||
                      userPermissionsKeys.includes("delete:categories")) && (
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
                              "update:categories"
                            ) && (
                              <Link
                                href={`categories/edit-category/${category.id}`}
                              >
                                <DropdownMenuItem>
                                  <Icons.pencil className='w-4 h-4 mr-2' />
                                  Editar
                                </DropdownMenuItem>
                              </Link>
                            )}
                            {userPermissionsKeys.includes(
                              "delete:categories"
                            ) && (
                              <DropdownMenuItem>
                                <DeleteCategory category={category} />
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
              Mostrando <strong>{categoriesLength}</strong> categoría
              {categoriesLength > 1 ? "s" : ""}
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight'>
              Todavía no tenés ninguna categoría
            </h3>
            {userPermissionsKeys.includes("create:categories") && (
              <>
                <p className='text-sm text-muted-foreground'>
                  Cargá tu primera categoría haciendo click en el siguiente
                  botón
                </p>

                <Button className='mt-4' asChild>
                  <Link href='/categories/create-category'>
                    <Icons.circlePlus className='mr-2 h-4 w-4' />
                    Agregar categoría
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
