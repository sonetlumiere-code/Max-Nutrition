"use client"

import { toast } from "@/components/ui/use-toast"
import {
  CategorySchema,
  categorySchema,
} from "@/lib/validations/category-validation"
import { PopulatedProduct } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ShopCategory } from "@prisma/client"
import { translateShopCategory } from "@/helpers/helpers"

/**
 * El formulario de categoría, uno solo para crear y para editar.
 *
 * Los dos formularios eran el mismo archivo con cinco diferencias: a qué
 * acción le hablan, con qué valores arrancan y los textos. Tenerlo dos veces
 * significaba que cada campo nuevo había que agregarlo dos veces, y que
 * olvidarse de uno no rompía nada visible.
 */

export type ResultadoAccion = {
  success?: unknown
  error?: string
}

type CategoryFormProps = {
  products: PopulatedProduct[] | null
  defaultValues: CategorySchema
  /** Qué hacer con los datos: crear una categoría nueva o actualizar la que se está editando. */
  guardar: (data: CategorySchema) => Promise<ResultadoAccion>
  textoBoton: string
  avisoExito: { title: string; description: string }
  tituloError: string
  /**
   * Editar deshabilita el botón hasta que el formulario se da por válido;
   * crear no. Se mantiene la diferencia que ya existía en cada pantalla.
   */
  exigirValido?: boolean
}

const CategoryForm = ({
  products,
  defaultValues,
  guardar,
  textoBoton,
  avisoExito,
  tituloError,
  exigirValido = false,
}: CategoryFormProps) => {
  const router = useRouter()

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = form

  const onSubmit = async (data: CategorySchema) => {
    const res = await guardar(data)

    if (res.success) {
      router.push("/categories")
      toast(avisoExito)
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: tituloError,
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
                control={control}
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
            <Button
              type='submit'
              disabled={isSubmitting || (exigirValido && !isValid)}
            >
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              {textoBoton}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default CategoryForm
