import { z } from "zod"

export const recipeSchema = z
  .object({
    name: z.string().min(1, { message: "Ingresa el nombre de la receta." }),
    description: z.string().optional(),
    ingredients: z.array(
      z.object({
        ingredientId: z
          .string()
          .min(1, { message: "Selecciona el ingrediente." }),
        quantity: z.coerce
          .number()
          .min(0.1, { message: "Ingresa la cantidad." }),
      })
    ),
  })
  .superRefine((data, ctx) => {
    const ingredientIds = data.ingredients.map((i) => i.ingredientId)
    const uniqueIngredientIds = new Set(ingredientIds)

    if (ingredientIds.length !== uniqueIngredientIds.size) {
      ctx.addIssue({
        code: "custom",
        path: ["ingredients"],
        message: "No puedes agregar el mismo ingrediente más de una vez.",
      })
    }
  })

export type RecipeSchema = z.infer<typeof recipeSchema>
