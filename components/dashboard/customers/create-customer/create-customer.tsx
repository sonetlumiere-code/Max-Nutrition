"use client"

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
import {
  CustomerSchema,
  customerSchema,
} from "@/lib/validations/customer-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { createCustomer } from "@/actions/customer/create-customer"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CustomerAddressLabel } from "@prisma/client"
import { translateAddressLabel } from "@/helpers/helpers"
import MunicipalitySelect from "@/components/municipality-select"
import AsyncSelectAddress from "@/components/async-search-address"
import LocalitySelect from "@/components/locality-select"

const provinces = ["Ciudad Autónoma de Buenos Aires", "Buenos Aires"] as const

const CreateCustomer = () => {
  const router = useRouter()

  const form = useForm<CustomerSchema>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: 0,
      birthdate: undefined,
      addresses: [],
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
  })

  const onSubmit = async (data: CustomerSchema) => {
    const res = await createCustomer(data)

    if (res.success) {
      toast({
        title: "Cliente creado",
        description: "Cliente creado correctamente.",
      })
      router.push("/customers")
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error creando cliente",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-4'>
        <div className='flex justify-between items-center'>
          <h2 className='font-semibold text-lg'>Agregar Cliente</h2>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            )}
            Agregar Cliente
          </Button>
        </div>

        <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
          <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
            <Card className='overflow-hidden'>
              <CardHeader>
                <CardTitle className='text-xl'>
                  Información del Cliente
                </CardTitle>
                <CardDescription>
                  Información personal del cliente
                </CardDescription>
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
                            placeholder='Nombre del cliente'
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
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            step='1'
                            placeholder='Número de teléfono del cliente'
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='birthdate'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha de nacimiento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild className='w-full'>
                            <FormControl>
                              <Button
                                disabled={isSubmitting}
                                variant={"outline"}
                                className={cn(
                                  "",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Selecciona una fecha</span>
                                )}
                                <Icons.calendar className='ml-auto h-4 w-4 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-auto p-0' align='start'>
                            <Calendar
                              captionLayout='dropdown-buttons'
                              fromYear={1900}
                              toYear={2024}
                              mode='single'
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
            <Card className='overflow-hidden'>
              <CardHeader>
                <CardTitle className='text-xl'>Direcciones</CardTitle>
                <CardDescription>Direcciones del cliente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {fields.map((field, index) => (
                    <fieldset key={field.id} className='border p-5 rounded-md'>
                      <legend>
                        <FormLabel className='mx-2'>
                          Dirección {index + 1}
                        </FormLabel>
                      </legend>
                      <div className='space-y-3'>
                        <FormField
                          control={control}
                          name={`addresses.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Etiqueta</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={
                                  field.value?.toString() || "false"
                                }
                                disabled={isSubmitting}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(CustomerAddressLabel).map(
                                    ([key, value]) => (
                                      <SelectItem
                                        key={key}
                                        value={value}
                                        disabled={
                                          watch("addresses")?.some(
                                            (address) => address.label === value
                                          ) && value !== "OTHER"
                                        }
                                      >
                                        {translateAddressLabel(value)}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {watch(`addresses.${index}.label`) ===
                          CustomerAddressLabel.OTHER && (
                          <FormField
                            control={control}
                            name={`addresses.${index}.labelString`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Etiqueta personalizada</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Ejemplo: Casa de un amigo.'
                                    disabled={isSubmitting}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <FormField
                          control={control}
                          name={`addresses.${index}.province`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provincia</FormLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value)
                                  setValue(
                                    `addresses.${index}.municipality`,
                                    ""
                                  )
                                  setValue(`addresses.${index}.locality`, "")
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
                                  {provinces?.map((province) => (
                                    <SelectItem key={province} value={province}>
                                      {province}
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
                          name={`addresses.${index}.municipality`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {watch(`addresses.${index}.province`) ===
                                "Ciudad Autónoma de Buenos Aires"
                                  ? "Comuna"
                                  : "Municipalidad"}
                              </FormLabel>
                              <FormControl>
                                <MunicipalitySelect
                                  province={watch(
                                    `addresses.${index}.province`
                                  )}
                                  value={field.value}
                                  onChange={(value) => {
                                    field.onChange(value)
                                    setValue(`addresses.${index}.locality`, "")
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
                          name={`addresses.${index}.locality`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {watch(`addresses.${index}.province`) ===
                                "Ciudad Autónoma de Buenos Aires"
                                  ? "Barrio"
                                  : "Localidad"}
                              </FormLabel>
                              <FormControl>
                                <LocalitySelect
                                  province={watch(
                                    `addresses.${index}.province`
                                  )}
                                  municipality={watch(
                                    `addresses.${index}.municipality`
                                  )}
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
                          name={`addresses.${index}.addressGeoRef`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Calle/Avenida</FormLabel>
                              <FormControl>
                                <AsyncSelectAddress
                                  selected={field.value}
                                  onChange={field.onChange}
                                  disabled={
                                    isSubmitting ||
                                    !watch(`addresses.${index}.municipality`)
                                  }
                                  province={watch(
                                    `addresses.${index}.province`
                                  )}
                                  municipality={watch(
                                    `addresses.${index}.municipality`
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='grid grid-cols-3 gap-2'>
                          <FormField
                            control={control}
                            name={`addresses.${index}.addressNumber`}
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

                          <FormField
                            control={control}
                            name={`addresses.${index}.addressFloor`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Piso</FormLabel>
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

                          <FormField
                            control={control}
                            name={`addresses.${index}.addressApartment`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Departamento</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Departamento'
                                    disabled={isSubmitting}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value.toUpperCase()
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={control}
                          name={`addresses.${index}.postCode`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código postal</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='1'
                                  placeholder='Código postal'
                                  disabled={isSubmitting}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className='flex justify-end mt-8'>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={() => remove(index)}
                            disabled={isSubmitting}
                          >
                            <small>Quitar</small>
                          </Button>
                        </div>
                      </div>
                    </fieldset>
                  ))}

                  <Button
                    type='button'
                    variant='ghost'
                    onClick={() =>
                      append({
                        addressApartment: "",
                        addressFloor: 0,
                        addressGeoRef: undefined as any,
                        addressNumber: 0,
                        label: CustomerAddressLabel.OTHER,
                        labelString: "",
                        locality: "",
                        municipality: "",
                        postCode: "",
                        province: "",
                      })
                    }
                    disabled={isSubmitting}
                  >
                    <Icons.plus className='w-4 h-4 mr-1' />
                    <small>Agregar Dirección</small>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateCustomer
