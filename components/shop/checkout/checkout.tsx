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
  FormControl,
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
import { toast } from "@/components/ui/use-toast"
import {
  translateAddressLabel,
  translateShippingMethod,
} from "@/helpers/helpers"
import { usePromotion } from "@/hooks/use-promotion"
import { OrderSchema, orderSchema } from "@/lib/validations/order-validation"
import {
  PopulatedCustomer,
  PopulatedShop,
  PopulatedShopBranch,
  PopulatedShopSettings,
} from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { PaymentMethod, ShippingMethod } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import useSWR from "swr"
import CheckoutListItems from "./checkout-list-items-table"
import AppliedPromotions from "@/components/shared/applied-promotions"
import PaymentMethodField from "@/components/shared/payment-method-field"
import Summary from "@/components/shared/summary"
import SelectedAddressInfo from "@/components/shared/selected-address-info"
import AllowedDelivery from "@/components/shared/allowed-delivery"
import ShopBranchField from "@/components/shared/shop-branch-field"
import LoadingOverlay from "@/components/loading-overlay"
import { Switch } from "@/components/ui/switch"
import CheckoutCustomerRequiredInfo from "./customer-required-info/checkout-customer-required-info"
import Link from "next/link"

const fetchShippingZone = async ({
  locality,
  isActive,
}: {
  locality: string
  isActive: boolean
}) => {
  const params = new URLSearchParams({
    isActive: String(isActive),
  })

  const res = await fetch(`/api/shipping-zone/${locality}?${params.toString()}`)

  if (!res.ok) {
    const error = await res.json()
    console.error("Failed to fetch shipping zone:", error.error)
    return null
  }

  return res.json()
}

type CheckoutProps = {
  customer: PopulatedCustomer
  shopSettings: PopulatedShopSettings
  shop: PopulatedShop
  shopBranches: PopulatedShopBranch[] | null
}

const Checkout = ({
  customer,
  shopSettings,
  shop,
  shopBranches,
}: CheckoutProps) => {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [isFulfilled, setIsFulfilled] = useState(false)
  const [withSalt, setWithSalt] = useState(true)
  const [isBottomVisible, setIsBottomVisible] = useState(false)
  const [openCustomerRequiredInfo, setOpenCustomerRequiredInfo] =
    useState(false)

  const totalSectionRef = useRef<HTMLDivElement>(null)

  const { shopCategory } = shop

  const { items, setOpen, clearCart } = useCart()
  const { promotions, appliedPromotions } = usePromotion({
    items,
    shopCategory,
  })
  const router = useRouter()

  const { shippingSettings, allowedPaymentMethods } = shopSettings

  useEffect(() => {
    if (!isFulfilled) {
      if (!items.length || !customer) {
        router.replace(`/${shop.key}`)
      }
    }
  }, [items, customer, router, isFulfilled, shop])

  const form = useForm<OrderSchema>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      origin: "SHOP" as const,
      customerAddressId: customer.addresses?.[0]?.id || "",
      paymentMethod: PaymentMethod.CASH,
      shippingMethod: ShippingMethod.DELIVERY,
      shopCategory,
      shopBranchId: shopBranches?.[0].id || "",
      items: [],
    },
  })

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isSubmitted, isValid },
    watch,
    getValues,
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
    () => customer?.addresses?.find((a) => a.id === customerAddressId),
    [customer?.addresses, customerAddressId]
  )

  const { data: shippingZone, isValidating: isValidatingShippingZone } = useSWR(
    shippingMethod === ShippingMethod.DELIVERY && selectedAddress?.locality
      ? [
          "shipping-zone",
          {
            locality: selectedAddress.locality,
            isActive: true,
          },
        ]
      : null,
    ([_, params]) => fetchShippingZone(params),
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

    setIsPlacingOrder(true)

    const res = await createOrder({
      values: data,
      sendEmail: true,
    })

    if (res.success) {
      setIsFulfilled(true)
      clearCart()
      toast({
        title: "Pedido realizado",
        description: "Tu pedido se ha realizado correctamente.",
      })
      router.push(`/order-confirmed/${res.order.id}`)
    } else if (res.error) {
      setIsPlacingOrder(false)
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBottomVisible(entry.isIntersecting)
      },
      { threshold: 0.5 }
    )

    const currentRef = totalSectionRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  const totalAmount =
    items.reduce((acc, item) => acc + item.product.price * item.quantity, 0) +
    shippingCost

  const handleWithSaltChange = (checked: boolean) => {
    setWithSalt(checked)
    const currentItems = getValues("items")
    const updatedItems = currentItems.map((item) => ({
      ...item,
      variation: { withSalt: checked },
    }))
    setValue("items", updatedItems)
  }

  return (
    <>
      {items.length > 0 && (
        <Form {...form}>
          <form onSubmit={handleSubmit(placeOrder)}>
            <div className='flex flex-col gap-8 max-w-4xl mx-auto pb-5'>
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
                      <div className='space-y-3'>
                        <CheckoutListItems />
                        {shopCategory === "FOOD" && (
                          <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                            <div className='space-y-0.5'>
                              <FormLabel>
                                {withSalt ? "Con sal" : "Sin sal"}
                              </FormLabel>
                            </div>
                            <FormControl>
                              <Switch
                                checked={withSalt}
                                onCheckedChange={handleWithSaltChange}
                                disabled={isSubmitting}
                                aria-readonly
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {promotions && promotions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className='text-xl'>Promociones</CardTitle>
                      </CardHeader>
                      <CardContent className='space-y-3'>
                        <AppliedPromotions
                          items={items}
                          shopCategory={shopCategory}
                        />
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
                                  <SelectValue placeholder='Selecciona el método de envío' />
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
                            shopBranches && (
                              <ShopBranchField
                                control={control}
                                branches={shopBranches}
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
                      {customer?.addresses?.length === 0 ? (
                        <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6'>
                          <div className='flex flex-col items-center gap-1 text-center'>
                            <h3 className='text-base md:text-xl font-bold tracking-tight'>
                              Todavía no tenés ninguna dirección registrada.
                            </h3>
                            <p className='text-sm text-muted-foreground mb-4'>
                              Registrá tu dirección a continuación.
                            </p>

                            <Button asChild>
                              <Link
                                href={`/${shop.key}/customer-info/create-address?redirectTo=/${shop.key}/checkout`}
                              >
                                Agregar dirección
                              </Link>
                            </Button>
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
                                  <Button asChild>
                                    <Link
                                      href={`/${shop.key}/customer-info/create-address?redirectTo=/${shop.key}/checkout`}
                                    >
                                      Agregar dirección
                                    </Link>
                                  </Button>
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
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isSubmitting}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder='Selecciona tu dirección' />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {customer?.addresses?.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                          {translateAddressLabel(a.label)}
                                          {` (${a.addressStreet} ${a.addressNumber})`}
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
                        shopCategory={shopCategory}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className='grid gap-6'>
                <Card ref={totalSectionRef}>
                  <CardHeader>
                    <CardTitle className='text-xl'>Total del pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Summary
                      items={items}
                      shippingCost={shippingCost}
                      shopCategory={shopCategory}
                    />
                  </CardContent>
                  <CardFooter>
                    {!customer.phone || customer.birthdate === null ? (
                      <Button
                        type='button'
                        onClick={() => setOpenCustomerRequiredInfo(true)}
                        className='ml-auto'
                        disabled={
                          isSubmitting ||
                          (shippingMethod === "DELIVERY" &&
                            !isValidMinQuantity) ||
                          (shippingMethod === "DELIVERY" &&
                            !customer?.addresses?.length) ||
                          (isSubmitted && !isValid)
                        }
                      >
                        Realizar pedido
                      </Button>
                    ) : (
                      <Button
                        type='submit'
                        className='ml-auto'
                        disabled={
                          isSubmitting ||
                          (shippingMethod === "DELIVERY" &&
                            !isValidMinQuantity) ||
                          (shippingMethod === "DELIVERY" &&
                            !customer?.addresses?.length) ||
                          (isSubmitted && !isValid)
                        }
                      >
                        {isSubmitting && (
                          <Icons.spinner className='mr-2 w-4 h-4 animate-spin' />
                        )}
                        Realizar pedido
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </div>

            {!isBottomVisible && (
              <div className='fixed bottom-0 left-0 right-0 bg-background border-t shadow-md z-10 py-3'>
                <div className='max-w-3xl mx-auto px-4 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>
                      Total:
                    </span>
                    <span className='text-lg font-bold'>
                      ${Math.round(totalAmount)}
                    </span>
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    type='button'
                    onClick={() =>
                      totalSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                      })
                    }
                  >
                    <Icons.arrowDown className='h-4 w-4 mr-2' />
                    Ver detalles
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      )}

      {isPlacingOrder && <LoadingOverlay message='Procesando tu pedido...' />}

      {openCustomerRequiredInfo && (
        <CheckoutCustomerRequiredInfo
          customer={customer}
          open={openCustomerRequiredInfo}
          setOpen={setOpenCustomerRequiredInfo}
          placeOrder={handleSubmit(placeOrder)}
        />
      )}
    </>
  )
}

export default Checkout
