import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { partialOrderSchema } from "@/lib/validations/order-validation"
import { PopulatedOrder } from "@/types/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrderStatus } from "@prisma/client"
import { translateOrderStatus } from "@/helpers/helpers"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { editOrder } from "@/actions/orders/edit-order"
import { Icons } from "@/components/icons"
import { mutate } from "swr"

type EditOrderFormProps = {
  order: PopulatedOrder
  setOpen: Dispatch<SetStateAction<boolean>>
}

type PartialOrderSchema = z.infer<typeof partialOrderSchema>

const EditOrderForm = ({ order, setOpen }: EditOrderFormProps) => {
  const form = useForm({
    resolver: zodResolver(partialOrderSchema),
    defaultValues: {
      status: order.status,
    },
  })

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: PartialOrderSchema) => {
    const res = await editOrder({
      id: order.id,
      values: data,
    })

    if (res.success) {
      mutate("orders")
      toast({
        title: "Pedido actualizado.",
        description: "La orden ha sido actualizada.",
      })
    }
    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error cancelando pedido.",
        description: res.error,
      })
    }

    setOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
        <FormField
          control={control}
          name={"status"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(OrderStatus).map((status) => (
                    <SelectItem
                      key={status}
                      value={status}
                      className='capitalize'
                    >
                      {translateOrderStatus(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? (
            <Icons.spinner className='w-4 h-4 animate-spin' />
          ) : (
            <>Guardar</>
          )}
        </Button>
      </form>
    </Form>
  )
}

export default EditOrderForm
