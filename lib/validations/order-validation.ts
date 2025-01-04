import { OrderStatus, PaymentMethod, ShippingMethod } from "@prisma/client"
import { z } from "zod"

const coreOrderSchema = z.object({
  origin: z.enum(["SHOP", "DASHBOARD"]),
  customerId: z.string().optional(),
  customerAddressId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  shippingMethod: z.nativeEnum(ShippingMethod),
  status: z.nativeEnum(OrderStatus).optional(),
  shopBranchId: z.string().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, { message: "Selecciona un producto." }),
        quantity: z.coerce
          .number()
          .min(1, { message: "La cantidad debe ser al menos 1." }),
        variation: z.object({ withSalt: z.boolean() }),
      })
    )
    .min(1, { message: "Debes agregar al menos un producto al pedido." }),
})

export const orderSchema = coreOrderSchema
  .refine(
    (data) => {
      if (data.origin === "DASHBOARD") {
        return !!data.customerId && data.customerId.trim().length > 0
      }
      return true
    },
    {
      message:
        "El ID del cliente es obligatorio para pedidos creados desde el panel de administración.",
      path: ["customerId"],
    }
  )
  .refine(
    (data) => {
      if (data.shippingMethod === ShippingMethod.DELIVERY) {
        return (
          !!data.customerAddressId && data.customerAddressId.trim().length > 0
        )
      }
      return true
    },
    {
      message: "Debes seleccionar la dirección de envío para delivery.",
      path: ["customerAddressId"],
    }
  )
  .refine(
    (data) => {
      if (data.shippingMethod === ShippingMethod.TAKE_AWAY) {
        return !!data.shopBranchId && data.shopBranchId.trim().length > 0
      }
      return true
    },
    {
      message: "Debes seleccionar una sucursal.",
      path: ["shopBranchId"],
    }
  )

export const partialOrderSchema = coreOrderSchema.partial()

export type OrderSchema = z.infer<typeof orderSchema>
