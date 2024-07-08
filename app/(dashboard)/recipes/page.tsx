import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { getRecipes } from "@/data/recipes"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default async function RecipesPage() {
  const recipes = await getRecipes()
  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/recipes'>Recetas</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Recetas</h1>
      </div>

      {recipes && recipes.length > 0 ? (
        <Card>
          <CardHeader>
            <div className='space-between flex items-center'>
              <div className='max-w-screen-sm'>
                <CardTitle className='text-xl'>Recetas</CardTitle>
                <CardDescription className='hidden md:block'>
                  Gestiona y actualiza el inventario de las recetas.
                </CardDescription>
              </div>
              <div className='ml-auto'>
                <Link
                  href='recipes/create-recipe'
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
                  <TableHead>Nombre</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    Descripción
                  </TableHead>
                  <TableHead>
                    <span>Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell>{recipe.name}</TableCell>
                    <TableCell className='max-w-28 hidden md:table-cell'>
                      <p className='truncate'>{recipe.description}</p>
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
                          <Link href={`recipes/edit-recipe/${recipe.id}`}>
                            <DropdownMenuItem>
                              <Icons.pencil className='w-4 h-4 mr-2' />
                              Editar
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            {/* <DeleteIngredient ingredient={ingredient} /> */}
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
              <strong>{recipes.length}</strong> recetas
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div
          className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'
          x-chunk='dashboard-02-chunk-1'
        >
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight'>
              Todavía no tenes ninguna receta
            </h3>
            <p className='text-sm text-muted-foreground'>
              Cargá tu primera receta haciendo click en el siguiente boton
            </p>

            <Button className='mt-4' asChild>
              <Link href='/recipes/create-recipe'>
                <Icons.circlePlus className='mr-2 h-4 w-4' />
                Agregar receta
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
