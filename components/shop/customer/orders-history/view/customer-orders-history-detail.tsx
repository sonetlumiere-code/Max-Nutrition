/* eslint-disable @next/next/no-img-element */
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  translateOrderStatus,
  translatePaymentMethod,
  translateShippingMethod,
} from "@/helpers/helpers"
import { cn } from "@/lib/utils"
import { PopulatedOrder } from "@/types/types"

type CustomerViewOrderDetailProps = {
  order: PopulatedOrder
}

const CustomerViewOrderDetail = ({ order }: CustomerViewOrderDetailProps) => {
  return (
    <div className='grid gap-3 p-4'>
      <div className='font-semibold'>Detalles de la orden</div>
      <ScrollArea className='h-[42vh]'>
        <Table>
          <TableBody>
            {order.items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <img
                    src={
                      item.product?.image
                        ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${item.product.image}`
                        : "/img/no-image.jpg"
                    }
                    alt='Product image'
                    className='w-8 h-8 rounded-md'
                  />
                </TableCell>
                <TableCell>{item.product?.name}</TableCell>
                <TableCell className='whitespace-nowrap'>
                  {item.withSalt ? (
                    <Badge variant='secondary'>Con sal</Badge>
                  ) : (
                    <Badge variant='secondary'>Sin sal</Badge>
                  )}
                </TableCell>
                <TableCell className='whitespace-nowrap'>
                  x {item.quantity}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator className='my-2' />
        <ul className='grid gap-3 text-sm'>
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Subtotal</span>
            <span>
              $
              {order.subtotal
                ? order.subtotal.toFixed(2)
                : order.total.toFixed(2)}
            </span>
          </li>

          {order.appliedPromotions && order.appliedPromotions.length > 0 && (
            <ul>
              {order.appliedPromotions.map((appliedPromotion, index) => (
                <li key={index} className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>
                    {appliedPromotion.promotionName} (x
                    {appliedPromotion.appliedTimes})
                  </span>
                  <span className='text-destructive'>
                    {appliedPromotion.promotionDiscountType === "PERCENTAGE" ? (
                      <>
                        -{appliedPromotion.promotionDiscount}% (-$
                        {(
                          ((order.subtotal || 0) *
                            appliedPromotion.promotionDiscount) /
                          100
                        ).toFixed(2)}
                        )
                      </>
                    ) : appliedPromotion.promotionDiscountType === "FIXED" ? (
                      <>
                        -$
                        {(
                          appliedPromotion.promotionDiscount *
                            appliedPromotion.appliedTimes || 0
                        ).toFixed(2)}
                      </>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Costo de envío</span>
            <span>
              {order.shippingCost
                ? `$${order.shippingCost.toFixed(2)}`
                : "Gratis"}
            </span>
          </li>
          <li className='flex items-center justify-between font-semibold'>
            <span className='text-muted-foreground'>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </li>
        </ul>

        <Separator className='my-4' />
        <div className='flex justify-between'>
          <div className='grid gap-3 text-sm'>
            <div className='font-semibold'>Información de entrega</div>
            {order.shippingMethod === "DELIVERY" && (
              <>
                {order.address ? (
                  <address className='grid gap-0.5 not-italic text-muted-foreground'>
                    <span>
                      {order.address?.addressStreet}{" "}
                      {order.address?.addressNumber}{" "}
                      {order.address.addressFloor || ""}{" "}
                      {order.address.addressApartment}
                    </span>
                    <span>
                      {order.address?.province}, {order.address?.municipality},{" "}
                      {order.address?.locality}
                    </span>{" "}
                    <span>Código postal: {order.address?.postCode}</span>
                  </address>
                ) : (
                  <span className='text-muted-foreground'>
                    Dirección no especificada
                  </span>
                )}
              </>
            )}
          </div>
          <div>
            <Badge variant='secondary' className='text-nowrap'>
              {translateShippingMethod(order.shippingMethod)}
            </Badge>
          </div>
        </div>
        <Separator className='my-4' />
        <div className='flex justify-between text-sm'>
          <div className='font-semibold'>Estado de la orden</div>
          <Badge
            className={cn("", {
              "bg-amber-500 hover:bg-amber-500/80": order.status === "PENDING",
              "bg-sky-500 hover:bg-sky-500/80": order.status === "ACCEPTED",
              "bg-emerald-500 hover:bg-emerald-500/80":
                order.status === "COMPLETED",
              "bg-destructive hover:bg-destructive/80":
                order.status === "CANCELLED",
            })}
          >
            {translateOrderStatus(order.status)}
          </Badge>
        </div>
        <Separator className='my-4' />
        <div className='grid gap-3 text-sm'>
          <div className='font-semibold'>Información del pago</div>
          <dl className='grid gap-3'>
            <div className='flex items-center justify-between'>
              <dt className='flex items-center gap-1 text-muted-foreground'>
                {translatePaymentMethod(order.paymentMethod)}
              </dt>
            </div>
          </dl>
        </div>
      </ScrollArea>
    </div>
  )
}

export default CustomerViewOrderDetail
