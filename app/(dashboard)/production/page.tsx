import Link from "next/link"
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import StatTile from "@/components/dashboard/analytics/stat-tile"
import {
  formatCurrency,
  formatNumber,
} from "@/components/dashboard/analytics/format"
import { formatQuantity } from "@/components/dashboard/production/format"
import DateRangeFilter from "@/components/dashboard/production/date-range-filter"
import {
  PRODUCTION_SCOPES,
  ProductionScope,
  getProductionPlan,
} from "@/data/production"
import { getPeriodRange, getRangeFromDates } from "@/helpers/date-range"
import { hasPermission } from "@/helpers/helpers"
import { verifySession } from "@/lib/auth/verify-session"
import { cn } from "@/lib/utils"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { AnalyticsPeriod } from "@/types/types"

const PERIODS: { key: AnalyticsPeriod; label: string }[] = [
  { key: "week", label: "Esta semana" },
  { key: "month", label: "Este mes" },
]

const SCOPE_KEYS = Object.keys(PRODUCTION_SCOPES) as ProductionScope[]

type FilterLinkProps = {
  href: string
  active: boolean
  children: React.ReactNode
}

const FilterLink = ({ href, active, children }: FilterLinkProps) => (
  <Link
    href={href}
    aria-current={active ? "page" : undefined}
    className={cn(
      "rounded-md px-3 py-1.5 text-sm transition-colors",
      active
        ? "bg-background font-medium shadow-sm"
        : "text-muted-foreground hover:text-foreground"
    )}
  >
    {children}
  </Link>
)

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string
    scope?: string
    from?: string
    to?: string
  }>
}) {
  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(user, "view:orders")) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const params = await searchParams

  const period: AnalyticsPeriod = PERIODS.some((p) => p.key === params.period)
    ? (params.period as AnalyticsPeriod)
    : "week"

  const scope: ProductionScope = SCOPE_KEYS.includes(
    params.scope as ProductionScope
  )
    ? (params.scope as ProductionScope)
    : "committed"

  // Un rango explícito manda sobre el período preestablecido.
  const customRange = getRangeFromDates(params.from, params.to)
  const range = customRange ?? getPeriodRange(period)

  const plan = await getProductionPlan(range, scope)

  const buildHref = (next: { period?: string; scope?: string }) => {
    const nextPeriod = next.period ?? (customRange ? undefined : period)
    const nextScope = next.scope ?? scope
    // Al cambiar de período se abandona el rango manual; al cambiar de estado
    // se conserva lo que esté activo.
    const keepRange = customRange && !next.period

    return keepRange
      ? `/production?scope=${nextScope}&from=${params.from}&to=${params.to}`
      : `/production?period=${nextPeriod ?? "week"}&scope=${nextScope}`
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/production'>Producción</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-lg font-semibold md:text-2xl'>
            Planificación de producción
          </h1>
          <p className='text-sm text-muted-foreground'>
            Pedidos del{" "}
            {format(plan.range.start, "d 'de' MMMM", { locale: es })} al{" "}
            {format(plan.range.end, "d 'de' MMMM", { locale: es })}.
          </p>
        </div>

        <div className='flex flex-wrap gap-2'>
          <div className='inline-flex rounded-lg border bg-muted/40 p-1'>
            {PERIODS.map((option) => (
              <FilterLink
                key={option.key}
                href={buildHref({ period: option.key })}
                active={!customRange && option.key === period}
              >
                {option.label}
              </FilterLink>
            ))}
          </div>

          <DateRangeFilter from={params.from} to={params.to} scope={scope} />

          <div className='inline-flex rounded-lg border bg-muted/40 p-1'>
            {SCOPE_KEYS.map((key) => (
              <FilterLink
                key={key}
                href={buildHref({ scope: key })}
                active={key === scope}
              >
                {PRODUCTION_SCOPES[key].label}
              </FilterLink>
            ))}
          </div>
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatTile
          label='Viandas a producir'
          value={formatNumber(plan.unitsToProduce)}
          hint='Suma de todas las unidades pedidas'
        />
        <StatTile
          label='Pedidos incluidos'
          value={formatNumber(plan.orderCount)}
          hint={PRODUCTION_SCOPES[scope].label}
        />
        <StatTile
          label='Costo de ingredientes'
          value={formatCurrency(plan.ingredientsCost)}
          hint='Con merma incluida, a precios actuales'
        />
        <StatTile
          label='Bolsones a armar'
          value={formatNumber(plan.bags.rows.length)}
          hint='Un bolsón por cliente'
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-xl'>Lista de compras</CardTitle>
          <CardDescription>
            Cantidad total de cada ingrediente, ya ajustada por merma. Ordenada
            por costo, de mayor a menor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plan.ingredients.length ? (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingrediente</TableHead>
                    <TableHead className='text-right'>Neto</TableHead>
                    <TableHead className='text-right'>Merma</TableHead>
                    <TableHead className='text-right'>A comprar</TableHead>
                    <TableHead className='text-right'>Costo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.ingredients.map((ingredient) => (
                    <TableRow key={ingredient.ingredientId}>
                      <TableCell className='font-medium'>
                        {ingredient.name}
                      </TableCell>
                      <TableCell className='text-right tabular-nums text-muted-foreground'>
                        {formatQuantity(
                          ingredient.baseQuantity,
                          ingredient.measurement
                        )}
                      </TableCell>
                      <TableCell className='text-right tabular-nums text-muted-foreground'>
                        {ingredient.waste.toFixed(0)}%
                      </TableCell>
                      <TableCell className='text-right font-medium tabular-nums'>
                        {formatQuantity(
                          ingredient.totalQuantity,
                          ingredient.measurement
                        )}
                      </TableCell>
                      <TableCell className='text-right tabular-nums'>
                        {formatCurrency(ingredient.cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>Total</TableCell>
                    <TableCell className='text-right tabular-nums'>
                      {formatCurrency(plan.ingredientsCost)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          ) : (
            <p className='py-12 text-center text-sm text-muted-foreground'>
              No hay pedidos en este período con los estados seleccionados.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='text-xl'>Producción por producto</CardTitle>
          <CardDescription>
            Cuántas unidades cocinar de cada vianda, separadas por variante.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {plan.products.length ? (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className='text-right'>Con sal</TableHead>
                    <TableHead className='text-right'>Sin sal</TableHead>
                    <TableHead className='text-right'>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.products.map((product) => (
                    <TableRow key={product.name}>
                      <TableCell className='font-medium'>
                        {product.name}
                      </TableCell>
                      <TableCell className='text-right tabular-nums text-muted-foreground'>
                        {formatNumber(product.withSalt)}
                      </TableCell>
                      <TableCell className='text-right tabular-nums text-muted-foreground'>
                        {formatNumber(product.withoutSalt)}
                      </TableCell>
                      <TableCell className='text-right font-medium tabular-nums'>
                        {formatNumber(product.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className='text-right tabular-nums'>
                      {formatNumber(plan.unitsToProduce)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          ) : (
            <p className='py-12 text-center text-sm text-muted-foreground'>
              No hay nada para producir en este período.
            </p>
          )}
        </CardContent>
      </Card>

      {plan.recipeGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Detalle por receta</CardTitle>
            <CardDescription>
              Ingredientes de cada componente, para llevar a la cocina.
            </CardDescription>
          </CardHeader>
          <CardContent className='grid gap-3'>
            {plan.recipeGroups.map((group) => (
              <details
                key={group.productId}
                className='rounded-lg border px-4 py-3'
              >
                <summary className='flex cursor-pointer flex-wrap items-center justify-between gap-2'>
                  <span className='font-medium'>{group.productName}</span>
                  <span className='text-sm text-muted-foreground'>
                    {formatNumber(group.totalQuantitySold)} unidades ·{" "}
                    {formatCurrency(group.totalCost)}
                  </span>
                </summary>

                <div className='mt-3 grid gap-4'>
                  {group.recipeGroups.map((recipe) => (
                    <div key={recipe.productRecipeType}>
                      <p className='mb-1 text-sm font-medium'>
                        {recipe.productRecipeType}
                      </p>
                      <ul className='grid gap-1 text-sm'>
                        {recipe.ingredients.map((ingredient) => (
                          <li
                            key={ingredient.ingredientId}
                            className='flex justify-between gap-4 border-b py-1 last:border-0'
                          >
                            <span>{ingredient.name}</span>
                            <span className='shrink-0 tabular-nums'>
                              {formatQuantity(
                                ingredient.totalQuantity,
                                ingredient.measurement
                              )}
                              <span className='ml-2 text-muted-foreground'>
                                {formatCurrency(ingredient.cost)}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </CardContent>
        </Card>
      )}

      {plan.bags.rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Bolsones por cliente</CardTitle>
            <CardDescription>
              Qué lleva el pedido de cada cliente, para el armado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='sticky left-0 bg-card'>
                      Cliente
                    </TableHead>
                    {plan.bags.products.map((product) => (
                      <TableHead key={product} className='text-right'>
                        {product}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.bags.rows.map((row) => (
                    <TableRow key={row.customer}>
                      <TableCell className='sticky left-0 bg-card font-medium'>
                        {row.customer}
                      </TableCell>
                      {plan.bags.products.map((product) => (
                        <TableCell
                          key={product}
                          className={cn("text-right tabular-nums", {
                            "text-muted-foreground/40":
                              !row.quantities[product],
                          })}
                        >
                          {row.quantities[product] || "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
