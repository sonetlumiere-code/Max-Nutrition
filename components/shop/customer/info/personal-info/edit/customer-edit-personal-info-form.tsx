"use client"

import { editCustomer } from "@/actions/customer/edit-customer"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { customerSchema } from "@/lib/validations/customer-validation"
import { PopulatedCustomer } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

type CustomerSchema = z.infer<typeof customerSchema>

type CustomerEditPersonalInfoFormProps = {
  customer: PopulatedCustomer
  setOpen: Dispatch<SetStateAction<boolean>>
}

const CustomerEditPersonalInfoForm = ({
  customer,
  setOpen,
}: CustomerEditPersonalInfoFormProps) => {
  const form = useForm<CustomerSchema>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      userId: customer.userId || "",
      name: customer.name || customer.user?.name || "",
      phone: customer.phone || 0,
      birthdate: customer.birthdate || undefined,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: CustomerSchema) => {
    const res = await editCustomer({ id: customer.id, values: data })

    setOpen(false)

    if (res.success) {
      toast({
        title: "Datos actualizados",
        description: "Tus datos han sido actualizados correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando datos",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
        <FormField
          control={control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre y apellido</FormLabel>
              <FormControl>
                <Input placeholder='' disabled={isSubmitting} {...field} />
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
                  placeholder='Ingresa tu número de teléfono'
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
            <FormItem className='flex flex-col'>
              <FormLabel>Fecha de nacimiento</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
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
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting && (
            <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
          )}
          Guardar
        </Button>
      </form>
    </Form>
  )
}

export default CustomerEditPersonalInfoForm
