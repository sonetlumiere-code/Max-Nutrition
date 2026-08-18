import {
  formatCompactCurrency,
  formatCurrency,
  niceCeil,
} from "@/components/dashboard/analytics/format"

type RevenueChartProps = {
  data: { key: string; label: string; value: number }[]
  /** Nombre de lo que representa cada barra: "día", "mes". */
  bucketName: string
}

const RevenueChart = ({ data, bucketName }: RevenueChartProps) => {
  const max = Math.max(...data.map((bucket) => bucket.value), 0)
  const axisMax = niceCeil(max) || 1
  const ticks = [axisMax, axisMax / 2, 0]
  const maxIndex = data.findIndex((bucket) => bucket.value === max && max > 0)
  // Con muchas barras, etiquetar todas satura el eje.
  const labelEvery = data.length > 15 ? 5 : 1

  if (max === 0) {
    return (
      <p className='py-12 text-center text-sm text-muted-foreground'>
        Todavía no hay ingresos registrados en este período.
      </p>
    )
  }

  return (
    <div>
      <div className='flex gap-3'>
        {/* Eje de valores */}
        <div className='h-52 w-14 shrink-0 pt-5'>
          <div className='relative h-full'>
            {ticks.map((tick) => (
              <span
                key={tick}
                style={{ top: `${(1 - tick / axisMax) * 100}%` }}
                className='absolute right-0 -translate-y-1/2 text-[11px] tabular-nums text-muted-foreground'
              >
                {formatCompactCurrency(tick)}
              </span>
            ))}
          </div>
        </div>

        {/* Área de trazado */}
        <div className='min-w-0 flex-1'>
          <div className='h-52 pt-5'>
            <div className='relative h-full'>
              {ticks.map((tick) => (
                <div
                  key={tick}
                  style={{ top: `${(1 - tick / axisMax) * 100}%` }}
                  aria-hidden
                  className='absolute inset-x-0 h-px bg-border'
                />
              ))}

              <div className='absolute inset-0 flex items-end gap-[2px]'>
                {data.map((bucket, index) => (
                  <div
                    key={bucket.key}
                    className='flex h-full flex-1 items-end justify-center'
                  >
                    {bucket.value > 0 && (
                      <div
                        style={{
                          height: `${(bucket.value / axisMax) * 100}%`,
                        }}
                        className='relative w-full max-w-6'
                      >
                        <div
                          title={`${bucket.label}: ${formatCurrency(
                            bucket.value
                          )}`}
                          className='h-full w-full rounded-t-[4px] bg-[#2a78d6] dark:bg-[#3987e5]'
                        />
                        {index === maxIndex && (
                          <span className='absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-medium'>
                            {formatCompactCurrency(bucket.value)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Eje temporal */}
          <div className='mt-2 flex gap-[2px]'>
            {data.map((bucket, index) => (
              <span
                key={bucket.key}
                className='flex-1 text-center text-[11px] text-muted-foreground'
              >
                {index % labelEvery === 0 ? bucket.label : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      <details className='mt-4 text-sm'>
        <summary className='cursor-pointer text-muted-foreground hover:text-foreground'>
          Ver datos
        </summary>
        <table className='mt-2 w-full'>
          <thead>
            <tr className='border-b text-left text-xs text-muted-foreground'>
              <th className='py-1 font-medium capitalize'>{bucketName}</th>
              <th className='py-1 text-right font-medium'>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {data
              .filter((bucket) => bucket.value > 0)
              .map((bucket) => (
                <tr key={bucket.key} className='border-b last:border-0'>
                  <td className='py-1'>{bucket.label}</td>
                  <td className='py-1 text-right tabular-nums'>
                    {formatCurrency(bucket.value)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

export default RevenueChart
