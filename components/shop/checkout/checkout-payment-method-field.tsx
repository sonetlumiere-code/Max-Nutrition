"use client"

import { Icons } from "@/components/icons"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { usePromotion } from "@/hooks/use-promotion"
import { OrderSchema } from "@/lib/validations/order-validation"
import { PaymentMethod } from "@prisma/client"
import { Control } from "react-hook-form"

interface CheckoutPaymentMethodFieldProps {
  control: Control<OrderSchema>
  isSubmitting: boolean
}

const CheckoutPaymentMethodField = ({
  control,
  isSubmitting,
}: CheckoutPaymentMethodFieldProps) => {
  const { appliedPromotions, isLoadingPromotions } = usePromotion()

  return (
    <FormField
      control={control}
      name='paymentMethod'
      render={({ field }) => (
        <FormItem className='space-y-3'>
          <FormLabel>Método de pago</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className='grid grid-cols-2 gap-4'
              disabled={isSubmitting || isLoadingPromotions}
            >
              <div>
                <RadioGroupItem
                  value={PaymentMethod.MERCADO_PAGO}
                  id={PaymentMethod.MERCADO_PAGO}
                  className='peer sr-only'
                  disabled={
                    appliedPromotions.length > 0 &&
                    !appliedPromotions.every((promotion) =>
                      promotion.allowedPaymentMethods.includes(
                        PaymentMethod.MERCADO_PAGO
                      )
                    )
                  }
                />
                <Label
                  htmlFor={PaymentMethod.MERCADO_PAGO}
                  className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                >
                  <Icons.creditCard className='mb-3 h-6 w-6' />
                  Mercado Pago
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value={PaymentMethod.CASH}
                  id={PaymentMethod.CASH}
                  className='peer sr-only'
                  disabled={
                    appliedPromotions.length > 0 &&
                    !appliedPromotions.every((promotion) =>
                      promotion.allowedPaymentMethods.includes(
                        PaymentMethod.CASH
                      )
                    )
                  }
                />
                <Label
                  htmlFor={PaymentMethod.CASH}
                  className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                >
                  <Icons.dollarSign className='mb-3 h-6 w-6' />
                  Efectivo
                </Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default CheckoutPaymentMethodField
