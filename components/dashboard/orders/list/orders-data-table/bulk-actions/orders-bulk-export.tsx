import { IngredientTotal, PopulatedOrder } from "@/types/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { translateUnit } from "@/helpers/helpers"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icons } from "@/components/icons"

type OrdersBulkExportProps = {
  orders: PopulatedOrder[]
}

const OrdersBulkExport = ({ orders }: OrdersBulkExportProps) => {
  const ingredientTotals: Record<string, IngredientTotal> = {}

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const product = item.product
      const recipe = product.recipe

      recipe?.ingredients?.forEach((ingredientEntry) => {
        const ingredient = ingredientEntry.ingredient
        const baseQuantity = ingredientEntry.quantity * item.quantity
        const wasteMultiplier = 1 + ingredient.waste
        const totalQuantity = baseQuantity * wasteMultiplier
        const cost = totalQuantity * ingredient.price

        if (ingredient) {
          if (ingredientTotals[ingredient.id]) {
            ingredientTotals[ingredient.id].quantity += totalQuantity
          } else {
            ingredientTotals[ingredient.id] = {
              ingredientId: ingredient.id,
              name: ingredient.name,
              measurement: ingredient.measurement,
              quantity: totalQuantity,
              cost,
            }
          }
        }
      })
    })
  })

  return orders.length > 0 ? (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Unidad de medida</TableHead>
          <TableHead className='text-end'>Costo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.values(ingredientTotals).map((ingredient) => (
          <TableRow key={ingredient.ingredientId}>
            <TableCell>{ingredient.name}</TableCell>
            <TableCell>{ingredient.quantity.toFixed(2)}</TableCell>
            <TableCell>{translateUnit(ingredient.measurement)}</TableCell>
            <TableCell className='text-end'>
              ${ingredient.cost.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <Alert>
      <Icons.circleAlert className='h-4 w-4' />
      <AlertTitle>Sin pedidos para exportar</AlertTitle>
      <AlertDescription>
        No hay pedidos para exportar en este período.
      </AlertDescription>
    </Alert>
  )
}

export default OrdersBulkExport
