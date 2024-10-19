/* eslint-disable @next/next/no-img-element */

import { Separator } from "@/components/ui/separator"
import { Copy, MoreVertical, Truck } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PopulatedOrder } from "@/types/types"
import React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { translateOrderStatus } from "@/helpers/helpers"

type OrderItemDetails = {
  order: PopulatedOrder | null
}

const OrderItemDetails = ({ order }: OrderItemDetails) => {
  return (
    <>
      {order ? (
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
                  <Copy className='h-3 w-3' />
                  <span className='sr-only'>Copy Order ID</span>
                </Button>
              </CardTitle>
              <CardDescription>
                Fecha: {order.createdAt.toLocaleDateString()}
              </CardDescription>
            </div>
            <div className='ml-auto flex items-center gap-1'>
              {/* <Button size='sm' variant='outline' className='h-8 gap-1'>
                <Truck className='h-3.5 w-3.5' />
                <span className='lg:sr-only xl:not-sr-only xl:whitespace-nowrap'>
                  Seguir orden
                </span>
              </Button> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size='icon' variant='outline' className='h-8 w-8'>
                    <MoreVertical className='h-3.5 w-3.5' />
                    <span className='sr-only'>More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem>Exportar</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Eliminar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className='p-6 text-sm'>
            <div className='grid gap-3'>
              <div className='font-semibold'>Detalles de la orden</div>
              <ul className='grid gap-3'>
                {order.items?.map((item) => (
                  <li
                    key={item.id}
                    className='flex items-center justify-between'
                  >
                    <span className='text-muted-foreground'>
                      {item.product?.name}{" "}
                      {item.withSalt ? (
                        <Badge variant='secondary'>Con sal</Badge>
                      ) : (
                        <Badge variant='secondary'>Sin sal</Badge>
                      )}{" "}
                      x <span>2</span>
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
                    {order.items?.reduce(
                      (acc, curr) => acc + curr.product?.price * curr.quantity,
                      0
                    )}
                  </span>
                </li>
                {/* <li className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Costo de envío</span>
                  <span>
                    {order.shippingCost
                      ? `${order.shippingCost}`
                      : "Gratis"}
                  </span>
                </li> */}
                {/* <li className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Impuestos</span>
                  <span>$25.00</span>
                </li> */}
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
                        <span>{order.address?.address}</span>
                        <span>{order.address?.city}</span>{" "}
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
                  {order.shippingMethod === "TakeAway"
                    ? "Take Away"
                    : "Delivery"}
                </Badge>
              </div>
            </div>
            <Separator className='my-4' />
            <div className='flex justify-between'>
              <div className='font-semibold'>Estado de la orden</div>
              <Badge
                className={cn({
                  "bg-amber-500 hover:bg-amber-500/80":
                    order.status === "Pending",
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
      ) : null}
    </>
  )
}

export default OrderItemDetails
