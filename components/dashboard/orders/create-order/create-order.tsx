"use client"

import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { orderSchema, OrderSchema } from "@/lib/validations/order-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardDescription,
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
  PopulatedCategory,
  PopulatedCustomer,
  PopulatedShopSettings,
} from "@/types/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PaymentMethod, ShippingMethod } from "@prisma/client"
import {
  translateAddressLabel,
  translateShippingMethod,
} from "@/helpers/helpers"
import { usePromotion } from "@/hooks/use-promotion"
import PaymentMethodField from "@/components/shared/payment-method-field"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import SelectedAddressInfo from "@/components/shared/selected-address-info"
import useSWR from "swr"
import { getShippingZone } from "@/data/shipping-zones"
import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import Summary from "@/components/shared/summary"
import { createOrder } from "@/actions/orders/create-order"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

type CreateOrderProps = {
  categories: PopulatedCategory[]
  customers: PopulatedCustomer[]
  shopSettings: PopulatedShopSettings
}

const CreateOrder = ({
  categories,
  customers,
  shopSettings,
}: CreateOrderProps) => {
  const router = useRouter()

  const { shippingSettings, allowedPaymentMethods } = shopSettings

  // const { promotions, appliedPromotions, isLoadingPromotions } = usePromotion()

  // console.log({ appliedPromotions })

  const form = useForm<OrderSchema>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      origin: "DASHBOARD" as const,
      customerId: "",
      paymentMethod: PaymentMethod.CASH,
      shippingMethod: ShippingMethod.DELIVERY,
      items: [],
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const customerId = watch("customerId")
  const shippingMethod = watch("shippingMethod")
  const customerAddressId = watch("customerAddressId")

  const customer = customers?.find((c) => c.id === customerId)
  const selectedAddress = customer?.address?.find(
    (a) => a.id === customerAddressId
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

  const products = useMemo(
    () => categories.flatMap((category) => category.products),
    [categories]
  )

  const placeOrder = async (data: OrderSchema) => {
    console.log(data)

    if (selectedAddress && !shippingZone) {
      toast({
        variant: "destructive",
        title: "Zona de envío no válida",
        description: `Envíos a ${selectedAddress?.locality} no disponibles.`,
      })
      return
    }

    const res = await createOrder({ values: data, sendEmail: false })

    console.log(res)
    if (res.success) {
      toast({
        title: "Pedido creado",
        description: "Pedido creado correctamente.",
      })
      router.replace("/orders")
    } else if (res.error) {
      toast({
        variant: "destructive",
        title: "Error creando pedido",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(placeOrder)} className='grid gap-4'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold text-lg'>Crear pedido</h2>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            )}
            Crear pedido
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
          <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Cliente</CardTitle>
                <CardDescription>Cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name='customerId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          setValue("customerAddressId", "")
                        }}
                        defaultValue={field.value || ""}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecciona un cliente' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              <p>{customer.name}</p>
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

            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Productos</CardTitle>
                <CardDescription>Productos</CardDescription>
              </CardHeader>
              <CardContent>
                <fieldset className='border p-5 rounded-md'>
                  <legend>
                    <FormLabel className='mx-2'>Productos</FormLabel>
                  </legend>
                  <div className='space-y-3'>
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className='flex justify-between gap-2'
                      >
                        <FormField
                          control={control}
                          name={`items.${index}.productId`}
                          render={({ field }) => (
                            <FormItem className='flex flex-col w-2/5'>
                              <FormLabel>Producto</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder='Selecciona un producto' />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(({ id, name }) => (
                                    <SelectItem key={id} value={id}>
                                      <p>{name}</p>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`items.${index}.variation.withSalt`}
                          render={({ field }) => (
                            <FormItem className='flex flex-col w-1/5'>
                              <FormLabel>Con/Sin Sal</FormLabel>
                              <FormControl>
                                <Select
                                  onValueChange={(value) =>
                                    field.onChange(value === "true")
                                  }
                                  value={field.value ? "true" : "false"}
                                  disabled={isSubmitting}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Con/Sin sal' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value='true'>
                                      <p>Con sal</p>
                                    </SelectItem>
                                    <SelectItem value='false'>
                                      <p>Sin sal</p>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem className='flex flex-col w-1/5'>
                              <FormLabel>Cantidad</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  min={0}
                                  step={1}
                                  placeholder='Cantidad'
                                  disabled={isSubmitting}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='flex items-end justify-between'>
                          <Button
                            type='button'
                            size='icon'
                            variant='ghost'
                            onClick={() => remove(index)}
                            disabled={isSubmitting || fields.length === 1}
                          >
                            <Icons.x className='w-3 h-3' />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <Button
                      type='button'
                      variant='ghost'
                      onClick={() =>
                        append({
                          productId: "",
                          quantity: 1,
                          variation: { withSalt: true },
                        })
                      }
                      disabled={isSubmitting}
                    >
                      <Icons.plus className='w-4 h-4 mr-1' />
                      <small>Agregar Producto</small>
                    </Button>
                  </div>
                </fieldset>
              </CardContent>
              <CardFooter>
                {errors.items?.message && (
                  <div className='text-destructive text-sm'>
                    {errors.items.message}
                  </div>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Promociones</CardTitle>
                <CardDescription>Promociones</CardDescription>
              </CardHeader>
              <CardContent>content</CardContent>
            </Card>
          </div>

          <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Método de pago</CardTitle>
                <CardDescription>Método de pago</CardDescription>
              </CardHeader>
              <CardContent>
                <PaymentMethodField
                  control={control}
                  allowedPaymentMethods={allowedPaymentMethods}
                  isSubmitting={isSubmitting}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Método de envío</CardTitle>
                <CardDescription>Método de envío</CardDescription>
              </CardHeader>
              <CardContent>
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
                              // const isDisabled =
                              //   appliedPromotions.length > 0 &&
                              //   !appliedPromotions.every((promotion) =>
                              //     promotion.allowedShippingMethods.includes(
                              //       method
                              //     )
                              //   )
                              return (
                                <SelectItem
                                  key={method}
                                  value={method}
                                  // disabled={isDisabled}
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
            </Card>

            {shippingMethod === ShippingMethod.DELIVERY && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-xl'>Dirección</CardTitle>
                  <CardDescription>Dirección del cliente</CardDescription>
                </CardHeader>
                <CardContent>
                  {customerId ? (
                    <>
                      {customer?.address && customer.address.length > 0 ? (
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
                      ) : (
                        <Alert>
                          <Icons.circleAlert className='h-4 w-4' />
                          <AlertTitle className='leading-5'>
                            Cliente sin dirección
                          </AlertTitle>
                          <AlertDescription className='leading-4'>
                            El cliente no tiene ninguna dirección registrada.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <Alert>
                      <Icons.circleAlert className='h-4 w-4' />
                      <AlertTitle className='leading-5'>
                        Selecciona al cliente
                      </AlertTitle>
                      <AlertDescription className='leading-4'>
                        Primero debes seleccionar al cliente para poder
                        seleccionar su dirección.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <SelectedAddressInfo
                    selectedAddress={selectedAddress}
                    shippingZone={shippingZone}
                    isValidatingShippingZone={isValidatingShippingZone}
                  />
                </CardFooter>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Total</CardTitle>
                <CardDescription>Total del pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <Summary shippingCost={shippingCost} />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateOrder
