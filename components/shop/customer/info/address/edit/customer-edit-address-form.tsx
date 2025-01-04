"use client"

import { editCustomerAddress } from "@/actions/customer-address/edit-customer-address"
import { toast } from "@/components/ui/use-toast"
import { customerAddressSchema } from "@/lib/validations/customer-address-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { CustomerAddressLabel, CustomerAddress } from "@prisma/client"
import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { translateAddressLabel } from "@/helpers/helpers"
import MunicipalitySelect from "@/components/municipality-select"
import LocalitySelect from "@/components/locality-select"
import AsyncSelectAddress from "@/components/async-search-address"
import { ScrollArea } from "@/components/ui/scroll-area"

type CustomerAddressSchema = z.infer<typeof customerAddressSchema>

type CustomerEditAddressFormProps = {
  address: CustomerAddress
  setOpen: Dispatch<SetStateAction<boolean>>
}

const provinces = ["Ciudad Autónoma de Buenos Aires", "Buenos Aires"] as const

const CustomerEditAddressForm = ({
  address,
  setOpen,
}: CustomerEditAddressFormProps) => {
  const form = useForm<CustomerAddressSchema>({
    resolver: zodResolver(customerAddressSchema),
    defaultValues: {
      province: address.province,
      municipality: address.municipality,
      locality: address.locality,
      addressGeoRef: {
        altura: {
          unidad: null,
          valor: address.addressNumber,
        },
        calle: {
          categoria: undefined,
          id: "",
          nombre: address.addressStreet,
        },
        departamento: {
          id: "",
          nombre: address.municipality,
        },
        nomenclatura: "",
        provincia: {
          id: "",
          nombre: address.province,
        },
      },
      addressNumber: address.addressNumber,
      addressFloor: address.addressFloor || 0,
      addressApartment: address.addressApartment || "",
      postCode: address.postCode,
      label: address.label,
      labelString: address.labelString || "",
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = form

  const onSubmit = async (data: CustomerAddressSchema) => {
    const res = await editCustomerAddress(address.id, data)
    setOpen(false)

    if (res.success) {
      toast({
        title: "Dirección actualizada",
        description: "La dirección ha sido editada correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error editando dirección",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
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
                          <SelectItem key={key} value={value}>
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
          </div>
        </ScrollArea>

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && (
            <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
          )}
          Editar direccón
        </Button>
      </form>
    </Form>
  )
}

export default CustomerEditAddressForm
