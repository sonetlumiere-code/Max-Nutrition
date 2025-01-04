"use client"

import { editShippingSettings } from "@/actions/shipping-settings/edit-shipping-settings"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { translateShippingMethod } from "@/helpers/helpers"
import { shippingSettingsSchema } from "@/lib/validations/shipping-settings-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShippingMethod, ShippingSettings } from "@prisma/client"
import { useForm } from "react-hook-form"
import { z } from "zod"

type ShippingSettingsSchema = z.infer<typeof shippingSettingsSchema>

type EditShippingSettingsProps = {
  shippingSettings: ShippingSettings
}

const EditShippingSettings = ({
  shippingSettings,
}: EditShippingSettingsProps) => {
  const form = useForm<ShippingSettingsSchema>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: shippingSettings,
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: ShippingSettingsSchema) => {
    const res = await editShippingSettings({
      id: shippingSettings.id,
      values: data,
    })

    if (res.success) {
      toast({
        title: "Configuración de envíos actualizada",
        description: "La configuración de envíos se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error configurando envíos.",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Configuración de envíos</CardTitle>
            <CardDescription>Configura tus envíos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6'>
              <FormField
                control={form.control}
                name='allowedShippingMethods'
                render={() => (
                  <FormItem>
                    <div className='mb-4'>
                      <FormLabel>Métodos de envío habilitados</FormLabel>
                    </div>
                    {Object.values(ShippingMethod).map((method) => (
                      <FormField
                        key={method}
                        control={form.control}
                        name='allowedShippingMethods'
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={method}
                              className='flex flex-row items-start space-x-3 space-y-0'
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(method)}
                                  disabled={isSubmitting}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, method])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== method
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className='font-normal'>
                                {translateShippingMethod(method)}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='minProductsQuantityForDelivery'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cantidad de productos requerida para habilitar envíos
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='1'
                        placeholder='Precio en pesos'
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Guardar
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default EditShippingSettings
