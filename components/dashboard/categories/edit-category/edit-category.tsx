"use client"

import { editCategory } from "@/actions/categories/edit-category"
import { Icons } from "@/components/icons"
import { MultiSelect } from "@/components/multi-select"
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
import { toast } from "@/components/ui/use-toast"
import {
  CategorySchema,
  categorySchema,
} from "@/lib/validations/category-validation"
import { PopulatedCategory, PopulatedProduct } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ShopCategory } from "@prisma/client"
import { translateShopCategory } from "@/helpers/helpers"

type EditCategoryProps = {
  category: PopulatedCategory
  products: PopulatedProduct[] | null
}

const EditCategory = ({ category, products }: EditCategoryProps) => {
  const router = useRouter()

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      ...category,
      productsIds: category.products?.map((product) => product.id) || [],
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = form

  const onSubmit = async (data: CategorySchema) => {
    const res = await editCategory({ id: category.id, values: data })

    if (res.success) {
      router.push("/categories")
      toast({
        title: "Categoría actualizada",
        description: "La categoría se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando categoría.",
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
                        placeholder='Nombre de la categoría'
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
                name={"shopCategory"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tienda</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ShopCategory).map((group) => (
                          <SelectItem key={group} value={group}>
                            {translateShopCategory(group)}
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
                name='productsIds'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Productos</FormLabel>
                    <MultiSelect
                      options={
                        products?.map((product) => ({
                          value: product.id,
                          label: product.name,
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
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting || !isValid}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Editar Categoría
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default EditCategory
