"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { exportOrdersToExcel } from "@/actions/orders/export-orders"

interface OrdersBulkExportDialogProps {
  label: string
  open: boolean
  setOpen: (open: boolean) => void
  orders: PopulatedOrder[]
}

export default function OrdersBulkExportDialog({
  label,
  open,
  setOpen,
  orders,
}: OrdersBulkExportDialogProps) {
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
              waste: ingredient.waste,
            }
          }
        }
      })
    })
  })

  const handleExport = () => {
    exportOrdersToExcel(orders)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>
            Resumen de ingredientes necesarios para los pedidos seleccionados.
          </DialogDescription>
        </DialogHeader>
        {orders.length > 0 ? (
          <>
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
                    <TableCell>
                      {translateUnit(ingredient.measurement)}
                    </TableCell>
                    <TableCell className='text-end'>
                      ${ingredient.cost.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className='flex justify-end mt-6'>
              <Button onClick={handleExport} className='gap-2'>
                <Icons.file className='h-4 w-4' />
                Descargar Pedidos
              </Button>
            </div>
          </>
        ) : (
          <Alert>
            <Icons.circleAlert className='h-4 w-4' />
            <AlertTitle>Sin pedidos para exportar</AlertTitle>
            <AlertDescription>
              No hay pedidos para exportar en este período.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  )
}
