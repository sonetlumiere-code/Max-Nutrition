import * as XLSX from "xlsx"
import { IngredientTotal, PopulatedOrder, TimePeriod } from "@/types/types"
import {
  calculateIngredientData,
  translatePaymentMethod,
  translateProductRecipeType,
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
  // Hoja 2: Resumen de productos totales (agrupado por producto) con costo total
  // ------------------------------
  const productSummary = orders.reduce(
    (
      summary: Record<
        string,
        { withSalt: number; withoutSalt: number; total: number; cost: number }
      >,
      order
    ) => {
      order.items?.forEach((item) => {
        const productName = item.product.name
        if (!summary[productName]) {
          summary[productName] = {
            withSalt: 0,
            withoutSalt: 0,
            total: 0,
            cost: 0,
          }
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
    ([product, { withSalt, withoutSalt, total, cost }]) => ({
      Producto: product,
      "Cantidad con Sal": withSalt,
      "Cantidad sin Sal": withoutSalt,
      "Cantidad Total": total,
    })
  )

  // ------------------------------
  // Hoja 3: Resumen de ingredientes (iterando sobre cada productRecipe)
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
  // Hoja 4: Resumen de Recetas y sus ingredientes separados por productRecipeType
  // Mostrando "Cantidad Vendida" and "Costo Total Producto" only once per product.
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
        const recipeType = productRecipe.type
        const key = `${product.id}-${recipeType}`
        if (!recipeGroups[key]) {
          recipeGroups[key] = {
            productId: product.id,
            productName: product.name,
            productRecipeType: translateProductRecipeType(recipeType),
            totalQuantityForGroup: 0,
            ingredientTotals: {},
          }
        }

        recipeGroups[key].totalQuantityForGroup += item.quantity

        const recipe = productRecipe.recipe
        recipe?.recipeIngredients?.forEach((ingredientEntry) => {
          const ingredient = ingredientEntry.ingredient
          const baseQuantity = ingredientEntry.quantity * item.quantity
          if (ingredient) {
            const { adjustedQuantity, totalQuantity, cost } =
              calculateIngredientData({
                ingredient,
                quantity: baseQuantity,
                withWaste: true,
              })
            if (recipeGroups[key].ingredientTotals[ingredient.id]) {
              recipeGroups[key].ingredientTotals[ingredient.id].baseQuantity +=
                adjustedQuantity
              recipeGroups[key].ingredientTotals[ingredient.id].totalQuantity +=
                totalQuantity
              recipeGroups[key].ingredientTotals[ingredient.id].cost += cost
              recipeGroups[key].ingredientTotals[ingredient.id].waste =
                ingredient.waste
            } else {
              recipeGroups[key].ingredientTotals[ingredient.id] = {
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
        "Cantidad Vendida": "Cantidad Base",
        Desperdicio: "Desperdicio",
        "Cantidad Total": "Cantidad Total",
        Unidad: "Unidad",
        Costo: "Costo",
      })

      Object.values(group.ingredientTotals).forEach((ingredient) => {
        recipeDetailsData.push({
          Producto: ingredient.name,
          "Cantidad Vendida": ingredient.baseQuantity.toFixed(2),
          Desperdicio: `${ingredient.waste.toFixed(0)}%`,
          "Cantidad Total": ingredient.totalQuantity.toFixed(2),
          Unidad: translateUnit(ingredient.measurement),
          Costo: `$${ingredient.cost.toFixed(2)}`,
        })
      })

      recipeDetailsData.push({
        Producto: "",
        "Cantidad Vendida": "",
        Desperdicio: "",
        "Cantidad Total": "",
        Unidad: "",
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
  // Create the workbook and add sheets.
  // ------------------------------
  const ws1 = XLSX.utils.json_to_sheet(customerOrdersData)
  const ws2 = XLSX.utils.json_to_sheet(productSummaryData)
  const ws3 = XLSX.utils.json_to_sheet(ingredientSummaryData)
  const ws4 = XLSX.utils.json_to_sheet(recipeDetailsData)

  // Configure column widths.
  const wscols = Array(15).fill({ wch: 15 })
  ws1["!cols"] = wscols
  ws2["!cols"] = wscols
  ws3["!cols"] = wscols
  ws4["!cols"] = wscols

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, ws1, "Pedidos Detallados")
  XLSX.utils.book_append_sheet(workbook, ws2, "Resumen Productos")
  XLSX.utils.book_append_sheet(workbook, ws3, "Resumen Ingredientes")
  XLSX.utils.book_append_sheet(workbook, ws4, "Detalle Recetas")

  const fileName = `MaxNutri_WEB_Pedidos_${translateTimePeriod(
    period
  )}_${format(new Date(), "dd-MM-yyyy", { locale: es })}.xlsx`
  XLSX.writeFileXLSX(workbook, fileName)
}
