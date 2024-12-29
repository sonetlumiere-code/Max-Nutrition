"use client"

import { Icons } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  translatePaymentMethod,
  translateShippingMethod,
} from "@/helpers/helpers"
import { usePromotion } from "@/hooks/use-promotion"
import { LineItem } from "@/types/types"

const AppliedPromotions = ({ items }: { items: LineItem[] }) => {
  const { appliedPromotions } = usePromotion({ items })

  return (
    <>
      {appliedPromotions.length > 0 ? (
        appliedPromotions.map((promotion) => (
          <Alert key={promotion.id}>
            <Icons.badgePercent className='h-4 w-4' />
            <AlertTitle>
              <div className='flex justify-between'>
                <span>¡Promoción aplicada!</span>
                <span className='text-sm text-muted-foreground'>
                  x {promotion.appliedTimes}
                </span>
              </div>
            </AlertTitle>
            <AlertDescription>
              <div className='flex flex-col text-sm text-muted-foreground'>
                <span>{promotion.name}</span>
                <span>{promotion.description}</span>
                <span>
                  Métodos de pago habilitados:{" "}
                  {new Intl.ListFormat("es", {
                    style: "long",
                    type: "conjunction",
                  }).format(
                    promotion.allowedPaymentMethods.map(translatePaymentMethod)
                  )}
                  {"."}
                </span>
                <span>
                  Métodos de envío habilitados:{" "}
                  {new Intl.ListFormat("es", {
                    style: "long",
                    type: "conjunction",
                  }).format(
                    promotion.allowedShippingMethods.map(
                      translateShippingMethod
                    )
                  )}
                  {"."}
                </span>
              </div>
            </AlertDescription>
          </Alert>
        ))
      ) : (
        <Alert>
          <Icons.circleAlert className='h-4 w-4' />
          <AlertTitle>Sin promoción aplicada</AlertTitle>
          <AlertDescription>
            Actualmente no hay promociones aplicadas.
            {/* ¡Explora nuestras
            promociones para ahorrar en tu próxima compra! */}
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

export default AppliedPromotions
