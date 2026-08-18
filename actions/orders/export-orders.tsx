import type { Workbook } from "exceljs"
import { PopulatedOrder, TimePeriod } from "@/types/types"
import {
  getBaseMeasurement,
  translateOrderStatus,
  translatePaymentMethod,
  translateShippingMethod,
  translateTimePeriod,
  translateUnit,
} from "@/helpers/helpers"
import {
  aggregateBags,
  aggregateIngredients,
  aggregateProducts,
  aggregateRecipeGroups,
} from "@/helpers/production"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Replica el comportamiento de json_to_sheet de SheetJS: el encabezado es la
// unión de las claves de todas las filas, en orden de primera aparición.
const addJsonSheet = (
  workbook: Workbook,
  name: string,
  rows: Record<string, unknown>[]
) => {
  const worksheet = workbook.addWorksheet(name)
  const headers: string[] = []
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (!headers.includes(key)) headers.push(key)
    })
  })
  worksheet.columns = headers.map((header, index) => ({
    header,
    key: header,
    width: index < 15 ? 15 : undefined,
  }))
  rows.forEach((row) => worksheet.addRow(row))
  return worksheet
}

export const exportOrdersToExcel = async (
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
        (sum, promo) =>
          sum +
          (promo.discountAmount ??
            promo.promotionDiscount * promo.appliedTimes),
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
      Subtotal:
        // Órdenes legacy sin subtotal: se reconstruye desde el total guardado.
        order.subtotal ??
        order.total - (order.shippingCost || 0) + totalDiscount,
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
  const productSummaryData = aggregateProducts(orders).map((product) => ({
    Producto: product.name,
    "Cantidad con Sal": product.withSalt,
    "Cantidad sin Sal": product.withoutSalt,
    "Cantidad Total": product.total,
  }))

  // ------------------------------
  // Hoja 3: Resumen de ingredientes (agrupado por ingrediente)
  // ------------------------------
  const ingredientSummaryData = aggregateIngredients(orders).map(
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
  const recipeDetailsData: any[] = []
  aggregateRecipeGroups(orders).forEach((prodGroup) => {
    recipeDetailsData.push({
      Producto: prodGroup.productName,
      "Cantidad Vendida": prodGroup.totalQuantitySold,
      "Costo Total Producto": `$${prodGroup.totalCost.toFixed(2)}`,
    })

    prodGroup.recipeGroups.forEach((group) => {
      const groupTotalCost = group.ingredients.reduce(
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
      group.ingredients.forEach((ingredient) => {
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
  const bagsData = aggregateBags(orders).rows.map((row) => ({
    "Nombre Cliente": row.customer,
    ...row.quantities,
  }))

  // ------------------------------
  // Crear el workbook y agregar hojas.
  // ------------------------------
  // Import dinámico: exceljs solo se descarga al momento de exportar.
  const { Workbook } = await import("exceljs")
  const workbook = new Workbook()
  addJsonSheet(workbook, "Pedidos Detallados", customerOrdersData)
  addJsonSheet(workbook, "Resumen Productos", productSummaryData)
  addJsonSheet(workbook, "Resumen Ingredientes", ingredientSummaryData)
  addJsonSheet(workbook, "Detalle Recetas", recipeDetailsData)
  addJsonSheet(workbook, "Bolsones", bagsData)

  const fileName = `MaxNutri_WEB_Pedidos_${translateTimePeriod(
    period
  )}_${format(new Date(), "dd-MM-yyyy", { locale: es })}.xlsx`

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
