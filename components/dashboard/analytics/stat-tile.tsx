import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"

type StatTileProps = {
  label: string
  value: string
  hint?: string
  /** Variación porcentual contra el período anterior. */
  delta?: number | null
  comparisonLabel?: string
}

const StatTile = ({
  label,
  value,
  hint,
  delta,
  comparisonLabel,
}: StatTileProps) => {
  const hasDelta = delta !== null && delta !== undefined && Number.isFinite(delta)
  const isUp = hasDelta && delta > 0
  const isDown = hasDelta && delta < 0

  return (
    <Card>
      <CardContent className='p-4 md:p-5'>
        <p className='text-sm text-muted-foreground'>{label}</p>
        <p className='mt-1 text-2xl font-semibold tracking-tight md:text-3xl'>
          {value}
        </p>

        {hasDelta ? (
          <p className='mt-2 flex items-center gap-1 text-xs'>
            <span
              className={cn("inline-flex items-center gap-0.5 font-medium", {
                "text-emerald-700": isUp,
                "text-destructive": isDown,
                "text-muted-foreground": !isUp && !isDown,
              })}
            >
              {isUp && <Icons.arrowUp className='h-3 w-3' aria-hidden />}
              {isDown && <Icons.arrowDown className='h-3 w-3' aria-hidden />}
              {isUp ? "+" : ""}
              {delta.toFixed(1).replace(".", ",")}%
            </span>
            {comparisonLabel && (
              <span className='text-muted-foreground'>{comparisonLabel}</span>
            )}
          </p>
        ) : (
          hint && <p className='mt-2 text-xs text-muted-foreground'>{hint}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default StatTile
