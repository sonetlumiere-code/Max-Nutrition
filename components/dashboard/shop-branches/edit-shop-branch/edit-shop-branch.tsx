"use client"

import { PopulatedShopBranch } from "@/types/types"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
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
import { toast } from "@/components/ui/use-toast"
import {
  ShopBranchSchema,
  shopBranchSchema,
} from "@/lib/validations/shop-branch-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Icons } from "@/components/icons"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import MunicipalitySelect from "@/components/municipality-select"
import LocalitySelect from "@/components/locality-select"
import AsyncSelectAddress from "@/components/async-search-address"
import { editShopBranch } from "@/actions/shop-branches/edit-shop-branch"
import { translateDayOfWeek } from "@/helpers/helpers"

type EditShopBranchProps = {
  shopBranch: PopulatedShopBranch
}

const provinces = ["Ciudad Autónoma de Buenos Aires", "Buenos Aires"] as const

const EditShopBranch = ({ shopBranch }: EditShopBranchProps) => {
  const router = useRouter()

  const form = useForm<ShopBranchSchema>({
    resolver: zodResolver(shopBranchSchema),
    defaultValues: {
      label: shopBranch.label,
      branchType: shopBranch.branchType,
      province: shopBranch.province,
      municipality: shopBranch.municipality,
      locality: shopBranch.locality,
      addressGeoRef: {
        altura: {
          unidad: null,
          valor: shopBranch.addressNumber,
        },
        calle: {
          categoria: undefined,
          id: "",
          nombre: shopBranch.addressStreet,
        },
        departamento: {
          id: "",
          nombre: shopBranch.municipality,
        },
        nomenclatura: "",
        provincia: {
          id: "",
          nombre: shopBranch.province,
        },
      },
      addressNumber: shopBranch.addressNumber,
      addressFloor: shopBranch.addressFloor || undefined,
      addressApartment: shopBranch.addressApartment || undefined,
      postCode: shopBranch.postCode || undefined,
      phoneNumber: shopBranch.phoneNumber || undefined,
      email: shopBranch.email || undefined,
      description: shopBranch.description || undefined,
      isActive: shopBranch.isActive,
      operationalHours: shopBranch.operationalHours?.map((hour) => ({
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

  const operationalHours = watch("operationalHours")

  const onSubmit = async (data: ShopBranchSchema) => {
    const res = await editShopBranch({ id: shopBranch.id, values: data })

    if (res.success) {
      router.push("/shop-branches")
      toast({
        title: "Sucursal actualizada",
        description: "La sucursal se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error creando sucursal",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold text-lg'>Editar Sucursal</h2>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            )}
            Editar Sucursal
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
          <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Detalle</CardTitle>
                <CardDescription>Detalle de la sucursal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <FormField
                    control={control}
                    name='label'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Etiqueta</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Etiqueta de la sucursal'
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
                            placeholder='Describa la sucursal'
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
                    name='phoneNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Teléfono de la sucursal'
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
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Email de la sucursal'
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
                              {provinces?.map((province) => (
                                <SelectItem key={province} value={province}>
                                  {province}
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
                        <FormLabel>
                          {watch("province") ===
                          "Ciudad Autónoma de Buenos Aires"
                            ? "Comuna"
                            : "Municipalidad"}
                        </FormLabel>
                        <FormControl>
                          <MunicipalitySelect
                            province={watch("province")}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value)
                              setValue("locality", "")
                            }}
                            isDisabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='locality'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watch("province") ===
                          "Ciudad Autónoma de Buenos Aires"
                            ? "Barrio"
                            : "Localidad"}
                        </FormLabel>
                        <FormControl>
                          <LocalitySelect
                            province={watch("province")}
                            municipality={watch("municipality")}
                            value={field.value}
                            onChange={field.onChange}
                            isDisabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='addressGeoRef'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calle/Avenida</FormLabel>
                        <FormControl>
                          <AsyncSelectAddress
                            selected={field.value}
                            onChange={field.onChange}
                            disabled={isSubmitting || !watch("municipality")}
                            province={watch("province")}
                            municipality={watch("municipality")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='addressNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='Numeración'
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
                  Configura la disponibilidad de la sucursal
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

export default EditShopBranch
