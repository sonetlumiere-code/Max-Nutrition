"use client"

import { editSettings } from "@/actions/settings/edit-settings"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { settingsSchema } from "@/lib/validations/settings-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Settings } from "@prisma/client"
import { useForm } from "react-hook-form"
import { z } from "zod"

type SettingsSchema = z.infer<typeof settingsSchema>

type EditSettingsProps = {
  settings: Settings
}

const EditSettings = ({ settings }: EditSettingsProps) => {
  console.log(settings)

  const form = useForm<SettingsSchema>({
    resolver: zodResolver(settingsSchema),
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

export default EditSettings
