/* eslint-disable @next/next/no-img-element */
import { Icons } from "@/components/icons"
import { Button, buttonVariants } from "@/components/ui/button"
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
import { getProducts } from "@/data/products"
import { cn } from "@/lib/utils"
import DeleteProduct from "@/components/dashboard/products/delete-product/delete-product"
import { Badge } from "@/components/ui/badge"
import ShowProductBadge from "@/components/dashboard/products/list/show-product-badge"

export default async function ProductsPage() {
  const products = await getProducts({
    include: {
      categories: true,
    },
  })

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/products'>Productos</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>
          Productos / Viandas
        </h1>
      </div>

      {products && products.length > 0 ? (
        <Card>
          <CardHeader>
            <div className='space-between flex items-center'>
              <div className='max-w-screen-sm'>
                <CardTitle className='text-xl'>Productos</CardTitle>
                <CardDescription className='hidden md:block'>
                  Gestiona y actualiza el inventario de viandas.
                </CardDescription>
              </div>
              <div className='ml-auto'>
                <Link
                  href='products/create-product'
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
                  <TableHead className='hidden md:table-cell'>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    Categorías
                  </TableHead>
                  <TableHead className='hidden md:table-cell'>
                    Mostrar
                  </TableHead>
                  <TableHead className='text-end'>
                    <span>Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className='hidden md:table-cell'>
                      <img
                        src={
                          product.image
                            ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${product.image}`
                            : "/img/no-image.jpg"
                        }
                        alt='Product image'
                        className='w-8 h-8 rounded-md ml-4'
                      />
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className='space-x-1 hidden md:table-cell'>
                      {product.categories?.map((category) => (
                        <Badge key={category.id}>{category.name}</Badge>
                      ))}
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>
                      <ShowProductBadge product={product} />
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
                          <Link href={`products/edit-product/${product.id}`}>
                            <DropdownMenuItem>
                              <Icons.pencil className='w-4 h-4 mr-2' />
                              Editar
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <DeleteProduct product={product} />
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
              <strong>{products.length}</strong> productos
            </div>
          </CardFooter>
        </Card>
      ) : (
        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
          <div className='flex flex-col items-center gap-1 text-center'>
            <h3 className='text-2xl font-bold tracking-tight'>
              Todavía no tenés ningún producto
            </h3>
            <p className='text-sm text-muted-foreground'>
              Cargá tu primer producto haciendo click en el siguiente botón
            </p>

            <Button className='mt-4' asChild>
              <Link href='/products/create-product'>
                <Icons.circlePlus className='mr-2 h-4 w-4' />
                Agregar producto
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
