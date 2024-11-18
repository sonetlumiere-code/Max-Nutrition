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
        const totalQuantity = ingredientEntry.quantity * item.quantity

        if (ingredient) {
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
        }
      })
    })
  })

  return orders.length > 0 ? (
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
              {translateUnit(ingredient.measurement)}
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
