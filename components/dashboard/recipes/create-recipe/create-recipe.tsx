"use client"

import { createRecipe } from "@/actions/recipes/create-recipe"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { recipeSchema } from "@/lib/validations/recipe-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Ingredient } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

type RecipeSchema = z.infer<typeof recipeSchema>

const CreateRecipe = ({
  ingredients,
}: {
  ingredients: Ingredient[] | null
}) => {
  const router = useRouter()

  const form = useForm<RecipeSchema>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      description: "",
      ingredients: [{ ingredientId: "", quantity: 0 }],
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  })

  const onSubmit = async (data: RecipeSchema) => {
    const res = await createRecipe(data)

    if (res.success) {
      router.push("/recipes")
      toast({
        title: "Nueva receta creada",
        description: "La receta ha sido creada correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error creando receta",
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
                        placeholder='Nombre de la receta'
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
                        placeholder='Describa la receta'
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
                  <Label className='mx-2'>Ingredientes</Label>
                </legend>
                <div className='space-y-3'>
                  {fields.map((field, index) => (
                    <div key={field.id} className='flex justify-between gap-2'>
                      <FormField
                        control={control}
                        name={`ingredients.${index}.ingredientId`}
                        render={({ field }) => (
                          <FormItem className='w-2/5'>
                            <FormLabel className='text-xs'>
                              Ingrediente
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Selecciona un ingrediente' />
                                </SelectTrigger>
                                <SelectContent>
                                  {ingredients?.map(({ id, name }) => (
                                    <SelectItem
                                      key={id}
                                      value={id}
                                      disabled={watch("ingredients").some(
                                        (i) => i.ingredientId === id
                                      )}
                                    >
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage className='text-xs' />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`ingredients.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className='w-2/5'>
                            <FormLabel className='text-xs'>Cantidad</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                step={0.1}
                                placeholder='Cantidad'
                                disabled={isSubmitting}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='text-xs' />
                          </FormItem>
                        )}
                      />

                      <div className='flex justify-between mt-8'>
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
                    onClick={() => append({ ingredientId: "", quantity: 0 })}
                    disabled={isSubmitting}
                  >
                    <Icons.plus className='w-4 h-4 mr-1' />
                    <small>Agregar Ingrediente</small>
                  </Button>

                  {errors.ingredients?.root?.message && (
                    <div className='text-destructive text-sm'>
                      {errors.ingredients.root.message}
                    </div>
                  )}
                </div>
              </fieldset>
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Agregar Receta
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default CreateRecipe
