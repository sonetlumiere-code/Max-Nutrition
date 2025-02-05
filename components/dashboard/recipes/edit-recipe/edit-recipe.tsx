"use client"

import { editRecipe } from "@/actions/recipes/edit-recipe"
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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { getBaseMeasurement, translateUnit } from "@/helpers/helpers"
import { RecipeSchema, recipeSchema } from "@/lib/validations/recipe-validation"
import { PopulatedRecipe } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Ingredient } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"

type EditRecipeProps = {
  recipe: PopulatedRecipe
  ingredients: Ingredient[] | null
}

const EditRecipe = ({ recipe, ingredients }: EditRecipeProps) => {
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
    formState: { isSubmitting, errors },
    watch,
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  })

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
                      <Textarea
                        placeholder='Describa la receta'
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
                    {fields.map((field, index) => {
                      const selectedIngredient = ingredients?.find(
                        (ingredient) =>
                          ingredient.id ===
                          watch(`ingredients.${index}.ingredientId`)
                      )

                      return (
                        <div key={field.id} className='grid grid-cols-11 gap-3'>
                          <FormField
                            control={control}
                            name={`ingredients.${index}.ingredientId`}
                            render={({ field }) => (
                              <FormItem className='col-span-4'>
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
                              <FormItem className='col-span-4'>
                                <FormLabel className='text-xs'>
                                  Cantidad
                                </FormLabel>
                                <FormControl>
                                  <div className='flex items-center gap-1'>
                                    <Input
                                      type='number'
                                      min={0}
                                      step={0.01}
                                      placeholder='Cantidad'
                                      disabled={isSubmitting}
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage className='text-xs' />
                              </FormItem>
                            )}
                          />

                          <div className='flex justify-between mt-8 items-center col-span-2'>
                            <span className='text-xs text-gray-500 '>
                              {selectedIngredient
                                ? translateUnit(
                                    getBaseMeasurement(
                                      selectedIngredient?.measurement
                                    )
                                  )
                                : ""}
                            </span>
                          </div>

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
                      )
                    })}

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
