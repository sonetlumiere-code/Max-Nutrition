"use client"

import { editShop } from "@/actions/shops/edit-shop"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { ShopSchema, shopSchema } from "@/lib/validations/shop-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { translateDayOfWeek } from "@/helpers/helpers"
import { PopulatedShop } from "@/types/types"

type EditShopProps = {
  shop: PopulatedShop
}

const EditShop = ({ shop }: EditShopProps) => {
  const router = useRouter()

  const form = useForm<ShopSchema>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      key: shop.key,
      name: shop.name,
      description: shop.description || "",
      title: shop.title || "",
      shopCategory: shop.shopCategory,
      isActive: shop.isActive,
      operationalHours: shop.operationalHours?.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        startTime: hour.startTime || undefined,
        endTime: hour.endTime || undefined,
      })),
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = form

  const operationalHours = watch("operationalHours")

  const onSubmit = async (data: ShopSchema) => {
    const res = await editShop({ id: shop.id, values: data })

    if (res.success) {
      router.push("/shops")
      toast({
        title: "Tienda actualizada",
        description: "La tienda se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando tienda.",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold text-lg'>Editar Tienda</h2>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            )}
            Editar Tienda
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
          <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Detalle</CardTitle>
                <CardDescription>Detalle de la tienda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <FormField
                    control={control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Nombre de la tienda'
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
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Descripción de la tienda'
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
            </Card>
          </div>
          <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Disponibilidad</CardTitle>
                <CardDescription>
                  Configura la disponibilidad de la tienda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='isActive'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                        <div className='space-y-0.5'>
                          <FormLabel>Activa</FormLabel>
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
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Horarios</CardTitle>
                <CardDescription>Horarios operacionales</CardDescription>
              </CardHeader>
              <CardContent>
                {operationalHours?.map((item, index) => (
                  <div
                    key={item.dayOfWeek}
                    className='grid grid-cols-3 gap-1 items-center space-y-1'
                  >
                    <FormLabel className='text-sm font-medium'>
                      {translateDayOfWeek(item.dayOfWeek)}
                    </FormLabel>

                    <FormField
                      control={control}
                      name={`operationalHours.${index}.startTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type='time'
                              className='block'
                              placeholder='HH:MM'
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
                      name={`operationalHours.${index}.endTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type='time'
                              className='block'
                              placeholder='HH:MM'
                              disabled={isSubmitting}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default EditShop
