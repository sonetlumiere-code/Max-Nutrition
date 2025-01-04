/* eslint-disable @next/next/no-img-element */
"use client"

import deleteImage from "@/actions/cloudinary/delete-image"
import uploadImage from "@/actions/cloudinary/upload-image"
import { editProduct } from "@/actions/products/edit-product"
import { Icons } from "@/components/icons"
import { MultiSelect } from "@/components/multi-select"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { productSchema } from "@/lib/validations/product-validation"
import { PopulatedProduct, PopulatedRecipe } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Category } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

type ProductSchema = z.infer<typeof productSchema>

type EditProductProps = {
  product: PopulatedProduct
  recipes: PopulatedRecipe[] | null
  categories: Category[] | null
}

const EditProduct = ({ product, recipes, categories }: EditProductProps) => {
  const router = useRouter()

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ...product,
      categoriesIds: product.categories?.map((category) => category.id),
    },
  })

  const {
    control,
    watch,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = form

  const imageFile = watch("imageFile")

  const onSubmit = async (data: ProductSchema) => {
    if (data.imageFile?.length) {
      const formData = new FormData()
      formData.append("imageFile", data.imageFile[0])
      const uploadRes = await uploadImage(formData)
      data.image = uploadRes.public_id || ""
      data.imageFile = []

      if (product.image && uploadRes.public_id) {
        deleteImage(product.image.split("/")[1])
      }
    }

    const res = await editProduct({ id: product.id, values: data })

    if (res.success) {
      router.push("/products")
      toast({
        title: "Producto actualizado",
        description: "El producto se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando producto.",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold text-lg'>Editar Producto</h2>
          <Button type='submit' disabled={isSubmitting || !isValid}>
            {isSubmitting && (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            )}
            Editar Producto
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
                    <FormItem>
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
                              {recipe.product ? (
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
                    alt={
                      imageFile?.length > 0
                        ? "Image to upload"
                        : "Product image"
                    }
                    className='aspect-square w-full rounded-md object-cover'
                    src={
                      imageFile?.length > 0
                        ? URL.createObjectURL(imageFile[0])
                        : product.image
                        ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${product.image}`
                        : "/img/no-image.jpg"
                    }
                  />
                  <div className='grid grid-cols-3 gap-2'>
                    <label
                      className='flex aspect-square w-full cursor-pointer items-center justify-center rounded-md border border-dashed'
                      htmlFor='image-upload'
                    >
                      <Icons.upload className='h-4 w-4 text-muted-foreground' />
                      <span className='sr-only'>Upload an image</span>
                    </label>
                    <input
                      id='image-upload'
                      type='file'
                      disabled={isSubmitting}
                      className='hidden'
                      onChange={(event) =>
                        form.setValue("imageFile", event.target.files)
                      }
                    />
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

export default EditProduct
