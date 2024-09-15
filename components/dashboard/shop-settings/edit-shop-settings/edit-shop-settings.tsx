"use client"

import { editShopSettings } from "@/actions/shop-settings/edit-shop-settings"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { shopSettingsSchema } from "@/lib/validations/shop-settings-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShopSettings } from "@prisma/client"
import { useForm } from "react-hook-form"
import { z } from "zod"

type ShopSettingsSchema = z.infer<typeof shopSettingsSchema>

type EditShopSettingsProps = {
  shopSettings: ShopSettings
}

const EditShopSettings = ({ shopSettings }: EditShopSettingsProps) => {
  const form = useForm<ShopSettingsSchema>({
    resolver: zodResolver(shopSettingsSchema),
    defaultValues: shopSettings,
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: ShopSettingsSchema) => {
    const res = await editShopSettings({ values: data })

    if (res.success) {
      toast({
        title: "Configuración de tienda actualizada",
        description: "La configuración de tienda se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando configuración de tienda",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
        <Card className='max-w-screen-md'>
          <CardHeader></CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <FormField
                control={form.control}
                name='shipping'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel>Envíos</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        aria-readonly
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='takeAway'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel>Retiro por sucursal</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                        aria-readonly
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='minProductsQuantityForShipping'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Cantidad mínima de productos para habilitar envíos
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='1'
                        placeholder=''
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

export default EditShopSettings
