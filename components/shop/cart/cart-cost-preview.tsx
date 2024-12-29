"use client"

import { usePromotion } from "@/hooks/use-promotion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/cart-provider"

const CartCostPreview = () => {
  const { items, getSubtotalPrice } = useCart()
  const { isLoadingPromotions, appliedPromotions, finalPrice } = usePromotion({
    items,
  })

  return (
    <>
      {appliedPromotions.length > 0 ? (
        <Alert>
          <Icons.badgePercent className='h-4 w-4' />
          <AlertTitle>¡Promociones aplicadas!</AlertTitle>
          <AlertDescription className='flex justify-between'>
            <div className='flex flex-col'>
              <span>Subtotal</span>
              {appliedPromotions.map((appliedPromotion) => (
                <span key={appliedPromotion.id}>
                  {appliedPromotion.name} (x{appliedPromotion.appliedTimes})
                </span>
              ))}
              <span>Precio total</span>
            </div>
            <div className='flex flex-col text-end'>
              <span>${getSubtotalPrice().toFixed(2)}</span>
              {appliedPromotions.map((appliedPromotion) => (
                <span key={appliedPromotion.id} className='text-destructive'>
                  {appliedPromotion.discountType === "FIXED" ? (
                    <>
                      -$
                      {(
                        appliedPromotion.appliedTimes *
                        appliedPromotion.discount
                      ).toFixed(2)}
                    </>
                  ) : appliedPromotion.discountType === "PERCENTAGE" ? (
                    <>
                      -{appliedPromotion.discount}% (-$
                      {(
                        appliedPromotion.appliedTimes *
                        appliedPromotion.discount
                      ).toFixed(2)}
                      )
                    </>
                  ) : null}
                </span>
              ))}
              <span>${finalPrice.toFixed(2)}</span>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert
          className={cn({
            invisible: isLoadingPromotions,
          })}
        >
          <Icons.info className='h-4 w-4' />
          <AlertTitle>Sin promoción aplicada</AlertTitle>
          <AlertDescription>
            Actualmente no hay promociones disponibles para tu carrito. ¡Explora
            nuestras promociones para ahorrar en tu próxima compra!
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

export default CartCostPreview
