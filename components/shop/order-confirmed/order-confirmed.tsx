import Image from "next/image"
import Link from "next/link"
import { CheckCircle, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { PopulatedOrder } from "@/types/types"

interface OrderConfirmedProps {
  order: PopulatedOrder
}

export default function OrderConfirmed({ order }: OrderConfirmedProps) {
  return (
    <div className='mx-auto min-h-[80dvh]'>
      <Card className='w-full mx-auto'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-4'>
            <CheckCircle className='h-12 w-12 text-green-500' />
          </div>
          <CardTitle className='text-2xl font-bold'>
            ¡Pedido Realizado con Éxito!
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='text-center text-muted-foreground'>
            <p>
              Gracias por tu compra. Tu pedido ha sido recibido y está siendo
              procesado.
            </p>
            <p className='font-semibold mt-2'>Número de Pedido: #{order.id}</p>
            <Badge className='mt-2'>
              {order.status === "PENDING" && "Pendiente"}
              {order.status === "ACCEPTED" && "Aceptado"}
              {order.status === "COMPLETED" && "Completado"}
              {order.status === "CANCELLED" && "Cancelado"}
            </Badge>
          </div>

          <Separator />

          <div className='space-y-2'>
            <h3 className='font-semibold'>Resumen del Pedido:</h3>
            {order.items?.map((item: any, index: number) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex items-center space-x-4'>
                  <div className='relative h-16 w-16'>
                    <Image
                      src={
                        item.product.image
                          ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${item.product.image}`
                          : "/img/no-image.jpg"
                      }
                      alt={item.product.name}
                      fill
                      className='rounded-md object-cover'
                    />
                  </div>
                  <div>
                    <p className='font-medium'>{item.product.name}</p>
                    <Badge variant='secondary' className='mt-1'>
                      {item.withSalt ? "Con sal" : "Sin sal"}
                    </Badge>
                    <p className='text-sm text-muted-foreground mt-1'>
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className='font-medium'>
                  ${item.product.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <Separator />

          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Subtotal</span>
              <span>${order.subtotal}</span>
            </div>

            {order.appliedPromotions && order.appliedPromotions.length > 0 && (
              <ul>
                {order.appliedPromotions.map((appliedPromotion, index) => (
                  <li key={index} className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>
                      {appliedPromotion.promotionName} (x
                      {appliedPromotion.appliedTimes || 1})
                    </span>
                    <span className='text-destructive'>
                      {appliedPromotion.promotionDiscountType ===
                      "PERCENTAGE" ? (
                        <>
                          -{appliedPromotion.promotionDiscount}% (-$
                          {(
                            ((order.subtotal || 0) *
                              (appliedPromotion.promotionDiscount || 0)) /
                            100
                          ).toFixed(2)}
                          )
                        </>
                      ) : appliedPromotion.promotionDiscountType === "FIXED" ? (
                        <>
                          -$
                          {(
                            (appliedPromotion.promotionDiscount || 0) *
                            (appliedPromotion.appliedTimes || 1)
                          ).toFixed(2)}
                        </>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Envío</span>
              <span>${order.shippingCost || 0}</span>
            </div>

            <div className='flex justify-between font-bold'>
              <span>Total</span>
              <span>${order.total}</span>
            </div>
          </div>

          <Separator />

          <div className='space-y-2'>
            <h3 className='font-semibold'>Detalles de Envío:</h3>
            <div className='flex items-center space-x-2 text-muted-foreground'>
              <Truck className='h-5 w-5' />
              <p>
                {order.shippingMethod === "DELIVERY"
                  ? "Envío a domicilio"
                  : "Retiro en local"}
              </p>
            </div>
            {order.shippingMethod === "DELIVERY" && order.address && (
              <p className='text-sm text-muted-foreground'>
                {order.address.addressStreet} {order.address.addressNumber}{" "}
                {order.address.addressFloor || ""}{" "}
                {order.address.addressApartment}
                <br />
                {order.address.locality}, {order.address.municipality},{" "}
                {order.address.province}
                <br />
                Código postal: {order.address.postCode}
              </p>
            )}
          </div>

          <Separator />

          <div className='space-y-2'>
            <h3 className='font-semibold'>Método de Pago:</h3>
            <p className='text-muted-foreground'>
              {order.paymentMethod === "CASH" && "Efectivo"}
              {order.paymentMethod === "CREDIT_CARD" && "Tarjeta de crédito"}
              {order.paymentMethod === "DEBIT_CARD" && "Tarjeta de débito"}
              {order.paymentMethod === "BANK_TRANSFER" &&
                "Transferencia bancaria"}
              {order.paymentMethod === "MERCADO_PAGO" && "Mercado Pago"}
            </p>
          </div>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-x-4 sm:space-y-0'>
          <Button asChild className='w-full sm:w-auto'>
            <Link href='/customer-orders-history'>Ver Mis Pedidos</Link>
          </Button>
          <Button asChild variant='outline' className='w-full sm:w-auto'>
            <Link href='/shop'>Seguir Comprando</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
