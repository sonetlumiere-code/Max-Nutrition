"use client"

import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { customerAddressSchema } from "@/lib/validations/customer-address-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { createCustomerAddress } from "@/actions/customer-address/create-customer-address"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { AddressLabel } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAddressLabelDisplay } from "@/helpers/helpers"

type CustomerAddressSchema = z.infer<typeof customerAddressSchema>

type CustomerCreateAddressFormProps = {
  customerId: string
  setOpen: Dispatch<SetStateAction<boolean>>
}

const CustomerCreateAddressForm = ({
  customerId,
  setOpen,
}: CustomerCreateAddressFormProps) => {
  const form = useForm<CustomerAddressSchema>({
    resolver: zodResolver(customerAddressSchema),
    defaultValues: {
      address: "",
      city: "",
      postCode: "",
      label: AddressLabel.Home,
      labelString: "",
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = form

  const onSubmit = async (data: CustomerAddressSchema) => {
    const res = await createCustomerAddress(customerId, data)
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
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
        <FormField
          control={control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input
                  placeholder='Dirección'
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
          name='city'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ciudad</FormLabel>
              <FormControl>
                <Input
                  placeholder='Ciudad'
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
          control={form.control}
          name='label'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
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
                  {Object.entries(AddressLabel).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {getAddressLabelDisplay(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watch("label") === AddressLabel.Other && (
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

        <Button type='submit' disabled={isSubmitting}>
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
