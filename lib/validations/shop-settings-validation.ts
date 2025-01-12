import { PaymentMethod } from "@prisma/client"
import { z } from "zod"
import { shopBranchSchema } from "./shop-branch-validation"

export const shopSettingsSchema = z.object({
  branches: z.array(shopBranchSchema).optional(),
  allowedPaymentMethods: z.array(z.nativeEnum(PaymentMethod)),
})
