"use client"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useFieldArray, useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PopulatedPromotion } from "@/types/types"
import { promotionSchema } from "@/lib/validations/promotion-validation"
import { Category } from "@prisma/client"
import { editPromotion } from "@/actions/promotions/edit-promotion"

type PromotionSchema = z.infer<typeof promotionSchema>

type EditPromotionProps = {
  promotion: PopulatedPromotion
  categories: Category[] | null
}

const EditPromotion = ({ promotion, categories }: EditPromotionProps) => {
  const router = useRouter()

  const form = useForm<PromotionSchema>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: promotion.name,
      description: promotion.description || "",
      discount: promotion.discount,
      categories: promotion.categories,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories",
  })

  const onSubmit = async (data: PromotionSchema) => {
    const res = await editPromotion({ id: promotion.id, values: data })

    if (res.success) {
      router.push("/promotions")
      toast({
        title: "Promoción actualizada",
        description: "La promoción se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando promoción.",
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
                        placeholder='Editar promoción'
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
                        placeholder='Descripción de la promoción'
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
                name='discount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descuento (%)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        placeholder='Descuento en porcentaje'
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <fieldset className='border p-5 rounded-md'>
                <legend>
                  <Label className='mx-2'>Categorías</Label>
                </legend>
                <div className='space-y-3'>
                  {fields.map((field, index) => (
                    <div key={field.id} className='flex justify-between gap-2'>
                      <FormField
                        control={control}
                        name={`categories.${index}.categoryId`}
                        render={({ field }) => (
                          <FormItem className='flex flex-col w-2/5'>
                            <FormLabel className='text-xs'>Categoría</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Selecciona una categoría' />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories?.map(({ id, name }) => (
                                    <SelectItem key={id} value={id}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`categories.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className='flex flex-col w-2/5'>
                            <FormLabel className='text-xs'>Cantidad</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                placeholder='Cantidad'
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className='flex items-end justify-between'>
                        <Button
                          type='button'
                          size='icon'
                          variant='ghost'
                          onClick={() => remove(index)}
                          disabled={isSubmitting || fields.length === 1}
                        >
                          <Icons.x className='w-3 h-3' />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={() => append({ categoryId: "", quantity: 0 })}
                    disabled={isSubmitting}
                  >
                    <Icons.plus className='w-4 h-4 mr-1' />
                    <small>Agregar categoría</small>
                  </Button>
                </div>
              </fieldset>
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Editar Promoción
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default EditPromotion
