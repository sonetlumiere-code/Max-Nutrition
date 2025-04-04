import * as XLSX from "xlsx"
import { IngredientTotal, PopulatedOrder, TimePeriod } from "@/types/types"
import {
  calculateIngredientData,
  getBaseMeasurement,
  translateOrderStatus,
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
  // ------------------------------
  // Hoja 1: Datos de clientes y sus pedidos
  // ------------------------------
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
      "Estado de la orden": translateOrderStatus(order.status),
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

  // ------------------------------
  // Hoja 2: Resumen de productos totales (agrupado por producto)
  // ------------------------------
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

  // ------------------------------
  // Hoja 3: Resumen de ingredientes (agrupado por ingrediente)
  // ------------------------------
  const ingredientTotals: Record<string, IngredientTotal & { waste: number }> =
    {}

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const product = item.product
      product.productRecipes?.forEach((productRecipe) => {
        const recipe = productRecipe.recipe
        recipe?.recipeIngredients?.forEach((ingredientEntry) => {
          const ingredient = ingredientEntry.ingredient
          if (ingredient) {
            const perProductQuantity = ingredientEntry.quantity
            const { adjustedQuantity, totalQuantity, cost, baseMeasurement } =
              calculateIngredientData({
                ingredient,
                quantity: perProductQuantity,
                withWaste: true,
              })

            const finalAdjustedQuantity = adjustedQuantity * item.quantity
            const finalTotalQuantity = totalQuantity * item.quantity
            const finalCost = cost * item.quantity

            if (ingredientTotals[ingredient.id]) {
              ingredientTotals[ingredient.id].baseQuantity +=
                finalAdjustedQuantity
              ingredientTotals[ingredient.id].totalQuantity +=
                finalTotalQuantity
              ingredientTotals[ingredient.id].cost += finalCost
              ingredientTotals[ingredient.id].waste = ingredient.waste
            } else {
              ingredientTotals[ingredient.id] = {
                ingredientId: ingredient.id,
                name: ingredient.name,
                measurement: baseMeasurement,
                baseQuantity: finalAdjustedQuantity,
                totalQuantity: finalTotalQuantity,
                cost: finalCost,
                waste: ingredient.waste,
              }
            }
          }
        })
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

  // ------------------------------
  // Hoja 4: Detalle de Recetas con ingredientes
  // ------------------------------
  type RecipeGroup = {
    productId: string
    productName: string
    productRecipeType: string
    totalQuantityForGroup: number
    ingredientTotals: Record<string, IngredientTotal & { waste: number }>
  }

  const recipeGroups: Record<string, RecipeGroup> = {}

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const product = item.product
      product.productRecipes?.forEach((productRecipe) => {
        const recipeTypeName =
          productRecipe.type?.name || "Tipo de receta no especificada"
        const key = `${product.id}-${recipeTypeName}`
        if (!recipeGroups[key]) {
          recipeGroups[key] = {
            productId: product.id,
            productName: product.name,
            productRecipeType: recipeTypeName,
            totalQuantityForGroup: 0,
            ingredientTotals: {},
          }
        }
        recipeGroups[key].totalQuantityForGroup += item.quantity

        const recipe = productRecipe.recipe
        recipe?.recipeIngredients?.forEach((ingredientEntry) => {
          const ingredient = ingredientEntry.ingredient
          if (ingredient) {
            const perProductQuantity = ingredientEntry.quantity
            const { adjustedQuantity, totalQuantity, cost, baseMeasurement } =
              calculateIngredientData({
                ingredient,
                quantity: perProductQuantity,
                withWaste: true,
              })
            const finalAdjustedQuantity = adjustedQuantity * item.quantity
            const finalTotalQuantity = totalQuantity * item.quantity
            const finalCost = cost * item.quantity

            if (recipeGroups[key].ingredientTotals[ingredient.id]) {
              recipeGroups[key].ingredientTotals[ingredient.id].baseQuantity +=
                finalAdjustedQuantity
              recipeGroups[key].ingredientTotals[ingredient.id].totalQuantity +=
                finalTotalQuantity
              recipeGroups[key].ingredientTotals[ingredient.id].cost +=
                finalCost
              recipeGroups[key].ingredientTotals[ingredient.id].waste =
                ingredient.waste
            } else {
              recipeGroups[key].ingredientTotals[ingredient.id] = {
                ingredientId: ingredient.id,
                name: ingredient.name,
                measurement: baseMeasurement,
                baseQuantity: finalAdjustedQuantity,
                totalQuantity: finalTotalQuantity,
                cost: finalCost,
                waste: ingredient.waste,
              }
            }
          }
        })
      })
    })
  })

  const productOrderTotals: Record<string, number> = {}
  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const productId = item.product.id
      if (!productOrderTotals[productId]) {
        productOrderTotals[productId] = 0
      }
      productOrderTotals[productId] += item.quantity
    })
  })

  type ProductGroup = {
    productId: string
    productName: string
    totalQuantitySold: number
    totalCost: number
    recipeGroups: RecipeGroup[]
  }

  const productGroups: Record<string, ProductGroup> = {}
  Object.values(recipeGroups).forEach((group) => {
    const groupTotalCost = Object.values(group.ingredientTotals).reduce(
      (sum, ing) => sum + ing.cost,
      0
    )
    if (!productGroups[group.productId]) {
      productGroups[group.productId] = {
        productId: group.productId,
        productName: group.productName,
        totalQuantitySold: productOrderTotals[group.productId] || 0,
        totalCost: 0,
        recipeGroups: [],
      }
    }
    productGroups[group.productId].totalCost += groupTotalCost
    productGroups[group.productId].recipeGroups.push(group)
  })

  const recipeDetailsData: any[] = []
  Object.values(productGroups).forEach((prodGroup) => {
    recipeDetailsData.push({
      Producto: prodGroup.productName,
      "Cantidad Vendida": prodGroup.totalQuantitySold,
      "Costo Total Producto": `$${prodGroup.totalCost.toFixed(2)}`,
    })

    prodGroup.recipeGroups.forEach((group) => {
      const groupTotalCost = Object.values(group.ingredientTotals).reduce(
        (sum, ing) => sum + ing.cost,
        0
      )
      recipeDetailsData.push({
        "Tipo de Receta": group.productRecipeType,
        "Cantidad Vendida (Tipo)": group.totalQuantityForGroup,
        "Costo Total Receta": `$${groupTotalCost.toFixed(2)}`,
      })
      recipeDetailsData.push({
        Producto: "Ingrediente",
        "Cantidad Base": "Cantidad Base",
        "Desperdicio (%)": "Desperdicio (%)",
        "Cantidad Total": "Cantidad Total",
        "Unidad de Medida": "Unidad de Medida",
        Costo: "Costo",
      })
      Object.values(group.ingredientTotals).forEach((ingredient) => {
        recipeDetailsData.push({
          Producto: ingredient.name,
          "Cantidad Base": ingredient.baseQuantity.toFixed(2),
          "Desperdicio (%)": `${ingredient.waste.toFixed(0)}%`,
          "Cantidad Total": ingredient.totalQuantity.toFixed(2),
          "Unidad de Medida": translateUnit(
            getBaseMeasurement(ingredient.measurement)
          ),
          Costo: `$${ingredient.cost.toFixed(2)}`,
        })
      })
      recipeDetailsData.push({
        Producto: "",
        "Cantidad Vendida": "",
        "Cantidad Base": "",
        "Desperdicio (%)": "",
        "Cantidad Total": "",
        "Unidad de Medida": "",
        Costo: "",
      })
    })
    recipeDetailsData.push({
      Producto: "",
      "Cantidad Vendida": "",
      "Costo Total Producto": "",
    })
  })

  // ------------------------------
  // Hoja 5: Bolsones (Total de productos por cada cliente)
  // ------------------------------
  const uniqueCustomers = Array.from(
    new Set(orders.map((order) => order.customer?.name || "N/A"))
  )
  const uniqueProducts = Array.from(
    new Set(
      orders.flatMap(
        (order) => order.items?.map((item) => item.product.name) || []
      )
    )
  )

  const bagsData = uniqueCustomers.map((customer) => {
    const row: Record<string, any> = { "Nombre Cliente": customer }
    uniqueProducts.forEach((product) => {
      row[product] = orders
        .filter((order) => (order.customer?.name || "N/A") === customer)
        .flatMap((order) => order.items || [])
        .filter((item) => item.product.name === product)
        .reduce((sum, item) => sum + item.quantity, 0)
    })
    return row
  })

  // ------------------------------
  // Crear el workbook y agregar hojas.
  // ------------------------------
  const ws1 = XLSX.utils.json_to_sheet(customerOrdersData)
  const ws2 = XLSX.utils.json_to_sheet(productSummaryData)
  const ws3 = XLSX.utils.json_to_sheet(ingredientSummaryData)
  const ws4 = XLSX.utils.json_to_sheet(recipeDetailsData)
  const ws5 = XLSX.utils.json_to_sheet(bagsData)

  const wscols = Array(15).fill({ wch: 15 })
  ws1["!cols"] = wscols
  ws2["!cols"] = wscols
  ws3["!cols"] = wscols
  ws4["!cols"] = wscols
  ws5["!cols"] = wscols

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws1, "Pedidos Detallados")
  XLSX.utils.book_append_sheet(workbook, ws2, "Resumen Productos")
  XLSX.utils.book_append_sheet(workbook, ws3, "Resumen Ingredientes")
  XLSX.utils.book_append_sheet(workbook, ws4, "Detalle Recetas")
  XLSX.utils.book_append_sheet(workbook, ws5, "Bolsones")

  const fileName = `MaxNutri_WEB_Pedidos_${translateTimePeriod(
    period
  )}_${format(new Date(), "dd-MM-yyyy", { locale: es })}.xlsx`
  XLSX.writeFileXLSX(workbook, fileName)
}
