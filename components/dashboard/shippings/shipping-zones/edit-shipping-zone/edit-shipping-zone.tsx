"use client"

import { editShippingZone } from "@/actions/shipping-zones/edit-shipping-zone"
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
import {
  ShippingZoneSchema,
  shippingZoneSchema,
} from "@/lib/validations/shipping-zone-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import useSWR from "swr"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Locality, Municipality, Province } from "@/types/georef-types"
import { useMemo } from "react"
import { PopulatedShippingZone } from "@/types/types"
import { translateDayOfWeek } from "@/helpers/helpers"

const apiGeoRef = process.env.NEXT_PUBLIC_API_GEOREF

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type EditShippingZoneProps = {
  shippingZone: PopulatedShippingZone
}

const EditShippingZone = ({ shippingZone }: EditShippingZoneProps) => {
  const router = useRouter()

  const form = useForm<ShippingZoneSchema>({
    resolver: zodResolver(shippingZoneSchema),
    defaultValues: {
      province: shippingZone.province,
      municipality: shippingZone.municipality,
      locality: shippingZone.locality,
      cost: shippingZone.cost,
      isActive: shippingZone.isActive,
      operationalHours: shippingZone.operationalHours?.map((hour) => ({
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
    setValue,
  } = form

  const selectedProvince = watch("province")
  const selectedMunicipality = watch("municipality")
  const operationalHours = watch("operationalHours")

  const { data: provinceData } = useSWR<{ provincias: Province[] }>(
    `${apiGeoRef}/provincias?campos=id,nombre`,
    fetcher
  )
  const provinces = useMemo(
    () =>
      provinceData?.provincias?.sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      ) ?? [],
    [provinceData]
  )

  const { data: municipalityData } = useSWR<{ municipios: Municipality[] }>(
    selectedProvince
      ? `${apiGeoRef}/municipios?provincia=${selectedProvince}&campos=id,nombre&max=135`
      : null,
    fetcher
  )
  const municipalities = useMemo(() => {
    return (
      municipalityData?.municipios?.sort((a, b) =>
        a.nombre.localeCompare(b.nombre, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      ) ?? []
    )
  }, [municipalityData])

  const { data: localityData } = useSWR<{ localidades: Locality[] }>(
    selectedMunicipality
      ? `${apiGeoRef}/localidades?municipio=${selectedMunicipality}&campos=id,nombre&max=1000`
      : null,
    fetcher
  )
  const localities = useMemo(
    () =>
      localityData?.localidades
        ?.filter(
          (locality, index, self) =>
            self.findIndex((m) => m.nombre === locality.nombre) === index
        )
        .sort((a, b) => a.nombre.localeCompare(b.nombre)) ?? [],
    [localityData]
  )

  const onSubmit = async (data: ShippingZoneSchema) => {
    const res = await editShippingZone({ id: shippingZone.id, values: data })

    if (res.success) {
      router.push("/shippings")
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
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold text-lg'>Editar Zona de Envío</h2>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            )}
            Editar Zona de Envío
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
          <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
            <Card>
              <CardHeader></CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <FormField
                    control={control}
                    name='province'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            setValue("municipality", "")
                            setValue("locality", "")
                          }}
                          defaultValue={field.value || ""}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Selecciona una provincia' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Provincias</SelectLabel>
                              {provinces.map((province) => (
                                <SelectItem
                                  key={province.id}
                                  value={province.nombre}
                                >
                                  {province.nombre}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='municipality'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Municipalidad</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            setValue("locality", "")
                          }}
                          defaultValue={field.value || ""}
                          disabled={
                            isSubmitting || !selectedProvince || !municipalities
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Selecciona una municipalidad' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Municipalidad</SelectLabel>
                              {municipalities?.map((municipality) => (
                                <SelectItem
                                  key={municipality.id}
                                  value={municipality.nombre}
                                >
                                  {municipality.nombre}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='locality'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localidad</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ""}
                          disabled={
                            isSubmitting || !selectedMunicipality || !localities
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Selecciona una localidad' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Localidad</SelectLabel>
                              {localities?.map((locality) => (
                                <SelectItem
                                  key={locality.id}
                                  value={locality.nombre}
                                >
                                  {locality.nombre}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
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
            </Card>
          </div>
          <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
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

export default EditShippingZone
