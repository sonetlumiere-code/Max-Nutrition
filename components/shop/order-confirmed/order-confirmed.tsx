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
    <div className='container mx-auto px-4 py-12 min-h-[80dvh]'>
      <Card className='w-full max-w-2xl mx-auto'>
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
              {order.status === "Pending" && "Pendiente"}
              {order.status === "Accepted" && "Aceptado"}
              {order.status === "Completed" && "Completado"}
              {order.status === "Cancelled" && "Cancelado"}
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

            {order.appliedPromotionName && (
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  Descuento ({order.appliedPromotionName})
                </span>
                <span className='text-destructive'>
                  {order.appliedPromotionDiscountType === "Percentage"
                    ? `-${order.appliedPromotionDiscount}% (-$${
                        ((order.subtotal ?? 0) * (order.appliedPromotionDiscount ?? 0)) / 100
                      })`
                    : `-$${order.appliedPromotionDiscount}`}
                </span>
              </div>
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
                {order.shippingMethod === "Delivery"
                  ? "Envío a domicilio"
                  : "Retiro en local"}
              </p>
            </div>
            {order.shippingMethod === "Delivery" && order.address && (
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
              {order.paymentMethod === "Cash" && "Efectivo"}
              {order.paymentMethod === "CreditCard" && "Tarjeta de crédito"}
              {order.paymentMethod === "DebitCard" && "Tarjeta de débito"}
              {order.paymentMethod === "BankTransfer" &&
                "Transferencia bancaria"}
              {order.paymentMethod === "MercadoPago" && "Mercado Pago"}
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
