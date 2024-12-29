"use client"

import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { usePromotion } from "@/hooks/use-promotion"
import { LineItem } from "@/types/types"

type SummaryProps = {
  items: LineItem[]
  shippingCost: number
}

const Summary = ({ items, shippingCost }: SummaryProps) => {
  const { appliedPromotions, isLoadingPromotions, subtotalPrice, finalPrice } =
    usePromotion({
      items,
    })

  return (
    <div className='grid gap-2'>
      <div className='flex items-center justify-between text-sm'>
        <span>Subtotal</span>
        {isLoadingPromotions ? (
          <Skeleton className='w-20 h-8' />
        ) : (
          <span>${subtotalPrice.toFixed(2)}</span>
        )}
      </div>

      {appliedPromotions.length > 0 &&
        appliedPromotions.map((promotion) => {
          const appliedDiscount =
            promotion.discountType === "PERCENTAGE"
              ? subtotalPrice * (promotion.discount / 100)
              : promotion.discountType === "FIXED"
              ? promotion.discount * (promotion.appliedTimes || 1)
              : 0

          return (
            <div
              key={promotion.id}
              className='flex items-center justify-between text-sm'
            >
              <span>
                {promotion.name} (x{promotion.appliedTimes})
              </span>
              {isLoadingPromotions ? (
                <Skeleton className='w-20 h-8' />
              ) : promotion.discountType === "FIXED" ? (
                <span className='text-destructive'>
                  -${appliedDiscount.toFixed(2)}
                </span>
              ) : promotion.discountType === "PERCENTAGE" ? (
                <span className='text-destructive'>
                  -{promotion.discount}% (-$
                  {appliedDiscount.toFixed(2)})
                </span>
              ) : null}
            </div>
          )
        })}

      <div className='flex items-center justify-between text-sm'>
        <span>Costo de envío</span>
        {isLoadingPromotions ? (
          <Skeleton className='w-20 h-8' />
        ) : (
          <span>${shippingCost.toFixed(2)}</span>
        )}
      </div>

      <Separator />

      <div className='flex items-center justify-between font-bold'>
        <span>Total</span>
        {isLoadingPromotions ? (
          <Skeleton className='w-20 h-6' />
        ) : (
          <span>${(finalPrice + shippingCost).toFixed(2)}</span>
        )}
      </div>
    </div>
  )
}

export default Summary
