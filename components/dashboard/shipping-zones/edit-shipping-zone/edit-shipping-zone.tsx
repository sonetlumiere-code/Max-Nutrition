"use client"

import { editShippingZone } from "@/actions/shipping-zones/edit-shipping-zone"
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
import { toast } from "@/components/ui/use-toast"
import { shippingZoneSchema } from "@/lib/validations/shipping-zone-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShippingZone } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

type ShippingZoneSchema = z.infer<typeof shippingZoneSchema>

type EditShippingZoneProps = {
  shippingZone: ShippingZone
}

const EditShippingZone = ({ shippingZone }: EditShippingZoneProps) => {
  const router = useRouter()

  const form = useForm<ShippingZoneSchema>({
    resolver: zodResolver(shippingZoneSchema),
    defaultValues: shippingZone,
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: ShippingZoneSchema) => {
    const res = await editShippingZone({ id: shippingZone.id, values: data })

    if (res.success) {
      router.push("/shipping-zones")
      toast({
        title: "Zona de envío actualizada",
        description: "La zona de envío se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando zona de envío",
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
                control={control}
                name='zone'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Zona de envío'
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='cost'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo (AR$)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.1'
                        placeholder='Costo en pesos'
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
              Editar zona de envío
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default EditShippingZone
