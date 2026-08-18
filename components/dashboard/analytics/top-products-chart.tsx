import {
  formatCurrency,
  formatNumber,
} from "@/components/dashboard/analytics/format"

type TopProductsChartProps = {
  data: { name: string; quantity: number; revenue: number }[]
  limit?: number
}

const TopProductsChart = ({ data, limit = 8 }: TopProductsChartProps) => {
  const items = data.slice(0, limit)
  const max = Math.max(...items.map((item) => item.quantity), 0)

  if (!items.length) {
    return (
      <p className='py-12 text-center text-sm text-muted-foreground'>
        Todavía no hay productos vendidos en este período.
      </p>
    )
  }

  return (
    <div className='grid gap-2'>
      {items.map((item) => (
        <div
          key={item.name}
          className='grid grid-cols-[minmax(0,8rem)_1fr] items-center gap-3 md:grid-cols-[minmax(0,11rem)_1fr]'
        >
          <span className='truncate text-sm' title={item.name}>
            {item.name}
          </span>
          <div className='flex items-center gap-2'>
            {/* La pista ocupa el ancho restante y no se encoge, para que el
                porcentaje de la barra represente el valor sin distorsión. */}
            <div className='min-w-0 flex-1'>
              <div
                style={{ width: `${max ? (item.quantity / max) * 100 : 0}%` }}
                className='h-5 min-w-[2px] rounded-r-[4px] bg-[#2a78d6] dark:bg-[#3987e5]'
                title={`${item.name}: ${formatNumber(
                  item.quantity
                )} unidades · ${formatCurrency(item.revenue)}`}
              />
            </div>
            <span className='shrink-0 text-xs tabular-nums'>
              {formatNumber(item.quantity)}
              <span className='ml-1 text-muted-foreground'>
                · {formatCurrency(item.revenue)}
              </span>
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TopProductsChart
