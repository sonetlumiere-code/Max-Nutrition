"use client"

import { createOrder } from "@/actions/orders/create-order"
import { useCart } from "@/components/cart-provider"
import { Icons } from "@/components/icons"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { getShippingZone } from "@/data/shipping-zones"
import {
  translateAddressLabel,
  translateShippingMethod,
} from "@/helpers/helpers"
import { usePromotion } from "@/hooks/use-promotion"
import { OrderSchema, orderSchema } from "@/lib/validations/order-validation"
import { PopulatedCustomer, PopulatedShopSettings } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { PaymentMethod, ShippingMethod } from "@prisma/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import useSWR from "swr"
import CustomerCreateAddress from "../customer/info/address/create/customer-create-address"
import CheckoutListItems from "./checkout-list-items-table"
import AppliedPromotions from "../../shared/applied-promotions"
import PaymentMethodField from "@/components/shared/payment-method-field"
import Summary from "@/components/shared/summary"
import SelectedAddressInfo from "@/components/shared/selected-address-info"
import AllowedDelivery from "@/components/shared/allowed-delivery"
import ShopBranchField from "@/components/shared/shop-branch-field"

type CheckoutProps = {
  customer: PopulatedCustomer
  shopSettings: PopulatedShopSettings
}

const Checkout = ({ customer, shopSettings }: CheckoutProps) => {
  const { items, setOpen, clearCart } = useCart()
  const { promotions, appliedPromotions } = usePromotion({
    items,
  })
  const router = useRouter()

  const [isRedirecting, setIsRedirecting] = useState(false)
  const { branches, shippingSettings, allowedPaymentMethods } = shopSettings

  useEffect(() => {
    if (!items.length || !customer) {
      if (!isRedirecting) {
        router.replace("/shop")
      }
    }
  }, [items, customer, router, isRedirecting])

  const form = useForm<OrderSchema>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      origin: "SHOP" as const,
      customerAddressId: "",
      paymentMethod: PaymentMethod.CASH,
      shippingMethod: ShippingMethod.DELIVERY,
      shopBranchId: shopSettings.branches?.[0].id || "",
      items: [],
    },
  })

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isSubmitted, isValid },
    watch,
    setValue,
  } = form

  const { shippingMethod, customerAddressId } = watch()

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
    ([_, params]) => getShippingZone({ where: params }),
    { revalidateOnFocus: false }
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

    const res = await createOrder({ values: data, sendEmail: true })

    if (res.success) {
      setIsRedirecting(true)
      await router.replace(`/order-confirmed/${res.order.id}`)
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
    } else if (res.error) {
      toast({
        variant: "destructive",
        title: "Error creando pedido",
        description: res.error,
      })
    }
  }

  const isValidMinQuantity: boolean = (() => {
    const totalProductsQuantity = items.reduce(
      (acc, curr) => acc + curr.quantity,
      0
    )

    return (
      (shippingMethod === ShippingMethod.DELIVERY &&
        shippingSettings &&
        shippingSettings.minProductsQuantityForDelivery <=
          totalProductsQuantity) ||
      false
    )
  })()

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
                      <CheckoutListItems />
                    </CardContent>
                  </Card>

                  {promotions && promotions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-xl'>Promociones</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-3'>
                        <AppliedPromotions items={items} />
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
                        <div className='w-full'>
                          {shippingMethod === ShippingMethod.DELIVERY ? (
                            <AllowedDelivery
                              isValidMinQuantity={isValidMinQuantity}
                              minProductsQuantityForDelivery={
                                shippingSettings.minProductsQuantityForDelivery
                              }
                            />
                          ) : shippingMethod === ShippingMethod.TAKE_AWAY ? (
                            branches && (
                              <ShopBranchField
                                control={control}
                                branches={branches}
                                isSubmitting={isSubmitting}
                              />
                            )
                          ) : null}
                        </div>
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
                            <SelectedAddressInfo
                              selectedAddress={selectedAddress}
                              shippingZone={shippingZone}
                              isValidatingShippingZone={
                                isValidatingShippingZone
                              }
                            />
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
                      <PaymentMethodField
                        control={control}
                        items={items}
                        allowedPaymentMethods={allowedPaymentMethods}
                        isSubmitting={isSubmitting}
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
                    <Summary items={items} shippingCost={shippingCost} />
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
