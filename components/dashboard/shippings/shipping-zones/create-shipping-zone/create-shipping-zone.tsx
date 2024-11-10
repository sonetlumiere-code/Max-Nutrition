"use client"

import { createShippingZone } from "@/actions/shipping-zones/create-shipping-zone"
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
import { shippingZoneSchema } from "@/lib/validations/shipping-zone-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
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
import { Locality, Municipality, Province } from "@/types/types"
import { toast } from "@/components/ui/use-toast"
import { useMemo } from "react"

type ShippingZoneSchema = z.infer<typeof shippingZoneSchema>

const apiGeoRef = process.env.NEXT_PUBLIC_API_GEOREF

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const CreateShippingZone = () => {
  const router = useRouter()
  const form = useForm<ShippingZoneSchema>({
    resolver: zodResolver(shippingZoneSchema),
    defaultValues: {
      province: "",
      municipality: "",
      locality: "",
      cost: 0,
      isActive: true,
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
    const res = await createShippingZone(data)

    if (res.success) {
      router.push("/shippings")
      toast({
        title: "Nueva zona de envío creada",
        description: "La zona de envío ha sido creada correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error creando zona de envío",
        description: res.error,
      })
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
          <Card className='max-w-screen-md'>
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
            <CardFooter>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting && (
                  <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
                )}
                Agregar zona de envío
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </>
  )
}

export default CreateShippingZone
