/* eslint-disable @next/next/no-img-element */
"use client"

import { PopulatedCustomer } from "@/types/types"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { CreditCard, DollarSign, ShoppingCart } from "lucide-react"
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
import { PaymentMethod, ShippingMethod, ShippingSettings } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { orderSchema } from "@/lib/validations/order-validation"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { createOrder } from "@/actions/orders/create-order"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { usePromotion } from "@/hooks/use-promotion"
import { Skeleton } from "@/components/ui/skeleton"
import {
  translatePaymentMethod,
  translateShippingMethod,
} from "@/helpers/helpers"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import CustomerCreateAddress from "../customer/info/address/create/customer-create-address"
import { ToastAction } from "@/components/ui/toast"

type OrderSchema = z.infer<typeof orderSchema>

type CheckoutProps = {
  customer: PopulatedCustomer | null
  shippingSettings: ShippingSettings | null
}

const Checkout = ({ customer, shippingSettings }: CheckoutProps) => {
  const { items, setOpen, clearCart } = useCart()

  const { appliedPromotion, isLoading, subtotalPrice, finalPrice } =
    usePromotion()
  const router = useRouter()

  useEffect(() => {
    if (!items.length) {
      router.replace("/shop")
    }
  }, [items, router])

  const form = useForm<OrderSchema>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: customer?.id,
      customerAddressId: "",
      paymentMethod: PaymentMethod.Cash,
      shippingMethod: ShippingMethod.Delivery,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        variation: item.variation,
      })),
    },
  })

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    watch,
    setValue,
  } = form

  useEffect(() => {
    setValue(
      "items",
      items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        variation: item.variation,
      }))
    )
  }, [items, setValue])

  const shippingMethod = watch("shippingMethod")

  const shippingCost = 0 // TO DO

  const placeOrder = async (data: OrderSchema) => {
    const res = await createOrder(data)

    if (res.success) {
      clearCart()
      toast({
        title: "Pedido creado",
        description: "Tu pedido se ha creado correctamente.",
        action: (
          <ToastAction altText='Ver pedidos'>
            <Link href='/customer-orders-history'>Ver</Link>
          </ToastAction>
        ),
      })
      router.replace("/shop")
    } else if (res.error) {
      toast({
        variant: "destructive",
        title: "Error creando pedido",
        description: res.error,
      })
    }
  }

  useEffect(() => {
    if (shippingMethod === ShippingMethod.TakeAway) {
      setValue("customerAddressId", "")
    }
  }, [shippingMethod, setValue])

  const isValidMinQuantity = useMemo(() => {
    const totalProductsQuantity = items.reduce(
      (acc, curr) => acc + curr.quantity,
      0
    )

    return (
      shippingMethod === ShippingMethod.Delivery &&
      shippingSettings &&
      shippingSettings.minProductsQuantityForDelivery > totalProductsQuantity
    )
  }, [shippingMethod, shippingSettings, items])

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(placeOrder)}>
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
                  <div className='space-between flex items-center'>
                    <div className='max-w-screen-sm'>
                      <CardTitle className='text-xl'>
                        Resumen del pedido
                      </CardTitle>
                    </div>
                    <div className='ml-auto'>
                      <Button
                        type='button'
                        onClick={() => setOpen(true)}
                        className='relative'
                        disabled={isSubmitting}
                      >
                        <Icons.pencil className='mr-2 w-4 h-4' /> Editar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='p-3 md:p-6 md:pt-0'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='hidden md:table-cell'></TableHead>
                        <TableHead>Vianda</TableHead>
                        <TableHead className='hidden md:table-cell'>
                          Precio
                        </TableHead>
                        <TableHead className='whitespace-nowrap'>
                          {/* Con/Sin sal */}
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
                          <TableCell className='whitespace-nowrap'>
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
                  <CardTitle className='text-xl'>Promoción</CardTitle>
                </CardHeader>
                <CardContent>
                  {appliedPromotion ? (
                    <Alert>
                      <Icons.badgePercent className='h-4 w-4' />
                      <AlertTitle>¡Promoción aplicada!</AlertTitle>
                      <AlertDescription>
                        <div className='flex flex-col text-sm text-muted-foreground'>
                          <span>{appliedPromotion.name}</span>
                          <span>{appliedPromotion.description}</span>
                          <span>
                            Métodos de pago habilitados:{" "}
                            {new Intl.ListFormat("es", {
                              style: "long",
                              type: "conjunction",
                            }).format(
                              appliedPromotion.allowedPaymentMethods.map(
                                translatePaymentMethod
                              )
                            )}
                            {"."}
                          </span>
                          <span>
                            Métodos de envío habilitados:{" "}
                            {new Intl.ListFormat("es", {
                              style: "long",
                              type: "conjunction",
                            }).format(
                              appliedPromotion.allowedShippingMethods.map(
                                translateShippingMethod
                              )
                            )}
                            {"."}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <Icons.circleAlert className='h-4 w-4' />
                      <AlertTitle>Sin promoción aplicada</AlertTitle>
                      <AlertDescription>
                        <AlertDescription>
                          Actualmente no hay promociones disponibles para tu
                          carrito. ¡Explora nuestras promociones para ahorrar en
                          tu próxima compra!
                        </AlertDescription>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {shippingSettings && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-xl'>Envío</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <FormField
                      control={control}
                      name={"shippingMethod"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Método de envío</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='' />
                            </SelectTrigger>
                            <SelectContent>
                              {shippingSettings?.allowedShippingMethods.map(
                                (method) => (
                                  <SelectItem
                                    key={method}
                                    value={method}
                                    disabled={
                                      appliedPromotion
                                        ? !appliedPromotion?.allowedShippingMethods.includes(
                                            method
                                          )
                                        : false
                                    }
                                  >
                                    {translateShippingMethod(method)}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isValidMinQuantity && (
                      <Alert variant='destructive'>
                        <Icons.circleAlert className='h-4 w-4' />
                        <AlertTitle className='leading-5'>
                          Agrega más productos para habilitar envío a domicilio.{" "}
                        </AlertTitle>
                        <AlertDescription className='leading-4'>
                          La cantidad mínima de productos para habilitar envío a
                          domicilio es{" "}
                          {shippingSettings?.minProductsQuantityForDelivery}.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {shippingMethod === ShippingMethod.Delivery && (
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

                        <CustomerCreateAddress customer={customer}>
                          <Button type='button' className='mt-4'>
                            Agregar dirección
                          </Button>
                        </CustomerCreateAddress>
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
                        <FormField
                          control={control}
                          name={"customerAddressId"}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dirección de envío</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue=''
                                disabled={isSubmitting}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='' />
                                </SelectTrigger>
                                <SelectContent>
                                  {customer?.address?.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                      {a.label} ({a.address})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className='text-xl'>Método de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name='paymentMethod'
                    render={({ field }) => (
                      <FormItem className='space-y-3'>
                        <FormLabel>Método de pago</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className='grid grid-cols-2 gap-4'
                            disabled={isSubmitting}
                          >
                            <div>
                              <RadioGroupItem
                                value={PaymentMethod.MercadoPago}
                                id={PaymentMethod.MercadoPago}
                                className='peer sr-only'
                                disabled={
                                  appliedPromotion
                                    ? !appliedPromotion?.allowedPaymentMethods.includes(
                                        PaymentMethod.MercadoPago
                                      )
                                    : false
                                }
                              />
                              <Label
                                htmlFor={PaymentMethod.MercadoPago}
                                className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                              >
                                <CreditCard className='mb-3 h-6 w-6' />
                                Mercado Pago
                              </Label>
                            </div>
                            <div>
                              <RadioGroupItem
                                value={PaymentMethod.Cash}
                                id={PaymentMethod.Cash}
                                className='peer sr-only'
                                disabled={
                                  appliedPromotion
                                    ? !appliedPromotion?.allowedPaymentMethods.includes(
                                        PaymentMethod.Cash
                                      )
                                    : false
                                }
                              />
                              <Label
                                htmlFor={PaymentMethod.Cash}
                                className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                              >
                                <DollarSign className='mb-3 h-6 w-6' />
                                Efectivo
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    {isLoading ? (
                      <Skeleton className='w-20 h-8' />
                    ) : (
                      <span>$ {subtotalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  {appliedPromotion && (
                    <div className='flex items-center justify-between text-sm'>
                      <span>Descuento ({appliedPromotion.name})</span>
                      {isLoading ? (
                        <Skeleton className='w-20 h-8' />
                      ) : appliedPromotion.discountType === "Fixed" ? (
                        <span className='text-destructive'>
                          - $ {appliedPromotion.discount.toFixed(2)}
                        </span>
                      ) : (
                        <span className='text-destructive'>
                          - {appliedPromotion.discount}%
                        </span>
                      )}
                    </div>
                  )}
                  <div className='flex items-center justify-between text-sm'>
                    <span>Costo de envío</span>
                    {isLoading ? (
                      <Skeleton className='w-20 h-8' />
                    ) : (
                      <span>$ {shippingCost.toFixed(2)}</span>
                    )}
                  </div>

                  <Separator />

                  <div className='flex items-center justify-between font-bold'>
                    <span>Total</span>
                    {isLoading ? (
                      <Skeleton className='w-20 h-6' />
                    ) : (
                      <span>$ {(finalPrice + shippingCost).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type='submit'
                  className='ml-auto'
                  disabled={
                    isSubmitting ||
                    isValidMinQuantity ||
                    (shippingMethod === "Delivery" &&
                      !customer?.address?.length)
                  }
                >
                  {isSubmitting && (
                    <Icons.spinner className='mr-2 w-4 h-4 animate-spin' />
                  )}
                  Realizar pedido
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default Checkout
