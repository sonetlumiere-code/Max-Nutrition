"use client"

import { createCustomerAddress } from "@/actions/customer-address/create-customer-address"
import AsyncSelectAddress from "@/components/async-search-address"
import { Icons } from "@/components/icons"
import LocalitySelect from "@/components/locality-select"
import MunicipalitySelect from "@/components/municipality-select"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { translateAddressLabel } from "@/helpers/helpers"
import {
  CustomerAddressSchema,
  customerAddressSchema,
} from "@/lib/validations/customer-address-validation"
import { PopulatedCustomer } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { CustomerAddressLabel } from "@prisma/client"
import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"

type CustomerCreateAddressFormProps = {
  setOpen: Dispatch<SetStateAction<boolean>>
  customer: PopulatedCustomer
}

const provinces = ["Ciudad Autónoma de Buenos Aires", "Buenos Aires"] as const

const CustomerCreateAddressForm = ({
  setOpen,
  customer,
}: CustomerCreateAddressFormProps) => {
  const form = useForm<CustomerAddressSchema>({
    resolver: zodResolver(customerAddressSchema),
    defaultValues: {
      province: "",
      municipality: "",
      locality: "",
      addressGeoRef: undefined,
      addressNumber: 0,
      addressFloor: 0,
      addressApartment: "",
      postCode: "",
      label: undefined,
      labelString: "",
      notes: "",
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isSubmitted, isValid },
    watch,
    setValue,
  } = form

  const onSubmit = async (data: CustomerAddressSchema) => {
    const res = await createCustomerAddress(data)
    setOpen(false)

    if (res.success) {
      toast({
        title: "Dirección agregada",
        description: "La dirección ha sido agregada correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error agregando dirección",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => {
          event.stopPropagation()
          handleSubmit(onSubmit)(event)
        }}
        className='grid gap-6'
      >
        <ScrollArea className='h-[42vh]'>
          <div className='grid gap-6 p-1'>
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiqueta</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString() || "false"}
                    disabled={form.formState.isSubmitting}
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
                              customer.addresses?.some(
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

            {watch("label") === CustomerAddressLabel.OTHER && (
              <FormField
                control={control}
                name='labelString'
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
                    {watch("province") === "Ciudad Autónoma de Buenos Aires"
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
                    {watch("province") === "Ciudad Autónoma de Buenos Aires"
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

            <div className='grid grid-cols-3 gap-2'>
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

              <FormField
                control={control}
                name='addressFloor'
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
                name='addressApartment'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Departamento'
                        disabled={isSubmitting}
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
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
              name='postCode'
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

            <FormField
              control={control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas adicionales</FormLabel>
                  <FormControl>
                    <Textarea
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
        </ScrollArea>

        <Button
          type='submit'
          disabled={isSubmitting || (isSubmitted && !isValid)}
        >
          {isSubmitting && (
            <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
          )}
          Agregar direccón
        </Button>
      </form>
    </Form>
  )
}

export default CustomerCreateAddressForm
