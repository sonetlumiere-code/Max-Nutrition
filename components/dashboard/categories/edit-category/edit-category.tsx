"use client"

import { Category } from "@prisma/client"
import { toast } from "@/components/ui/use-toast"
import { categorySchema } from "@/lib/validations/category-validation"
import { PopulatedProduct } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { editCategory } from "@/actions/categories/edit-category"

type CategorySchema = z.infer<typeof categorySchema>

type EditCategoryProps = {
  category: Category
  products: PopulatedProduct[] | null
}

const EditCategory = ({ category, products }: EditCategoryProps) => {
  const router = useRouter()

  console.log(category)
  console.log(products)

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: category,
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
