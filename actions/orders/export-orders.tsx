import * as XLSX from "xlsx"
import { IngredientTotal, PopulatedOrder, TimePeriod } from "@/types/types"
import {
  calculateIngredientData,
  translatePaymentMethod,
  translateShippingMethod,
  translateTimePeriod,
  translateUnit,
} from "@/helpers/helpers"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const exportOrdersToExcel = (
  orders: PopulatedOrder[],
  period: TimePeriod
) => {
  // Hoja 1: Datos de clientes y sus pedidos
  const customerOrdersData = orders.map((order) => {
    const totalItems =
      order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

    const totalDiscount =
      order.appliedPromotions?.reduce(
        (sum, promo) => sum + promo.promotionDiscount,
        0
      ) || 0

    const appliedPromotionNames =
      order.appliedPromotions?.map((promo) => promo.promotionName).join(", ") ||
      "N/A"

    return {
      "Nombre Cliente": order.customer?.name || "N/A",
      Email: order.customer?.user?.email || "N/A",
      Teléfono: order.customer?.phone || "N/A",
      Dirección: order.address
        ? `${order.address.addressStreet} ${order.address.addressNumber}, ${order.address.locality}, ${order.address.municipality}, ${order.address.province}`
        : "N/A",
      Piso: order.address?.addressFloor || "N/A",
      Departamento: order.address?.addressApartment || "N/A",
      "Método de Envío": translateShippingMethod(order.shippingMethod),
      "Método de Pago": translatePaymentMethod(order.paymentMethod),
      "Cantidad Total de Productos": totalItems,
      Subtotal: order.subtotal || order.total,
      "Costo de Envío": order.shippingCost || 0,
      Descuento: totalDiscount,
      "Promoción Aplicada": appliedPromotionNames,
      Total: order.total,
      Fecha: format(order.createdAt, "dd/MM/yyyy"),
    }
  })

  // Hoja 2: Resumen de productos totales (con y sin sal)
  const productSummary = orders.reduce(
    (
      summary: Record<
        string,
        { withSalt: number; withoutSalt: number; total: number }
      >,
      order
    ) => {
      order.items?.forEach((item) => {
        const productName = item.product.name
        if (!summary[productName]) {
          summary[productName] = { withSalt: 0, withoutSalt: 0, total: 0 }
        }

        if (item.withSalt) {
          summary[productName].withSalt += item.quantity
        } else {
          summary[productName].withoutSalt += item.quantity
        }

        summary[productName].total += item.quantity
      })

      return summary
    },
    {}
  )

  const productSummaryData = Object.entries(productSummary).map(
    ([product, { withSalt, withoutSalt, total }]) => ({
      Producto: product,
      "Cantidad con Sal": withSalt,
      "Cantidad sin Sal": withoutSalt,
      "Cantidad Total": total,
    })
  )

  // Hoja 3: Resumen de ingredientes
  const ingredientTotals: Record<string, IngredientTotal & { waste: number }> =
    {}

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const product = item.product
      const recipe = product.recipe

      recipe?.ingredients?.forEach((ingredientEntry) => {
        const ingredient = ingredientEntry.ingredient
        const baseQuantity = ingredientEntry.quantity * item.quantity

        if (ingredient) {
          const { adjustedQuantity, totalQuantity, cost } =
            calculateIngredientData({
              ingredient,
              quantity: baseQuantity,
              withWaste: true,
            })

          if (ingredientTotals[ingredient.id]) {
            ingredientTotals[ingredient.id].baseQuantity += adjustedQuantity
            ingredientTotals[ingredient.id].totalQuantity += totalQuantity
            ingredientTotals[ingredient.id].cost += cost
            ingredientTotals[ingredient.id].waste = ingredient.waste
          } else {
            ingredientTotals[ingredient.id] = {
              ingredientId: ingredient.id,
              name: ingredient.name,
              measurement: ingredient.measurement,
              baseQuantity: adjustedQuantity,
              totalQuantity,
              cost,
              waste: ingredient.waste,
            }
          }
        }
      })
    })
  })

  const ingredientSummaryData = Object.values(ingredientTotals).map(
    (ingredient) => ({
      Ingrediente: ingredient.name,
      "Cantidad Base": ingredient.baseQuantity.toFixed(2),
      "Desperdicio (%)": `${ingredient.waste.toFixed(0)}%`,
      "Cantidad Total": ingredient.totalQuantity.toFixed(2),
      "Unidad de Medida": translateUnit(ingredient.measurement),
      "Costo Total": `$${ingredient.cost.toFixed(2)}`,
    })
  )

  // Hoja 4: Resumen de Recetas y sus ingredientes
  const recipeSummary: Record<
    string,
    {
      productName: string
      totalQuantitySold: number
      ingredientTotals: IngredientTotal[]
    }
  > = {}

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const product = item.product
      const recipe = product.recipe

      if (!recipe) return

      if (!recipeSummary[product.id]) {
        recipeSummary[product.id] = {
          productName: product.name,
          totalQuantitySold: item.quantity,
          ingredientTotals: [],
        }

        recipe.ingredients?.forEach((ingredientEntry) => {
          const ingredient = ingredientEntry.ingredient
          const baseQuantity = ingredientEntry.quantity * item.quantity

          if (ingredient) {
            const { adjustedQuantity, totalQuantity, cost } =
              calculateIngredientData({
                ingredient,
                quantity: baseQuantity,
                withWaste: true,
              })

            recipeSummary[product.id].ingredientTotals.push({
              ingredientId: ingredient.id,
              name: ingredient.name,
              baseQuantity: adjustedQuantity,
              totalQuantity,
              cost,
              waste: ingredient.waste,
              measurement: ingredient.measurement,
            })
          }
        })
      } else {
        recipeSummary[product.id].totalQuantitySold += item.quantity

        recipe.ingredients?.forEach((ingredientEntry) => {
          const ingredient = ingredientEntry.ingredient
          const baseQuantity = ingredientEntry.quantity * item.quantity

          if (ingredient) {
            const { adjustedQuantity, totalQuantity, cost } =
              calculateIngredientData({
                ingredient,
                quantity: baseQuantity,
                withWaste: true,
              })

            const existingIngredient = recipeSummary[
              product.id
            ].ingredientTotals.find(
              (total) => total.ingredientId === ingredient.id
            )

            if (existingIngredient) {
              existingIngredient.baseQuantity += adjustedQuantity
              existingIngredient.totalQuantity += totalQuantity
              existingIngredient.cost += cost
              existingIngredient.waste = ingredient.waste
            } else {
              recipeSummary[product.id].ingredientTotals.push({
                ingredientId: ingredient.id,
                name: ingredient.name,
                baseQuantity: adjustedQuantity,
                totalQuantity,
                cost,
                waste: ingredient.waste,
                measurement: ingredient.measurement,
              })
            }
          }
        })
      }
    })
  })

  // Convertir el resumen de recetas a formato para Excel
  const recipeDetailsData: any[] = []

  Object.values(recipeSummary).forEach((recipe) => {
    // Agregar encabezado del producto
    recipeDetailsData.push({
      Producto: recipe.productName,
      "Cantidad Vendida": recipe.totalQuantitySold,
      "": "", // Columna vacía para separación
      "Costo Total": `$${recipe.ingredientTotals
        .reduce((sum, ing) => sum + ing.cost, 0)
        .toFixed(2)}`,
    })

    // Agregar encabezados de ingredientes
    recipeDetailsData.push({
      Producto: "Ingrediente",
      "Cantidad Vendida": "Cantidad Base",
      "": "Desperdicio",
      "Costo Total": "Cantidad Total",
      Unidad: "Unidad",
      Costo: "Costo",
    })

    // Agregar ingredientes
    recipe.ingredientTotals.forEach((ingredient) => {
      recipeDetailsData.push({
        Producto: ingredient.name,
        "Cantidad Vendida": ingredient.baseQuantity.toFixed(2),
        "": `${ingredient.waste.toFixed(0)}%`,
        "Costo Total": ingredient.totalQuantity.toFixed(2),
        Unidad: translateUnit(ingredient.measurement),
        Costo: `$${ingredient.cost.toFixed(2)}`,
      })
    })

    // Agregar línea vacía entre productos
    recipeDetailsData.push({
      Producto: "",
      "Cantidad Vendida": "",
      "": "",
      "Costo Total": "",
    })
  })

  // Crear y agregar todas las hojas
  const ws1 = XLSX.utils.json_to_sheet(customerOrdersData)
  const ws2 = XLSX.utils.json_to_sheet(productSummaryData)
  const ws3 = XLSX.utils.json_to_sheet(ingredientSummaryData)
  const ws4 = XLSX.utils.json_to_sheet(recipeDetailsData)

  // Configurar el ancho de las columnas
  const wscols = Array(15).fill({ wch: 15 })
  ws1["!cols"] = wscols
  ws2["!cols"] = wscols
  ws3["!cols"] = wscols
  ws4["!cols"] = wscols

  // Crear el libro y agregar las hojas
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws1, "Pedidos Detallados")
  XLSX.utils.book_append_sheet(workbook, ws2, "Resumen Productos")
  XLSX.utils.book_append_sheet(workbook, ws3, "Resumen Ingredientes")
  XLSX.utils.book_append_sheet(workbook, ws4, "Detalle Recetas")

  // Generar archivo y descargarlo
  const fileName = `MaxNutri_WEB_Pedidos_${translateTimePeriod(
    period
  )}_${format(new Date(), "dd-MM-yyyy", { locale: es })}.xlsx`
  XLSX.writeFileXLSX(workbook, fileName)
}
