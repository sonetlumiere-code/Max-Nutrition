import { Button, buttonVariants } from "@/components/ui/button"
import { getIngredients } from "@/data/ingredients"
import Link from "next/link"
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
import { Icons } from "@/components/icons"
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
import { cn } from "@/lib/utils"
import DeleteIngredient from "@/components/dashboard/ingredients/delete-ingredient/delete-ingredient"

export default async function IngredientsPage() {
  const ingredients = await getIngredients()

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/ingredients'>Ingredientes</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Ingredientes</h1>
      </div>

      {ingredients && ingredients.length > 0 ? (
        <Card>
          <CardHeader>
            <div className='space-between flex items-center'>
              <div className='max-w-screen-sm'>
                <CardTitle className='text-xl'>Ingredientes</CardTitle>
                <CardDescription className='hidden md:block'>
                  Gestiona y actualiza el inventario de los ingredientes.
                </CardDescription>
              </div>
              <div className='ml-auto'>
                <Link
                  href='ingredients/create-ingredient'
                  className={cn(buttonVariants({ variant: "default" }))}
                >
                  <>
                    <Icons.circlePlus className='mr-2 h-4 w-4' />
                    Agregar Ingrediente
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
                  <TableHead>Precio</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    Desperdicio
                  </TableHead>
                  <TableHead>
                    <span>Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ingredient) => (
                  <TableRow key={ingredient.id}>
                    <TableCell>{ingredient.name}</TableCell>
                    <TableCell>$ {ingredient.price}</TableCell>
                    <TableCell>{ingredient.waste} %</TableCell>
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
                            href={`ingredients/edit-ingredient/${ingredient.id}`}
                          >
                            <DropdownMenuItem>
                              <Icons.pencil className='w-4 h-4 mr-2' />
                              Editar
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <DeleteIngredient ingredient={ingredient} />
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
              <strong>{ingredients.length}</strong> productos
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
              Todavía no tenes ningun ingrediente
            </h3>
            <p className='text-sm text-muted-foreground'>
              Cargá tu primer ingrediente haciendo click en el siguiente boton
            </p>

            <Button className='mt-4' asChild>
              <Link href='/ingredients/create-ingredient'>
                Crear ingrediente
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
