import Link from "next/link"
import { redirect } from "next/navigation"
import { OrderStatus } from "@prisma/client"
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
import RevenueChart from "@/components/dashboard/analytics/revenue-chart"
import TopProductsChart from "@/components/dashboard/analytics/top-products-chart"
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/components/dashboard/analytics/format"
import { getAnalytics } from "@/data/analytics"
import { hasPermission, translateOrderStatus } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import { cn } from "@/lib/utils"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { AnalyticsPeriod } from "@/types/types"

const PERIODS: { key: AnalyticsPeriod; label: string }[] = [
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
  { key: "year", label: "Año" },
]

const PERIOD_COPY: Record<
  AnalyticsPeriod,
  { comparison: string; bucket: string; chart: string }
> = {
  week: {
    comparison: "vs. semana anterior",
    bucket: "día",
    chart: "Ingresos por día de esta semana",
  },
  month: {
    comparison: "vs. mes anterior",
    bucket: "día",
    chart: "Ingresos por día de este mes",
  },
  year: {
    comparison: "vs. año anterior",
    bucket: "mes",
    chart: "Ingresos por mes de este año",
  },
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-amber-500 hover:bg-amber-500/80",
  [OrderStatus.ACCEPTED]: "bg-sky-500 hover:bg-sky-500/80",
  [OrderStatus.COMPLETED]: "bg-emerald-500 hover:bg-emerald-500/80",
  [OrderStatus.CANCELLED]: "bg-destructive hover:bg-destructive/80",
}

const getDelta = (current: number, previous: number) => {
  if (!previous) return null
  return ((current - previous) / previous) * 100
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:analytics")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const { period: periodParam } = await searchParams
  const period: AnalyticsPeriod = PERIODS.some(
    (option) => option.key === periodParam
  )
    ? (periodParam as AnalyticsPeriod)
    : "month"

  const copy = PERIOD_COPY[period]
  const { kpis, timeSeries, topProducts, margins, customers, statusBreakdown } =
    await getAnalytics(period)

  const cancelled = statusBreakdown.find(
    (entry) => entry.status === OrderStatus.CANCELLED
  )

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/analytics'>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Un solo control de período para todo lo que sigue. */}
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-lg font-semibold md:text-2xl'>Dashboard</h1>
          <p className='text-sm text-muted-foreground'>
            Métricas del período en curso. No incluye pedidos cancelados.
          </p>
        </div>

        <div className='inline-flex rounded-lg border bg-muted/40 p-1'>
          {PERIODS.map((option) => (
            <Link
              key={option.key}
              href={`/analytics?period=${option.key}`}
              aria-current={option.key === period ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                option.key === period
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatTile
          label='Ingresos'
          value={formatCurrency(kpis.revenue)}
          delta={getDelta(kpis.revenue, kpis.previousRevenue)}
          comparisonLabel={copy.comparison}
          hint='Sin ventas en el período anterior para comparar'
        />
        <StatTile
          label='Pedidos'
          value={formatNumber(kpis.orders)}
          delta={getDelta(kpis.orders, kpis.previousOrders)}
          comparisonLabel={copy.comparison}
          hint='Sin pedidos en el período anterior para comparar'
        />
        <StatTile
          label='Ticket promedio'
          value={formatCurrency(kpis.averageTicket)}
          delta={getDelta(kpis.averageTicket, kpis.previousAverageTicket)}
          comparisonLabel={copy.comparison}
          hint='Sin pedidos en el período anterior para comparar'
        />
        <StatTile
          label='Margen bruto estimado'
          value={formatCurrency(kpis.grossMargin)}
          hint={`${formatPercent(
            kpis.marginPct
          )} sobre ventas · descuenta envíos y ${formatCurrency(
            kpis.ingredientsCost
          )} de ingredientes`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-xl'>{copy.chart}</CardTitle>
          <CardDescription>
            Total facturado, incluyendo envíos y con las promociones ya
            descontadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart data={timeSeries} bucketName={copy.bucket} />
        </CardContent>
      </Card>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Productos más vendidos</CardTitle>
            <CardDescription>
              Unidades vendidas y facturación de cada producto en el período.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopProductsChart data={topProducts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Estado de los pedidos</CardTitle>
            <CardDescription>
              Todos los pedidos del período, incluidos los cancelados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusBreakdown.length ? (
              <ul className='grid gap-3'>
                {statusBreakdown.map((entry) => (
                  <li
                    key={entry.status}
                    className='flex items-center justify-between'
                  >
                    <Badge className={STATUS_STYLES[entry.status]}>
                      {translateOrderStatus(entry.status)}
                    </Badge>
                    <span className='text-sm tabular-nums'>
                      {formatNumber(entry.count)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='py-12 text-center text-sm text-muted-foreground'>
                Todavía no hay pedidos en este período.
              </p>
            )}

            {cancelled && cancelled.count > 0 && (
              <p className='mt-4 border-t pt-3 text-xs text-muted-foreground'>
                Los {formatNumber(cancelled.count)} pedidos cancelados no suman
                a los ingresos ni al margen.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>
              Rentabilidad por producto
            </CardTitle>
            <CardDescription>
              Precio de venta contra el costo actual de sus recetas, con merma
              incluida. Ordenado por el margen más ajustado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {margins.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className='text-right'>Precio</TableHead>
                    <TableHead className='text-right'>Costo</TableHead>
                    <TableHead className='text-right'>Margen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {margins.slice(0, 10).map((product) => (
                    <TableRow key={product.name}>
                      <TableCell className='max-w-[10rem] truncate'>
                        {product.name}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatCurrency(product.cost)}
                      </TableCell>
                      <TableCell
                        className={cn("text-right tabular-nums", {
                          "text-destructive": product.margin < 0,
                        })}
                      >
                        {formatPercent(product.marginPct)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className='py-12 text-center text-sm text-muted-foreground'>
                Ningún producto tiene recetas cargadas todavía, así que no se
                puede calcular el costo.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Clientes del período</CardTitle>
            <CardDescription>
              {formatNumber(customers.length)}{" "}
              {customers.length === 1 ? "cliente compró" : "clientes compraron"}{" "}
              en este período.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className='text-right'>Pedidos</TableHead>
                    <TableHead className='text-right'>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.slice(0, 10).map((customer) => (
                    <TableRow key={customer.name}>
                      <TableCell className='max-w-[12rem] truncate'>
                        {customer.name}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatNumber(customer.orders)}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatCurrency(customer.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className='py-12 text-center text-sm text-muted-foreground'>
                Todavía no hay clientes con pedidos en este período.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
