"use client"

import { Ingredient, Measurement } from "@prisma/client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { ingredientSchema } from "@/lib/validations/ingredient-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { editIngredient } from "@/actions/ingredients/edit-ingredient"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { translateUnit } from "@/helpers/helpers"

type IngredientSchema = z.infer<typeof ingredientSchema>

type EditIngredientProps = {
  ingredient: Ingredient
}

const EditIngredient = ({ ingredient }: EditIngredientProps) => {
  const router = useRouter()

  const form = useForm<IngredientSchema>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: ingredient,
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: IngredientSchema) => {
    const res = await editIngredient({ id: ingredient.id, values: data })

    if (res.success) {
      router.push("/ingredients")
      toast({
        title: "Ingrediente actualizado",
        description: "El ingrediente se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando ingrediente.",
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
                        placeholder='Nombre del ingrediente'
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
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='Precio del ingrediente'
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
                name={"measurement"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de medida</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Measurement).map((measurement) => (
                          <SelectItem
                            key={measurement}
                            value={measurement}
                            className='capitalize'
                          >
                            {translateUnit(measurement)}
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
                name='waste'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desperdicio (%)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        placeholder='Desperdicio en porcentaje'
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
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Editar Ingrediente
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default EditIngredient
