import { IngredientTotal, PopulatedOrder } from "@/types/types"
import { Ingredient } from "@prisma/client"
import { Dispatch, SetStateAction } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { unitToSpanish } from "@/helpers/helpers"

type OrdersBulkExportProps = {
  orders: PopulatedOrder[]
  setOpen: Dispatch<SetStateAction<boolean>>
}

const OrdersBulkExport = ({ orders, setOpen }: OrdersBulkExportProps) => {
  const ingredientTotals: Record<string, IngredientTotal> = {}

  orders.forEach((order) => {
    order.items?.forEach((item: any) => {
      const product = item.product
      const recipe = product.recipe

      recipe?.ingredients?.forEach((ingredientEntry: any) => {
        const ingredient: Ingredient = ingredientEntry.ingredient
        const totalQuantity = ingredientEntry.quantity * item.quantity

        if (ingredientTotals[ingredient.id]) {
          ingredientTotals[ingredient.id].total += totalQuantity
        } else {
          ingredientTotals[ingredient.id] = {
            ingredientId: ingredient.id,
            name: ingredient.name,
            measurement: ingredient.measurement,
            total: totalQuantity,
          }
        }
      })
    })
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Total</TableHead>
          <TableHead className='text-end'>Unidad de medida</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.values(ingredientTotals).map((ingredient) => (
          <TableRow key={ingredient.ingredientId}>
            <TableCell>{ingredient.name}</TableCell>
            <TableCell>{ingredient.total}</TableCell>
            <TableCell className='text-end'>
              {unitToSpanish(ingredient.measurement)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default OrdersBulkExport
