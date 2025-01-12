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
import { translatePaymentMethod } from "@/helpers/helpers"
import { usePromotion } from "@/hooks/use-promotion"
import { OrderSchema } from "@/lib/validations/order-validation"
import { LineItem } from "@/types/types"
import { PaymentMethod } from "@prisma/client"
import { Control } from "react-hook-form"

interface PaymentMethodFieldProps {
  control: Control<OrderSchema>
  items: LineItem[]
  allowedPaymentMethods: PaymentMethod[]
  isSubmitting: boolean
}

const paymentMethodIcons: Record<PaymentMethod, JSX.Element> = {
  CASH: <Icons.circleDollarSign className='mb-3 h-6 w-6' />,
  BANK_TRANSFER: <Icons.landmark className='mb-3 h-6 w-6' />,
  MERCADO_PAGO: <Icons.creditCard className='mb-3 h-6 w-6' />,
  CREDIT_CARD: <Icons.creditCard className='mb-3 h-6 w-6' />,
  DEBIT_CARD: <Icons.creditCard className='mb-3 h-6 w-6' />,
}

const PaymentMethodField = ({
  control,
  items,
  allowedPaymentMethods,
  isSubmitting,
}: PaymentMethodFieldProps) => {
  const { appliedPromotions, isLoadingPromotions } = usePromotion({
    items,
  })

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
            >
              {allowedPaymentMethods.map((method) => {
                const isDisabled =
                  appliedPromotions.length > 0 &&
                  !appliedPromotions.every((promotion) =>
                    promotion.allowedPaymentMethods.includes(method)
                  )

                return (
                  <div key={method}>
                    <RadioGroupItem
                      value={method}
                      id={method}
                      className='peer sr-only'
                      disabled={
                        isSubmitting || isLoadingPromotions || isDisabled
                      }
                    />
                    <Label
                      htmlFor={method}
                      className='flex flex-col items-center justify-between text-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                    >
                      {paymentMethodIcons[method]}
                      {translatePaymentMethod(method)}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default PaymentMethodField
