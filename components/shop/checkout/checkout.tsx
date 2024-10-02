/* eslint-disable @next/next/no-img-element */
"use client"

import { useCreateOrder } from "@/hooks/use-create-order"
import { PopulatedCustomer } from "@/types/types"
import { Session } from "next-auth"
import { useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CreditCard, DollarSign } from "lucide-react"
import { Icons } from "@/components/icons"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCart } from "@/components/cart-provider"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ShippingMethod } from "@prisma/client"

type CheckoutProps = {
  session: Session | null
  customer: PopulatedCustomer | null
}

const Checkout = ({ session, customer }: CheckoutProps) => {
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethod>("Delivery")
  const [addressId, setAddressId] = useState("")
  const { items } = useCart()
  const { isLoading, placeOrder } = useCreateOrder(session, customer, addressId)

  return (
    <div className='flex flex-col gap-8 max-w-4xl mx-auto'>
      <div className='grid gap-6'>
        <div>
          <h1 className='text-xl md:text-2xl font-bold'>Checkout</h1>
          <p className='text-muted-foreground'>
            Revisa tu orden y completa el checkout.
          </p>
        </div>
        <div className='grid gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Resumen del pedido</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='hidden md:table-cell'></TableHead>
                    <TableHead>Vianda</TableHead>
                    <TableHead className='hidden md:table-cell'>
                      Precio
                    </TableHead>
                    <TableHead className='hidden md:table-cell'>
                      Con/Sin sal
                    </TableHead>
                    <TableHead className='text-end'>Cantidad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className='hidden md:table-cell'>
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
                      <TableCell className='hidden md:table-cell'>
                        ${item.product?.price}
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        {item.variation.withSalt ? (
                          <Badge variant='secondary'>Con sal</Badge>
                        ) : (
                          <Badge variant='secondary'>Sin sal</Badge>
                        )}
                      </TableCell>
                      <TableCell className='text-end'>
                        x {item.quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Método de envío</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={shippingMethod}
                onValueChange={(value) =>
                  setShippingMethod(value as ShippingMethod)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Método de envío' />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ShippingMethod).map((method) => (
                    <SelectItem key={method} value={method}>
                      {method === "TakeAway"
                        ? "Retiro por sucursal"
                        : "Delivery"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {shippingMethod === "Delivery" && (
            <>
              {customer?.address?.length === 0 ? (
                <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6'>
                  <div className='flex flex-col items-center gap-1 text-center'>
                    <h3 className='text-base md:text-xl font-bold tracking-tight'>
                      Todavía no tenés ninguna dirección registrada.
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      Registrá tu dirección a continuación.
                    </p>

                    <Button className='mt-4' asChild>
                      <Link href='/customer-info'>
                        <Icons.circlePlus className='mr-2 h-4 w-4' />
                        Actualizar mis datos
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-xl'>
                      Dirección de envío
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select onValueChange={setAddressId} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder='Selecciona tu dirección' />
                      </SelectTrigger>
                      <SelectContent>
                        {customer?.address?.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.label} ({a.address})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Metodo de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4'>
                <RadioGroup
                  defaultValue='card'
                  className='grid grid-cols-2 gap-4'
                >
                  <div>
                    <RadioGroupItem
                      value='card'
                      id='card'
                      className='peer sr-only'
                    />
                    <Label
                      htmlFor='card'
                      className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                    >
                      <CreditCard className='mb-3 h-6 w-6' />
                      Mercado Pago
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value='cash'
                      id='cash'
                      className='peer sr-only'
                    />
                    <Label
                      htmlFor='cash'
                      className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                    >
                      <DollarSign className='mb-3 h-6 w-6' />
                      Efectivo
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Total del pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-2'>
              <div className='flex items-center justify-between text-sm'>
                <span>Subtotal</span>
                <span>$31.97</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span>Costo de envio</span>
                <span>$2.56</span>
              </div>
              <Separator />
              <div className='flex items-center justify-between font-bold'>
                <span>Total</span>
                <span>$34.53</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={placeOrder} className='ml-auto'>
              {isLoading && <Icons.spinner className='w-4 h-4 animate-spin' />}
              Realizar pedido
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Checkout
