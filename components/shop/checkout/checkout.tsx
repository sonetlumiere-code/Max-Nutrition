/* eslint-disable @next/next/no-img-element */
"use client"

import { createOrder } from "@/actions/orders/create-order"
import { useCart } from "@/components/cart-provider"
import { Icons } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { getShippingZone } from "@/data/shipping-zones"
import {
  translateAddressLabel,
  translatePaymentMethod,
  translateShippingMethod,
} from "@/helpers/helpers"
import { usePromotion } from "@/hooks/use-promotion"
import { orderSchema } from "@/lib/validations/order-validation"
import { PopulatedCustomer, PopulatedShopSettings } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { PaymentMethod, ShippingMethod } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import useSWR from "swr"
import { z } from "zod"
import CustomerCreateAddress from "../customer/info/address/create/customer-create-address"
import CheckoutShopBranch from "./checkout-shop-branch"

type OrderSchema = z.infer<typeof orderSchema>

type CheckoutProps = {
  customer: PopulatedCustomer | null
  shopSettings: PopulatedShopSettings | null
}

const Checkout = ({ customer, shopSettings }: CheckoutProps) => {
  const { items, setOpen, clearCart } = useCart()

  const {
    promotions,
    appliedPromotions,
    isLoadingPromotions,
    subtotalPrice,
    finalPrice,
  } = usePromotion()

  const router = useRouter()

  const shippingSettings = shopSettings?.shippingSettings
  const branches = shopSettings?.branches

  useEffect(() => {
    if (!items.length || !customer) {
      router.replace("/shop")
    }
  }, [items, customer, router])

  const form = useForm<OrderSchema>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerAddressId: "",
      paymentMethod: PaymentMethod.CASH,
      shippingMethod: ShippingMethod.DELIVERY,
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
    formState: { isSubmitting, isSubmitted, isValid },
    watch,
    setValue,
  } = form

  const shippingMethod = watch("shippingMethod")
  const customerAddressId = watch("customerAddressId")

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

  const selectedAddress = useMemo(
    () => customer?.address?.find((a) => a.id === customerAddressId),
    [customer?.address, customerAddressId]
  )

  const { data: shippingZone, isValidating: isValidatingShippingZone } = useSWR(
    shippingMethod === ShippingMethod.DELIVERY && selectedAddress?.locality
      ? [
          "shipping-zone",
          { locality: selectedAddress.locality, isActive: true },
        ]
      : null,
    ([_, params]) => getShippingZone({ where: params })
  )

  const shippingCost = shippingZone?.cost || 0

  const placeOrder = async (data: OrderSchema) => {
    if (selectedAddress && !shippingZone) {
      toast({
        variant: "destructive",
        title: "Zona de envío no válida",
        description: `Actualmente no realizamos envíos a ${selectedAddress?.locality}`,
      })
      return
    }

    const res = await createOrder(data)

    if (res.success) {
      clearCart()
      toast({
        title: "Pedido realizado",
        description: "Tu pedido se ha realizado correctamente.",
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

  const isValidMinQuantity = useMemo(() => {
    const totalProductsQuantity = items.reduce(
      (acc, curr) => acc + curr.quantity,
      0
    )

    return (
      shippingMethod === ShippingMethod.DELIVERY &&
      shippingSettings &&
      shippingSettings.minProductsQuantityForDelivery <= totalProductsQuantity
    )
  }, [shippingMethod, shippingSettings, items])

  return (
    <>
      {items.length > 0 && (
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
                            <TableHead>Vianda</TableHead>
                            <TableHead className='whitespace-nowrap'>
                              {/* Con/Sin sal */}
                            </TableHead>
                            <TableHead className='hidden md:table-cell'>
                              Precio
                            </TableHead>
                            <TableHead className='text-end'>Cantidad</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items?.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className='font-medium flex gap-3'>
                                <img
                                  src={
                                    item.product.image
                                      ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${item.product.image}`
                                      : "/img/no-image.jpg"
                                  }
                                  className='h-10 w-10 rounded-md'
                                  alt={item.product.name}
                                />
                                <p className='text-sm'>{item.product.name}</p>
                              </TableCell>
                              <TableCell className='whitespace-nowrap'>
                                {item.variation.withSalt ? (
                                  <Badge variant='secondary'>Con sal</Badge>
                                ) : (
                                  <Badge variant='secondary'>Sin sal</Badge>
                                )}
                              </TableCell>
                              <TableCell className='hidden md:table-cell'>
                                ${item.product?.price}
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

                  {promotions && promotions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-xl'>Promoción</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-3'>
                        {appliedPromotions.length > 0 ? (
                          appliedPromotions.map((promotion) => (
                            <Alert key={promotion.id}>
                              <Icons.badgePercent className='h-4 w-4' />
                              <AlertTitle>
                                <div className='flex justify-between'>
                                  <span>¡Promoción aplicada!</span>
                                  <span className='text-sm text-muted-foreground'>
                                    x {promotion.appliedTimes}
                                  </span>
                                </div>
                              </AlertTitle>
                              <AlertDescription>
                                <div className='flex flex-col text-sm text-muted-foreground'>
                                  <span>{promotion.name}</span>
                                  <span>{promotion.description}</span>
                                  <span>
                                    Métodos de pago habilitados:{" "}
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
                                  <span>
                                    Métodos de envío habilitados:{" "}
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
                              </AlertDescription>
                            </Alert>
                          ))
                        ) : (
                          <Alert>
                            <Icons.circleAlert className='h-4 w-4' />
                            <AlertTitle>Sin promoción aplicada</AlertTitle>
                            <AlertDescription>
                              Actualmente no hay promociones disponibles para tu
                              carrito. ¡Explora nuestras promociones para
                              ahorrar en tu próxima compra!
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  )}

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
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  if (value === ShippingMethod.TAKE_AWAY) {
                                    setValue("customerAddressId", "")
                                  }
                                }}
                                defaultValue={field.value}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='' />
                                </SelectTrigger>
                                <SelectContent>
                                  {shippingSettings?.allowedShippingMethods.map(
                                    (method) => {
                                      const isDisabled =
                                        appliedPromotions.length > 0 &&
                                        !appliedPromotions.every((promotion) =>
                                          promotion.allowedShippingMethods.includes(
                                            method
                                          )
                                        )

                                      return (
                                        <SelectItem
                                          key={method}
                                          value={method}
                                          disabled={isDisabled}
                                        >
                                          {translateShippingMethod(method)}
                                        </SelectItem>
                                      )
                                    }
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter>
                        {shippingMethod === ShippingMethod.DELIVERY && (
                          <>
                            {!isValidMinQuantity ? (
                              <Alert variant='destructive'>
                                <Icons.circleAlert className='h-4 w-4' />
                                <AlertTitle className='leading-5'>
                                  Agrega más productos para habilitar envío a
                                  domicilio.
                                </AlertTitle>
                                <AlertDescription className='leading-4'>
                                  La cantidad mínima de productos para habilitar
                                  envío a domicilio es{" "}
                                  {
                                    shippingSettings?.minProductsQuantityForDelivery
                                  }
                                  .
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <Alert variant='success'>
                                <Icons.circleCheck className='h-4 w-4' />
                                <AlertTitle className='leading-5'>
                                  Envío a domicilio habilitado
                                </AlertTitle>
                                <AlertDescription className='leading-4'>
                                  Alcanzaste la cantidad mínima de{" "}
                                  {
                                    shippingSettings?.minProductsQuantityForDelivery
                                  }{" "}
                                  productos para habilitar envío a domicilio.
                                </AlertDescription>
                              </Alert>
                            )}
                          </>
                        )}
                        {shippingMethod === ShippingMethod.TAKE_AWAY &&
                          branches && (
                            <div className='space-y-3 w-full'>
                              {branches.map((branch) => (
                                <CheckoutShopBranch
                                  key={branch.id}
                                  shopBranch={branch}
                                />
                              ))}
                            </div>
                          )}
                      </CardFooter>
                    </Card>
                  )}

                  {shippingMethod === ShippingMethod.DELIVERY && (
                    <>
                      {customer?.address?.length === 0 ? (
                        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6'>
                          <div className='flex flex-col items-center gap-1 text-center'>
                            <h3 className='text-base md:text-xl font-bold tracking-tight'>
                              Todavía no tenés ninguna dirección registrada.
                            </h3>
                            <p className='text-sm text-muted-foreground mb-4'>
                              Registrá tu dirección a continuación.
                            </p>

                            <CustomerCreateAddress>
                              <Button type='button'>Agregar dirección</Button>
                            </CustomerCreateAddress>
                          </div>
                        </div>
                      ) : (
                        <Card>
                          <CardHeader>
                            <div className='space-between flex items-center'>
                              <div className='max-w-screen-sm'>
                                <CardTitle className='text-xl'>
                                  Dirección
                                </CardTitle>
                              </div>
                              <div className='ml-auto'>
                                {customer && (
                                  <CustomerCreateAddress>
                                    <Button type='button'>
                                      Agregar dirección
                                    </Button>
                                  </CustomerCreateAddress>
                                )}
                              </div>
                            </div>
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
                                          {translateAddressLabel(a.label)}
                                          {/* ({a.addressStreet}{" "}
                                          {a.addressNumber} {a.addressFloor || ""}{" "}
                                          {a.addressApartment}) */}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </CardContent>
                          <CardFooter>
                            {selectedAddress && (
                              <div className='w-full text-sm space-y-3'>
                                <address className='grid gap-0.5 not-italic text-muted-foreground'>
                                  <span>
                                    {selectedAddress?.addressStreet}{" "}
                                    {selectedAddress?.addressNumber}{" "}
                                    {selectedAddress?.addressFloor || ""}{" "}
                                    {selectedAddress?.addressApartment}
                                  </span>
                                  <span>
                                    {selectedAddress?.province},{" "}
                                    {selectedAddress?.municipality},
                                    {selectedAddress?.locality}
                                  </span>{" "}
                                  <span>
                                    Código postal: {selectedAddress?.postCode}
                                  </span>
                                </address>

                                <Separator />

                                {isValidatingShippingZone ? (
                                  <Skeleton className='w-20 h-5' />
                                ) : shippingZone ? (
                                  <p className='text-muted-foreground'>
                                    Costo de envío a {shippingZone.locality}:{" "}
                                    <b>${shippingZone?.cost}</b>
                                  </p>
                                ) : (
                                  <p className='text-destructive'>
                                    Actualmente no realizamos envíos a{" "}
                                    {selectedAddress?.locality}
                                  </p>
                                )}
                              </div>
                            )}
                          </CardFooter>
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
                                    value={PaymentMethod.MERCADO_PAGO}
                                    id={PaymentMethod.MERCADO_PAGO}
                                    className='peer sr-only'
                                    disabled={
                                      appliedPromotions.length > 0 &&
                                      !appliedPromotions.every((promotion) =>
                                        promotion.allowedPaymentMethods.includes(
                                          PaymentMethod.MERCADO_PAGO
                                        )
                                      )
                                    }
                                  />

                                  <Label
                                    htmlFor={PaymentMethod.MERCADO_PAGO}
                                    className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                                  >
                                    <Icons.creditCard className='mb-3 h-6 w-6' />
                                    Mercado Pago
                                  </Label>
                                </div>
                                <div>
                                  <RadioGroupItem
                                    value={PaymentMethod.CASH}
                                    id={PaymentMethod.CASH}
                                    className='peer sr-only'
                                    disabled={
                                      appliedPromotions.length > 0 &&
                                      !appliedPromotions.every((promotion) =>
                                        promotion.allowedPaymentMethods.includes(
                                          PaymentMethod.CASH
                                        )
                                      )
                                    }
                                  />

                                  <Label
                                    htmlFor={PaymentMethod.CASH}
                                    className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                                  >
                                    <Icons.dollarSign className='mb-3 h-6 w-6' />
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
                        {isLoadingPromotions ? (
                          <Skeleton className='w-20 h-8' />
                        ) : (
                          <span>${subtotalPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {appliedPromotions.length > 0 &&
                        appliedPromotions.map((promotion) => {
                          const appliedDiscount =
                            promotion.discountType === "PERCENTAGE"
                              ? subtotalPrice * (promotion.discount / 100)
                              : promotion.discountType === "FIXED"
                              ? promotion.discount *
                                (promotion.appliedTimes || 1)
                              : 0

                          return (
                            <div
                              key={promotion.id}
                              className='flex items-center justify-between text-sm'
                            >
                              <span>
                                {promotion.name} (x{promotion.appliedTimes})
                              </span>
                              {isLoadingPromotions ? (
                                <Skeleton className='w-20 h-8' />
                              ) : promotion.discountType === "FIXED" ? (
                                <span className='text-destructive'>
                                  -${appliedDiscount.toFixed(2)}
                                </span>
                              ) : promotion.discountType === "PERCENTAGE" ? (
                                <span className='text-destructive'>
                                  -{promotion.discount}% (-$
                                  {appliedDiscount.toFixed(2)})
                                </span>
                              ) : null}
                            </div>
                          )
                        })}

                      <div className='flex items-center justify-between text-sm'>
                        <span>Costo de envío</span>
                        {isLoadingPromotions ? (
                          <Skeleton className='w-20 h-8' />
                        ) : (
                          <span>${shippingCost.toFixed(2)}</span>
                        )}
                      </div>

                      <Separator />

                      <div className='flex items-center justify-between font-bold'>
                        <span>Total</span>
                        {isLoadingPromotions ? (
                          <Skeleton className='w-20 h-6' />
                        ) : (
                          <span>${(finalPrice + shippingCost).toFixed(2)}</span>
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
                        (shippingMethod === "DELIVERY" &&
                          !isValidMinQuantity) ||
                        (shippingMethod === "DELIVERY" &&
                          !customer?.address?.length) ||
                        (isSubmitted && !isValid)
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
      )}
    </>
  )
}

export default Checkout
