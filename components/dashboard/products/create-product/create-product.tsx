/* eslint-disable @next/next/no-img-element */
"use client"

import { createProduct } from "@/actions/products/create-product"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { productSchema } from "@/lib/validations/product-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import uploadImage from "@/actions/cloudinary/upload-image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PopulatedRecipe } from "@/types/types"
import { MultiSelect } from "@/components/multi-select"
import { Category } from "@prisma/client"

type ProductSchema = z.infer<typeof productSchema>

type CreateProductProps = {
  recipes: PopulatedRecipe[] | null
  categories: Category[] | null
}

const CreateProduct = ({ recipes, categories }: CreateProductProps) => {
  const router = useRouter()

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      promotionalPrice: 0,
      featured: false,
      stock: true,
      show: true,
      image: "",
      recipeId: "",
    },
  })

  const {
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const imageFile = watch("imageFile")

  const onSubmit = async (data: ProductSchema) => {
    if (data.imageFile?.length) {
      const formData = new FormData()
      formData.append("imageFile", data.imageFile[0])
      const uploadRes = await uploadImage(formData)
      data.image = uploadRes.public_id || ""
      data.imageFile = []
    }

    const res = await createProduct(data)

    if (res.success) {
      router.push("/products")
      toast({
        title: "Nuevo producto creado",
        description: "El producto ha sido creado correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error creando producto",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold text-lg'>Agregar Producto</h2>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            )}
            Agregar Producto
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
          <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Detalle</CardTitle>
                <CardDescription>Detalle del producto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <FormField
                    control={control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Nombre del producto'
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Describa el producto'
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Precio</CardTitle>
                <CardDescription>Precio del producto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <FormField
                    control={control}
                    name='price'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio (AR$)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            placeholder='Precio en pesos'
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    control={control}
                    name='promotionalPrice'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio promocional (AR$)</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='0.1'
                            placeholder='Precio promocional en pesos'
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Categorías</CardTitle>
                <CardDescription>Categorías del producto</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='categoriesIds'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Categorías</FormLabel>
                      <MultiSelect
                        options={
                          categories?.map((category) => ({
                            value: category.id,
                            label: category.name,
                          })) || []
                        }
                        selected={field.value || []}
                        onChange={field.onChange}
                        disabled={isSubmitting}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Receta</CardTitle>
                <CardDescription>Receta del producto</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='recipeId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Receta</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || ""}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecciona una receta' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {recipes?.map((recipe) => (
                            <SelectItem
                              key={recipe.id}
                              value={recipe.id}
                              disabled={!!recipe.product}
                            >
                              {!!recipe.product ? (
                                <div className='flex'>
                                  <p>{recipe.name}</p>
                                  {/* <Badge>{recipe.product?.name}</Badge> */}
                                </div>
                              ) : (
                                <p>{recipe.name}</p>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
            <Card className='overflow-hidden'>
              <CardHeader>
                <CardTitle className='text-xl'>Imagen</CardTitle>
                <CardDescription>Imagen del producto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-2'>
                  <img
                    alt='Product image'
                    className='aspect-square w-full rounded-md object-cover'
                    src={
                      imageFile?.length > 0
                        ? URL.createObjectURL(imageFile[0])
                        : "/img/no-image.jpg"
                    }
                  />
                  <div className='grid grid-cols-3 gap-2'>
                    <label className='flex aspect-square w-full items-center justify-center rounded-md border border-dashed cursor-pointer'>
                      <Icons.upload className='h-4 w-4 text-muted-foreground' />
                      <span className='sr-only'>Upload</span>
                      <input
                        type='file'
                        disabled={isSubmitting}
                        className='hidden'
                        onChange={(event) => {
                          form.setValue("imageFile", event.target.files)
                        }}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Disponibilidad</CardTitle>
                <CardDescription>
                  Configura la disponibilidad del producto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='stock'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel>Stock</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                            aria-readonly
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='show'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel>Mostrar</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                            aria-readonly
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='featured'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel>Destacado</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                            aria-readonly
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateProduct
