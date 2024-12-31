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
import { customerSchema } from "@/lib/validations/customer-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
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

type CustomerSchema = z.infer<typeof customerSchema>

const CreateCustomer = () => {
  const router = useRouter()

  const form = useForm<CustomerSchema>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: 0,
      birthdate: undefined,
      address: [],
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

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
              <CardContent>direcciones</CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateCustomer
