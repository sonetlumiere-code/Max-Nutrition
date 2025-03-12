"use client"

import { Icons } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  translatePaymentMethod,
  translateShippingMethod,
} from "@/helpers/helpers"
import { usePromotion } from "@/hooks/use-promotion"
import { LineItem } from "@/types/types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { Badge } from "../ui/badge"
import { ShopCategory } from "@prisma/client"

const AppliedPromotions = ({
  items,
  shopCategory,
}: {
  items: LineItem[]
  shopCategory: ShopCategory
}) => {
  const { appliedPromotions } = usePromotion({ items, shopCategory })

  return (
    <>
      {appliedPromotions.length > 0 ? (
        appliedPromotions.map((promotion) => (
          <Alert key={promotion.id} variant='success'>
            <Icons.badgePercent className='h-4 w-4' />
            <AlertTitle className='w-full'>
              <div className='flex items-center justify-between mb-1'>
                <span className='font-medium'>
                  ¡Promoción aplicada! ({promotion.name})
                </span>
                <Badge variant='outline'>x {promotion.appliedTimes}</Badge>
              </div>
              <Accordion type='single' collapsible className='w-full'>
                <AccordionItem value='item-1' className='border-b-0'>
                  <AccordionTrigger className='py-1 text-sm font-normal text-muted-foreground bg-muted/50 px-2 rounded-t-md'>
                    Ver detalles
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className='flex flex-col gap-1 text-sm text-muted-foreground bg-muted/50 p-2 rounded-b-md'>
                      <span>{promotion.description}</span>
                      <span className='flex items-center'>
                        <Icons.walletMinimal className='h-4 w-4 mr-2' />
                        {new Intl.ListFormat("es", {
                          style: "long",
                          type: "conjunction",
                        }).format(
                          promotion.allowedPaymentMethods.map(
                            translatePaymentMethod
                          )
                        )}
                        {"."}
                      </span>
                      <span className='flex items-center'>
                        <Icons.truck className='h-4 w-4 mr-2' />
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AlertTitle>
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
