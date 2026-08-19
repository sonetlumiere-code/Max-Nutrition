"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DayOfWeek } from "@prisma/client"
import { createSubscriptionFromOrder } from "@/actions/subscriptions/manage-subscription"
import { useCart } from "@/components/cart-provider"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { WEEKDAY_LABELS, translateWeekday } from "@/helpers/subscriptions"
import { PopulatedOrder } from "@/types/types"

type SubscribeCustomerOrderProps = {
  order: PopulatedOrder
}

const SubscribeCustomerOrder = ({ order }: SubscribeCustomerOrderProps) => {
  const router = useRouter()
  const { shop } = useCart()
  const [open, setOpen] = useState(false)
  const [weekday, setWeekday] = useState<DayOfWeek>(DayOfWeek.MONDAY)
  const [isLoading, setIsLoading] = useState(false)

  const onSubscribe = async () => {
    setIsLoading(true)
    const res = await createSubscriptionFromOrder({
      orderId: order.id,
      weekday,
    })
    setIsLoading(false)

    if (res.error) {
      toast({
        variant: "destructive",
        title: "No se pudo crear la suscripción",
        description: res.error,
      })
      return
    }

    setOpen(false)
    toast({
      title: "¡Listo! Ya tenés tu pedido semanal.",
      description: `Lo vamos a preparar todos los ${translateWeekday(
        weekday
      ).toLowerCase()}.`,
    })
    router.push(`/${shop.key}/subscriptions`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className='flex w-full items-center'>
          <Icons.calendar className='mr-2 h-4 w-4' />
          <p>Repetir todas las semanas</p>
        </span>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Repetir este pedido cada semana</DialogTitle>
          <DialogDescription>
            Vamos a preparar los mismos productos todas las semanas. Se cobra
            como este pedido y podés pausarlo cuando quieras.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>¿Qué día lo preparamos?</label>
            <Select
              value={weekday}
              onValueChange={(value) => setWeekday(value as DayOfWeek)}
            >
              <SelectTrigger>
                <SelectValue>{translateWeekday(weekday)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.keys(WEEKDAY_LABELS).map((day) => (
                  <SelectItem key={day} value={day}>
                    {translateWeekday(day as DayOfWeek)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className='text-xs text-muted-foreground'>
            Cada semana armamos el pedido con los precios y la disponibilidad
            de ese momento, y te avisamos por mail.
          </p>

          <Button type='button' onClick={onSubscribe} disabled={isLoading}>
            {isLoading ? (
              <Icons.spinner className='h-4 w-4 animate-spin' />
            ) : (
              "Crear mi pedido semanal"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SubscribeCustomerOrder
