import { IngredientVariantScope } from "@prisma/client"

/**
 * La vianda se pide con o sin sal. Esa elección vive en `OrderItem.withSalt` y
 * la receta declara, ingrediente por ingrediente, en qué variante entra cada
 * uno: la sal solo en la versión con sal, un reemplazo solo en la versión sin
 * sal, y todo lo demás en las dos.
 */
export const appliesToVariant = (
  scope: IngredientVariantScope | null | undefined,
  withSalt: boolean
) => {
  if (scope === IngredientVariantScope.ONLY_WITH_SALT) return withSalt
  if (scope === IngredientVariantScope.ONLY_WITHOUT_SALT) return !withSalt

  // ALWAYS, y también lo que venga sin definir: antes de que existiera esta
  // columna todos los ingredientes iban en las dos variantes.
  return true
}

/**
 * Los ingredientes de una receta que entran en la variante pedida.
 *
 * Genérico sobre la forma del ingrediente porque cada pantalla trae un `select`
 * distinto: a todas les alcanza con que la fila traiga su `variantScope`.
 */
export const ingredientsForVariant = <
  T extends { variantScope?: IngredientVariantScope | null }
>(
  recipeIngredients: T[] | null | undefined,
  withSalt: boolean
): T[] =>
  (recipeIngredients ?? []).filter((entry) =>
    appliesToVariant(entry.variantScope, withSalt)
  )

/**
 * Variante de referencia para las pantallas que muestran "el costo del
 * producto" sin hablar de un pedido concreto: márgenes de analytics, el costo
 * estimado en el form de producto y la lista de recetas.
 *
 * Se usa la versión con sal porque es la que lleva todos los ingredientes, así
 * que el número es el techo del costo y nunca subestima el margen.
 */
export const REFERENCE_VARIANT_WITH_SALT = true
