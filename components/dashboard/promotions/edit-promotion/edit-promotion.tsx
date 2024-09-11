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
import { Category, PromotionDiscountType } from "@prisma/client"
import { editPromotion } from "@/actions/promotions/edit-promotion"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

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
      isActive: promotion.isActive,
      discountType: promotion.discountType,
      discount: promotion.discount,
      categories: promotion.categories,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
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
                control={form.control}
                name='isActive'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel>Promoción activa</FormLabel>
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

              <fieldset className='border p-5 rounded-md'>
                <legend>
                  <Label className='mx-2'>Descuento</Label>
                </legend>
                <div className='grid grid-cols-2 gap-3'>
                  <FormField
                    control={form.control}
                    name='discountType'
                    render={({ field }) => (
                      <FormItem className='space-y-3'>
                        <FormLabel>Tipo de descuento</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isSubmitting}
                            className='flex flex-col space-y-1'
                          >
                            <FormItem className='flex items-center space-x-3 space-y-0'>
                              <FormControl>
                                <RadioGroupItem
                                  value={PromotionDiscountType.Fixed}
                                />
                              </FormControl>
                              <FormLabel className='font-normal'>
                                Descuento fijo
                              </FormLabel>
                            </FormItem>
                            <FormItem className='flex items-center space-x-3 space-y-0'>
                              <FormControl>
                                <RadioGroupItem
                                  value={PromotionDiscountType.Percentage}
                                />
                              </FormControl>
                              <FormLabel className='font-normal'>
                                Descuento porcentual
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
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
                        <FormLabel>
                          Descuento{" "}
                          {watch("discountType") === PromotionDiscountType.Fixed
                            ? "fijo"
                            : "porcentual"}
                        </FormLabel>
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
                </div>
              </fieldset>

              <fieldset className='border p-5 rounded-md'>
                <legend>
                  <Label className='mx-2'>Categorías</Label>
                </legend>
                <div className='space-y-3'>
                  {fields.map((field, index) => (
                    <div key={field.id} className='flex justify-between gap-2'>
                      <div className=' w-1/2'>
                        <FormField
                          control={control}
                          name={`categories.${index}.categoryId`}
                          render={({ field }) => (
                            <FormItem className='flex flex-col'>
                              <FormLabel className='text-xs'>
                                Categoría
                              </FormLabel>
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
                      </div>

                      <div className='w-1/2 flex justify-between'>
                        <FormField
                          control={control}
                          name={`categories.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className='flex flex-col'>
                              <FormLabel className='text-xs'>
                                Cantidad
                              </FormLabel>
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
