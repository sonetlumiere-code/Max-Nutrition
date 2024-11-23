"use client"

import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  translateOrderStatus,
  translateShippingMethod,
} from "@/helpers/helpers"
import { cn } from "@/lib/utils"
import { PopulatedOrder } from "@/types/types"
import OrderItemActions from "../../actions/order-item-actions"

type OrderItemDetailsProps = {
  order: PopulatedOrder
}

const OrderItemDetails = ({ order }: OrderItemDetailsProps) => {
  return (
    <Card className='overflow-hidden'>
      <CardHeader className='flex flex-row items-start bg-muted/50'>
        <div className='grid gap-0.5'>
          <CardTitle className='group flex items-center gap-2 text-lg'>
            <small>Orden {order.id}</small>
            <Button
              size='icon'
              variant='outline'
              className='h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100'
            >
              <Icons.copy className='h-3 w-3' />
              <span className='sr-only'>Copy Order ID</span>
            </Button>
          </CardTitle>
          <CardDescription>
            Fecha: {order.createdAt.toLocaleDateString("es-AR")}
          </CardDescription>
        </div>
        <div className='ml-auto flex items-center gap-1'>
          {/* <Button size='sm' variant='outline' className='h-8 gap-1'>
                <Truck className='h-3.5 w-3.5' />
                <span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
                  Seguir orden
                </span>
              </Button> */}
          <OrderItemActions order={order} />
        </div>
      </CardHeader>
      <CardContent className='p-6 text-sm'>
        <div className='grid gap-3'>
          <div className='font-semibold'>Detalles de la orden</div>
          <ul className='grid gap-3'>
            {order.items?.map((item) => (
              <li key={item.id} className='flex items-center justify-between'>
                <span className='text-muted-foreground'>
                  {item.product?.name}{" "}
                  {item.withSalt ? (
                    <Badge variant='secondary'>Con sal</Badge>
                  ) : (
                    <Badge variant='secondary'>Sin sal</Badge>
                  )}{" "}
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
              <span>${order.subtotal || order.total}</span>
            </li>

            {order.appliedPromotionName &&
              order.appliedPromotionDiscount &&
              order.subtotal && (
                <li className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>
                    Descuento promocional ({order.appliedPromotionName})
                  </span>
                  <span className='text-destructive'>
                    {order.appliedPromotionDiscountType === "Percentage" ? (
                      <>
                        -{order.appliedPromotionDiscount}% (-$
                        {(order.subtotal * order.appliedPromotionDiscount) /
                          100}
                        )
                      </>
                    ) : (
                      <>-${order.appliedPromotionDiscount}</>
                    )}
                  </span>
                </li>
              )}
            <li className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Costo de envío</span>
              <span>
                {order.shippingCost ? `$${order.shippingCost}` : "Gratis"}
              </span>
            </li>
            <li className='flex items-center justify-between font-semibold'>
              <span className='text-muted-foreground'>Total</span>
              <span>${order.total}</span>
            </li>
          </ul>
        </div>
        <Separator className='my-4' />
        <div className='flex justify-between'>
          <div className='grid gap-3'>
            <div className='font-semibold'>Información de entrega</div>
            {order.shippingMethod === "Delivery" && (
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
                  </address>
                ) : (
                  <span className='text-muted-foreground'>
                    Dirección no especificada
                  </span>
                )}
              </>
            )}
          </div>
          <div className='grid auto-rows-max gap-3'>
            <Badge variant='secondary'>
              {translateShippingMethod(order.shippingMethod)}
            </Badge>
          </div>
        </div>
        <Separator className='my-4' />
        <div className='flex justify-between'>
          <div className='font-semibold'>Estado de la orden</div>
          <Badge
            className={cn({
              "bg-amber-500 hover:bg-amber-500/80": order.status === "Pending",
              "bg-sky-500 hover:bg-sky-500/80": order.status === "Accepted",
              "bg-emerald-500 hover:bg-emerald-500/80":
                order.status === "Completed",
              "bg-destructive hover:bg-destructive/80":
                order.status === "Cancelled",
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
                {order.paymentMethod === "Cash"
                  ? "Efectivo"
                  : order.paymentMethod === "BankTransfer"
                  ? "Transferencia bancaria"
                  : order.paymentMethod === "MercadoPago"
                  ? "Mercado Pago"
                  : order.paymentMethod === "CreditCard"
                  ? "Tarjeta de crédito"
                  : order.paymentMethod === "DebitCard"
                  ? "Tarjeta de débito"
                  : ""}
              </dt>
              {/* <dd>**** **** **** 4532</dd> */}
            </div>
          </dl>
        </div>
      </CardContent>
      <CardFooter className='flex flex-row items-center border-t bg-muted/50 px-6 py-3'>
        <div className='text-xs text-muted-foreground'>
          Actualizado el{" "}
          <time>
            {order.updatedAt.toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
        {/* <Pagination className='ml-auto mr-0 w-auto'>
              <PaginationContent>
                <PaginationItem>
                  <Button size='icon' variant='outline' className='h-6 w-6'>
                    <ChevronLeft className='h-3.5 w-3.5' />
                    <span className='sr-only'>Previous Order</span>
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button size='icon' variant='outline' className='h-6 w-6'>
                    <ChevronRight className='h-3.5 w-3.5' />
                    <span className='sr-only'>Next Order</span>
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination> */}
      </CardFooter>
    </Card>
  )
}

export default OrderItemDetails
