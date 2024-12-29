import * as XLSX from "xlsx"
import { IngredientTotal, PopulatedOrder } from "@/types/types"

export const exportOrdersToExcel = (orders: PopulatedOrder[]) => {
  // Hoja 1: Datos de clientes y sus pedidos
  const customerOrdersData = orders.map((order) => {
    const totalItems =
      order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

    return {
      "Nombre Cliente": order.customer?.name || "N/A",
      Email: order.customer?.user?.email || "N/A",
      Teléfono: order.customer?.phone || "N/A",
      Dirección: order.address
        ? `${order.address.addressStreet} ${order.address.addressNumber}, ${order.address.locality}, ${order.address.municipality}, ${order.address.province}`
        : "N/A",
      Piso: order.address?.addressFloor || "N/A",
      Departamento: order.address?.addressApartment || "N/A",
      "Método de Envío": order.shippingMethod,
      "Método de Pago": order.paymentMethod,
      "Cantidad Total de Productos": totalItems,
      Subtotal: order.subtotal || order.total,
      "Costo de Envío": order.shippingCost || 0,
      Descuento: order.appliedPromotionDiscount || 0,
      "Promoción Aplicada": order.appliedPromotionName || "N/A",
      Total: order.total,
      Fecha: order.createdAt.toLocaleDateString("es-AR"),
    }
  })

  // Hoja 2: Resumen de productos totales
  const productSummary = orders.reduce(
    (summary: Record<string, number>, order) => {
      order.items?.forEach((item) => {
        const productName = item.product.name
        summary[productName] = (summary[productName] || 0) + item.quantity
      })
      return summary
    },
    {}
  )

  const productSummaryData = Object.entries(productSummary).map(
    ([product, quantity]) => ({
      Producto: product,
      "Cantidad Total": quantity,
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
        const wasteMultiplier = 1 + ingredient.waste
        const totalQuantity = baseQuantity * wasteMultiplier
        const cost = totalQuantity * ingredient.price

        if (ingredient) {
          if (ingredientTotals[ingredient.id]) {
            ingredientTotals[ingredient.id].quantity += totalQuantity
            ingredientTotals[ingredient.id].cost += cost
            ingredientTotals[ingredient.id].waste = ingredient.waste
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

  const ingredientSummaryData = Object.values(ingredientTotals).map(
    (ingredient) => ({
      Ingrediente: ingredient.name,
      "Cantidad Base": Number(
        (ingredient.quantity / (1 + ingredient.waste)).toFixed(2)
      ),
      "Desperdicio (%)": `${(ingredient.waste * 100).toFixed(0)}%`,
      "Cantidad Total": Number(ingredient.quantity.toFixed(2)),
      "Unidad de Medida": ingredient.measurement,
      "Costo Total": `$${ingredient.cost.toFixed(2)}`,
    })
  )

  // Hoja 4: Resumen de Recetas y sus ingredientes
  const recipeSummary: Record<
    string,
    {
      productName: string
      totalQuantitySold: number
      ingredients: {
        name: string
        baseQuantity: number
        waste: number
        totalQuantity: number
        measurement: string
        cost: number
      }[]
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
          ingredients: [],
        }

        // Inicializar los ingredientes para esta receta
        recipe.ingredients?.forEach((ingredientEntry) => {
          const ingredient = ingredientEntry.ingredient
          const baseQuantity = ingredientEntry.quantity * item.quantity
          const wasteMultiplier = 1 + ingredient.waste
          const totalQuantity = baseQuantity * wasteMultiplier
          const cost = totalQuantity * ingredient.price

          recipeSummary[product.id].ingredients.push({
            name: ingredient.name,
            baseQuantity: baseQuantity,
            waste: ingredient.waste,
            totalQuantity: totalQuantity,
            measurement: ingredient.measurement,
            cost: cost,
          })
        })
      } else {
        // Actualizar cantidad vendida
        recipeSummary[product.id].totalQuantitySold += item.quantity

        // Actualizar cantidades de ingredientes
        recipe.ingredients?.forEach((ingredientEntry, index) => {
          const ingredient = ingredientEntry.ingredient
          const baseQuantity = ingredientEntry.quantity * item.quantity
          const wasteMultiplier = 1 + ingredient.waste
          const totalQuantity = baseQuantity * wasteMultiplier
          const cost = totalQuantity * ingredient.price

          recipeSummary[product.id].ingredients[index].baseQuantity +=
            baseQuantity
          recipeSummary[product.id].ingredients[index].totalQuantity +=
            totalQuantity
          recipeSummary[product.id].ingredients[index].cost += cost
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
      "Costo Total": `$${recipe.ingredients
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
    recipe.ingredients.forEach((ingredient) => {
      recipeDetailsData.push({
        Producto: ingredient.name,
        "Cantidad Vendida": ingredient.baseQuantity.toFixed(2),
        "": `${(ingredient.waste * 100).toFixed(0)}%`,
        "Costo Total": ingredient.totalQuantity.toFixed(2),
        Unidad: ingredient.measurement,
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
  const fileName = `MaxNutri_WEB_pedidos_${
    new Date().toISOString().split("T")[0]
  }.xlsx`
  XLSX.writeFileXLSX(workbook, fileName)
}
