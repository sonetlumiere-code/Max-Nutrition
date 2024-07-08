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
import { toast } from "@/components/ui/use-toast"
import { recipeSchema } from "@/lib/validations/recipes-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

type RecipeSchema = z.infer<typeof recipeSchema>

const CreateRecipe = () => {
  const router = useRouter()

  const form = useForm<RecipeSchema>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: RecipeSchema) => {
    console.log(data)
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
                control={form.control}
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
                control={form.control}
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
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Agregar nueva Receta
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default CreateRecipe
