import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  translateOrderStatus,
  translateShippingMethod,
} from "@/helpers/helpers"
import { cn } from "@/lib/utils"
import { PopulatedOrder } from "@/types/types"

type OrderInfoProps = {
  order: PopulatedOrder
}

const OrderItemInfo = ({ order }: OrderInfoProps) => {
  return (
    <div className='text-sm'>
      <div className='grid gap-3'>
        <div className='font-semibold'>Detalles de la orden</div>
        <ul className='grid gap-3'>
          {order.items?.map((item) => (
            <li key={item.id} className='flex items-center justify-between'>
              <span className='text-muted-foreground'>
                {item.product?.name}{" "}
                {order.shop?.shopCategory === "FOOD" && (
                  <>
                    {item.withSalt ? (
                      <Badge variant='secondary'>Con sal</Badge>
                    ) : (
                      <Badge variant='secondary'>Sin sal</Badge>
                    )}{" "}
                  </>
                )}
                x <span>{item.quantity}</span>
              </span>
              <span>${item.product?.price * item.quantity}</span>
            </li>
          ))}
        </ul>

        <Separator className='my-2' />
        <ul className='grid gap-3'>
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
      </div>
      <Separator className='my-4' />
      <div className='flex justify-between'>
        <div className='grid gap-3'>
          <div className='font-semibold'>Información de entrega</div>
          {order.shippingMethod === "DELIVERY" ? (
            <>
              {order.address ? (
                <address className='grid gap-0.5 not-italic text-muted-foreground'>
                  <span>
                    {order.address?.addressStreet}{" "}
                    {order.address?.addressNumber}{" "}
                    {order.address?.addressFloor || ""}{" "}
                    {order.address?.addressApartment}
                  </span>
                  <span>
                    {order.address?.province}, {order.address?.municipality},
                    {order.address?.locality}
                  </span>{" "}
                  <span>Código postal: {order.address?.postCode}</span>
                  {order.address.notes ? (
                    <span>Notas adicionales: {order.address.notes}</span>
                  ) : null}
                </address>
              ) : (
                <span className='text-muted-foreground'>
                  Dirección no especificada
                </span>
              )}
            </>
          ) : order.shippingMethod === "TAKE_AWAY" ? (
            <span className='text-muted-foreground'>
              {order.shopBranch?.label || "Sucursal no especificada"}
            </span>
          ) : null}
        </div>
        <div>
          <Badge variant='secondary' className='text-nowrap'>
            {translateShippingMethod(order.shippingMethod)}
          </Badge>
        </div>
      </div>
      <Separator className='my-4' />
      <div className='flex justify-between'>
        <div className='font-semibold'>Estado de la orden</div>
        <Badge
          className={cn({
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
      <div className='grid gap-3'>
        <div className='font-semibold'>Información del cliente</div>
        <dl className='grid gap-3'>
          <div className='flex items-center justify-between'>
            <dt className='text-muted-foreground'>Cliente</dt>
            <dd>{order.customer?.name}</dd>
          </div>
          <div className='flex items-center justify-between'>
            <dt className='text-muted-foreground'>Email</dt>
            <dd>
              <a href='mailto:'>{order.customer?.user?.email}</a>
            </dd>
          </div>
          <div className='flex items-center justify-between'>
            <dt className='text-muted-foreground'>Teléfono</dt>
            <dd>
              <a href='tel:'>{order.customer?.phone || "-"}</a>
            </dd>
          </div>
        </dl>
      </div>
      <Separator className='my-4' />
      <div className='grid gap-3'>
        <div className='font-semibold'>Información del pago</div>
        <dl className='grid gap-3'>
          <div className='flex items-center justify-between'>
            <dt className='flex items-center gap-1 text-muted-foreground'>
              {order.paymentMethod === "CASH"
                ? "Efectivo"
                : order.paymentMethod === "BANK_TRANSFER"
                ? "Transferencia bancaria"
                : order.paymentMethod === "MERCADO_PAGO"
                ? "Mercado Pago"
                : order.paymentMethod === "CREDIT_CARD"
                ? "Tarjeta de crédito"
                : order.paymentMethod === "DEBIT_CARD"
                ? "Tarjeta de débito"
                : ""}
            </dt>
            {/* <dd>**** **** **** 4532</dd> */}
          </div>
        </dl>
      </div>
    </div>
  )
}

export default OrderItemInfo
