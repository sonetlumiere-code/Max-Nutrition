"use client"

import { createCategory } from "@/actions/categories/create-category"
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
import { MultiSelect } from "@/components/multi-select"

type CategorySchema = z.infer<typeof categorySchema>

type CreateCategoryProps = {
  products: PopulatedProduct[] | null
}

const CreateCategory = ({ products }: CreateCategoryProps) => {
  const router = useRouter()

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      productsIds: [],
      promotionsIds: [],
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: CategorySchema) => {
    const res = await createCategory(data)

    if (res.success) {
      router.push("/categories")
      toast({
        title: "Nueva categoría creada",
        description: "La categoría ha sido creada correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error creando categoría",
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
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Agregar categoría
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default CreateCategory
