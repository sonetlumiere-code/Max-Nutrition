/* eslint-disable @next/next/no-img-element */
"use client"

import { createProduct } from "@/actions/products/create-product"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
        <Card className='max-w-screen-md'>
          <CardHeader></CardHeader>
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

              <FormField
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
              />

              <FormField
                control={form.control}
                name='imageFile'
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Imagen</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type='file'
                        onChange={(event) => onChange(event.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {imageFile?.length > 0 && (
                <img
                  src={URL.createObjectURL(imageFile[0])}
                  alt='Image to upload'
                  className='w-40 h-40 object-cover rounded-md'
                />
              )}

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

              <FormField
                control={form.control}
                name='recipeId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receta</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
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

              <FormField
                control={form.control}
                name='stock'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>Stock</FormLabel>
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
                      <FormLabel className='text-base'>Mostrar</FormLabel>
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
                      <FormLabel className='text-base'>Destacado</FormLabel>
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
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Agregar producto
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default CreateProduct
