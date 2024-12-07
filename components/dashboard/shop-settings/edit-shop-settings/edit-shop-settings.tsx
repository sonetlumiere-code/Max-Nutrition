"use client"

import { editSettings } from "@/actions/shop-settings/edit-shop-settings"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { shopSettingsSchema } from "@/lib/validations/shop-settings-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShopSettings } from "@prisma/client"
import { useForm } from "react-hook-form"
import { z } from "zod"

type SettingsSchema = z.infer<typeof shopSettingsSchema>

type EditShopSettingsProps = {
  settings: ShopSettings
}

const EditShopSettings = ({ settings }: EditShopSettingsProps) => {
  const form = useForm<SettingsSchema>({
    resolver: zodResolver(shopSettingsSchema),
    defaultValues: settings,
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: SettingsSchema) => {
    const res = await editSettings({ values: data })

    if (res.success) {
      toast({
        title: "Configuración actualizada",
        description: "La configuración se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando configuración",
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
            <div className='space-y-3'>Settings</div>
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
