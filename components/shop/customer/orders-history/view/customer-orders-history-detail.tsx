/* eslint-disable @next/next/no-img-element */
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { translateOrderStatus } from "@/helpers/helpers"
import { cn } from "@/lib/utils"
import { PopulatedOrder } from "@/types/types"

type CustomerViewOrderDetailProps = {
  order: PopulatedOrder
}

const CustomerViewOrderDetail = ({ order }: CustomerViewOrderDetailProps) => {
  return (
    <div className='grid gap-3 p-4'>
      <div className='font-semibold'>Detalles de la orden</div>
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
          <span>${order.subtotal || order.total}</span>
        </li>
        {order.appliedPromotionName && order.subtotal && (
          <li className='flex items-center justify-between'>
            <span className='text-muted-foreground'>
              Descuento promocional ({order.appliedPromotionName})
            </span>
            <span className='text-destructive'>
              - ${order.subtotal - order.total}
            </span>
          </li>
        )}
        <li className='flex items-center justify-between font-semibold'>
          <span className='text-muted-foreground'>Total</span>
          <span>${order.total}</span>
        </li>
      </ul>
      <Separator className='my-2' />
      <div className='flex justify-between'>
        <div className='grid gap-3 text-sm'>
          <div className='font-semibold'>Información de entrega</div>
          {order.shippingMethod === "Delivery" && (
            <>
              {order.address ? (
                <address className='grid gap-0.5 not-italic text-muted-foreground'>
                  <span>
                    {order.address?.addressStreet}{" "}
                    {order.address?.addressNumber} {order.address.addressFloor}{" "}
                    {order.address.addressApartament}
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
        <div className='grid auto-rows-max gap-3'>
          <Badge variant='secondary'>
            {order.shippingMethod === "TakeAway" ? "Take Away" : "Delivery"}
          </Badge>
        </div>
      </div>
      <Separator className='my-4' />
      <div className='flex justify-between text-sm'>
        <div className='font-semibold'>Estado de la orden</div>
        <Badge
          className={cn("", {
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
      <div className='grid gap-3 text-sm'>
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
          </div>
        </dl>
      </div>
    </div>
  )
}

export default CustomerViewOrderDetail
