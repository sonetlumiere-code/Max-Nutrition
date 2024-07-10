"use client"

import { Ingredient, Recipe, RecipeIngredient } from "@prisma/client"
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
import { recipeSchema } from "@/lib/validations/recipes-validation"
import { editRecipe } from "@/actions/recipes/edit-recipe"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEffect, useState } from "react"
import { getIngredients } from "@/data/ingredients"

type RecipeSchema = z.infer<typeof recipeSchema>

type EditRecipeProps = {
  recipe: Recipe & { ingredients: RecipeIngredient[] }
}

const EditRecipe = ({ recipe }: EditRecipeProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[] | null>(null)

  const router = useRouter()

  const form = useForm<RecipeSchema>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: recipe.name,
      description: recipe.description || "",
      ingredients: recipe.ingredients,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  })

  useEffect(() => {
    const getData = async () => {
      const ingredients = await getIngredients()
      setIngredients(ingredients)
    }

    getData()
  }, [])

  const onSubmit = async (data: RecipeSchema) => {
    const res = await editRecipe({ id: recipe.id, values: data })

    if (res.success) {
      router.push("/recipes")
      toast({
        title: "Receta actualizada",
        description: "La receta se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando receta.",
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
                        placeholder='Editar receta'
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
                        placeholder='Descripción de la receta'
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {ingredients && (
                <fieldset className='border p-5 rounded-md'>
                  <legend>
                    <Label className='mx-2'>Ingredientes</Label>
                  </legend>
                  <div className='space-y-3'>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className='flex justify-between gap-2'
                      >
                        <FormField
                          control={control}
                          name={`ingredients.${index}.ingredientId`}
                          render={({ field }) => (
                            <FormItem className='flex flex-col w-2/5'>
                              <FormLabel className='text-xs'>
                                Ingrediente
                              </FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Selecciona un ingrediente' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ingredients?.map(({ id, name }) => (
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
                          name={`ingredients.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className='flex flex-col w-2/5'>
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
                  </div>
                </fieldset>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Editar Receta
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default EditRecipe
