import { redirect } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import StatTile from "@/components/dashboard/analytics/stat-tile"
import {
  formatCurrency,
  formatNumber,
} from "@/components/dashboard/analytics/format"
import { getSubscriptionsOverview } from "@/data/subscriptions"
import { hasPermission, translateShippingMethod } from "@/helpers/helpers"
import { translateWeekday } from "@/helpers/subscriptions"
import { verifySession } from "@/lib/auth/verify-session"
import { cn } from "@/lib/utils"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"

/** Etiqueta del estado del débito automático, tal como lo informa Mercado Pago. */
const PREAPPROVAL_LABELS: Record<string, string> = {
  pending: "Falta autorizar",
  authorized: "Autorizado",
  paused: "Pausado en MP",
  cancelled: "Cancelado en MP",
}

export default async function SubscriptionsPage() {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:orders")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { subscriptions, stats } = await getSubscriptionsOverview()

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/subscriptions'>Suscripciones</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className='text-lg font-semibold md:text-2xl'>Suscripciones</h1>
        <p className='text-sm text-muted-foreground'>
          Clientes con pedido semanal automático.
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatTile
          label='Suscripciones activas'
          value={formatNumber(stats.active)}
          hint={`${formatNumber(stats.total)} en total, contando pausadas`}
        />
        <StatTile
          label='Comprometido por semana'
          value={formatCurrency(stats.weeklyCommitted)}
          hint='Suma de los débitos automáticos autorizados'
        />
        <StatTile
          label='Se generan hoy'
          value={formatNumber(stats.generatingToday)}
          hint='Pedidos que crea el sistema en el día'
        />
        <StatTile
          label='Falta autorizar'
          value={formatNumber(stats.pendingAuthorization)}
          hint='Esperan que el cliente autorice su tarjeta'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-xl'>Todas las suscripciones</CardTitle>
          <CardDescription>
            El importe del débito queda fijo desde que el cliente lo autoriza.
            La columna “Valor hoy” muestra cuánto costarían esos productos con
            los precios actuales, para detectar las que quedaron desfasadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length ? (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tienda</TableHead>
                    <TableHead>Día</TableHead>
                    <TableHead className='text-right'>Unidades</TableHead>
                    <TableHead className='text-right'>Débito</TableHead>
                    <TableHead className='text-right'>Valor hoy</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => {
                    const drift =
                      subscription.amount !== null
                        ? subscription.currentValue - subscription.amount
                        : 0
                    const hasDrift = Math.abs(drift) > 0.01

                    return (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className='font-medium'>
                            {subscription.customer?.name}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {subscription.customer?.user?.email}
                          </div>
                        </TableCell>
                        <TableCell className='text-muted-foreground'>
                          {subscription.shop?.name}
                        </TableCell>
                        <TableCell>
                          {translateWeekday(subscription.weekday)}
                          {subscription.generatesToday && (
                            <Badge variant='secondary' className='ml-2'>
                              hoy
                            </Badge>
                          )}
                          <div className='text-xs text-muted-foreground'>
                            {translateShippingMethod(
                              subscription.shippingMethod
                            )}
                          </div>
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>
                          {formatNumber(subscription.units)}
                        </TableCell>
                        <TableCell className='text-right tabular-nums'>
                          {subscription.amount !== null
                            ? formatCurrency(subscription.amount)
                            : "—"}
                        </TableCell>
                        <TableCell
                          className={cn("text-right tabular-nums", {
                            "text-destructive": hasDrift,
                          })}
                          title={
                            hasDrift
                              ? `Difiere ${formatCurrency(drift)} del débito autorizado`
                              : undefined
                          }
                        >
                          {formatCurrency(subscription.currentValue)}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col items-start gap-1'>
                            <Badge
                              variant={
                                subscription.isReady ? "default" : "secondary"
                              }
                            >
                              {subscription.isActive ? "Activa" : "Pausada"}
                            </Badge>
                            {subscription.preapprovalStatus && (
                              <span className='text-xs text-muted-foreground'>
                                {PREAPPROVAL_LABELS[
                                  subscription.preapprovalStatus
                                ] ?? subscription.preapprovalStatus}
                              </span>
                            )}
                            {subscription.lastRunAt && (
                              <span className='text-xs text-muted-foreground'>
                                Último:{" "}
                                {format(subscription.lastRunAt, "dd/MM/yyyy", {
                                  locale: es,
                                })}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className='py-12 text-center text-sm text-muted-foreground'>
              Todavía no hay clientes suscriptos.
            </p>
          )}
        </CardContent>
      </Card>

      {subscriptions.some((subscription) => subscription.isReady) && (
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Qué se viene esta semana</CardTitle>
            <CardDescription>
              Unidades que van a generar las suscripciones activas, por día.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid gap-2 text-sm'>
              {Object.entries(
                subscriptions
                  .filter((subscription) => subscription.isReady)
                  .reduce<Record<string, number>>((acc, subscription) => {
                    const day = translateWeekday(subscription.weekday)
                    acc[day] = (acc[day] || 0) + subscription.units
                    return acc
                  }, {})
              ).map(([day, units]) => (
                <li key={day} className='flex justify-between border-b py-1'>
                  <span>{day}</span>
                  <span className='tabular-nums'>
                    {formatNumber(units)}{" "}
                    {units === 1 ? "unidad" : "unidades"}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  )
}
