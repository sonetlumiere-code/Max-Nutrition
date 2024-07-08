"use client"

import { Recipe } from "@prisma/client"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { recipeSchema } from "@/lib/validations/recipes-validation"
import { editRecipe } from "@/actions/recipes/edit-recipe"

type RecipeSchema = z.infer<typeof recipeSchema>

type EditRecipeProps = {
  recipe: Recipe
}

const EditRecipe = ({ recipe }: EditRecipeProps) => {
  const router = useRouter()

  const form = useForm<RecipeSchema>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: recipe.name,
      description: recipe.description || "",
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

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
                control={form.control}
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
                control={form.control}
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
