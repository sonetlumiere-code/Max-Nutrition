"use client"

import { useState, useTransition } from "react"
import { DayOfWeek } from "@prisma/client"
import {
  deleteSubscription,
  updateSubscription,
} from "@/actions/subscriptions/manage-subscription"
import { useConfirmation } from "@/components/confirmation-provider"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { WEEKDAY_LABELS, translateWeekday } from "@/helpers/subscriptions"
import { translateShippingMethod } from "@/helpers/helpers"
import { useRouter } from "next/navigation"

type SubscriptionCardProps = {
  subscription: {
    id: string
    weekday: DayOfWeek
    isActive: boolean
    shippingMethod: "DELIVERY" | "TAKE_AWAY"
    amount: number | null
    preapprovalStatus: string | null
    items: { id: string; quantity: number; withSalt: boolean; productName: string }[]
  }
}

const SubscriptionCard = ({ subscription }: SubscriptionCardProps) => {
  const router = useRouter()
  const confirm = useConfirmation()
  const [isPending, startTransition] = useTransition()
  const [weekday, setWeekday] = useState<DayOfWeek>(subscription.weekday)

  const run = (action: () => Promise<{ error?: string }>, okMessage: string) => {
    startTransition(async () => {
      const res = await action()

      if (res.error) {
        toast({
          variant: "destructive",
          title: "No se pudo actualizar",
          description: res.error,
        })
        return
      }

      toast({ title: okMessage })
      router.refresh()
    })
  }

  const onToggle = () =>
    run(
      () =>
        updateSubscription({
          subscriptionId: subscription.id,
          isActive: !subscription.isActive,
        }),
      subscription.isActive
        ? "Suscripción pausada."
        : "Suscripción reanudada."
    )

  const onWeekdayChange = (value: string) => {
    setWeekday(value as DayOfWeek)
    run(
      () =>
        updateSubscription({
          subscriptionId: subscription.id,
          weekday: value as DayOfWeek,
        }),
      "Cambiamos el día de tu suscripción."
    )
  }

  const onDelete = () =>
    confirm({
      variant: "destructive",
      title: "¿Cancelar la suscripción?",
      description:
        "Dejaremos de generar tus pedidos semanales. Los pedidos ya hechos no se tocan.",
    }).then(() =>
      run(
        () => deleteSubscription({ subscriptionId: subscription.id }),
        "Cancelamos tu suscripción."
      )
    )

  const totalUnits = subscription.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  const needsAuthorization = subscription.preapprovalStatus === "pending"
  const isCancelledAtProvider = subscription.preapprovalStatus === "cancelled"

  return (
    <Card>
      <CardHeader>
        <div className='flex flex-wrap items-start justify-between gap-2'>
          <div>
            <CardTitle className='text-xl'>Pedido semanal</CardTitle>
            <CardDescription>
              {totalUnits} {totalUnits === 1 ? "producto" : "productos"} ·{" "}
              {translateShippingMethod(subscription.shippingMethod)}
            </CardDescription>
          </div>
          <Badge variant={subscription.isActive ? "default" : "secondary"}>
            {subscription.isActive ? "Activa" : "Pausada"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className='grid gap-4'>
        {needsAuthorization && (
          <div className='rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900'>
            Falta autorizar el débito automático con tu tarjeta. Hasta que lo
            hagas no vamos a preparar tus pedidos. Revisá el mail de Mercado
            Pago o volvé a suscribirte desde el pedido.
          </div>
        )}

        {isCancelledAtProvider && (
          <div className='rounded-md border bg-muted p-3 text-sm text-muted-foreground'>
            El débito automático fue cancelado en Mercado Pago, así que la
            suscripción está detenida.
          </div>
        )}

        {subscription.amount !== null && (
          <p className='text-sm text-muted-foreground'>
            Débito automático de{" "}
            <strong className='text-foreground'>
              ${subscription.amount.toFixed(2)} por semana
            </strong>
            .
          </p>
        )}

        <ul className='grid gap-1 text-sm'>
          {subscription.items.map((item) => (
            <li key={item.id} className='flex justify-between border-b py-1'>
              <span>
                {item.productName}
                <span className='ml-2 text-muted-foreground'>
                  {item.withSalt ? "con sal" : "sin sal"}
                </span>
              </span>
              <span className='tabular-nums'>x{item.quantity}</span>
            </li>
          ))}
        </ul>

        <div className='grid gap-2 sm:flex sm:items-end sm:justify-between'>
          <div className='grid gap-1'>
            <label className='text-sm text-muted-foreground'>
              Se prepara los
            </label>
            <Select
              value={weekday}
              onValueChange={onWeekdayChange}
              disabled={isPending}
            >
              <SelectTrigger className='w-[180px]'>
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

          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={onToggle}
              disabled={isPending}
            >
              {subscription.isActive ? "Pausar" : "Reanudar"}
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={onDelete}
              disabled={isPending}
              className='text-destructive hover:text-destructive'
            >
              <Icons.circleX className='mr-2 h-4 w-4' />
              Cancelar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SubscriptionCard
