"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Icons } from "@/components/icons"

type DateRangeFilterProps = {
  /** Rango activo, en formato YYYY-MM-DD. */
  from?: string
  to?: string
  scope: string
}

/** Convierte una fecha del calendario a YYYY-MM-DD usando sus campos locales. */
const toDateParam = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${date.getFullYear()}-${month}-${day}`
}

const parseDateParam = (value?: string) => {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  const parsed = new Date(year, month - 1, day)

  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

const DateRangeFilter = ({ from, to, scope }: DateRangeFilterProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const selected: DateRange | undefined = from
    ? { from: parseDateParam(from), to: parseDateParam(to) }
    : undefined

  const onSelect = (range: DateRange | undefined) => {
    // Se navega recién cuando el rango está completo, para no recargar a medio
    // seleccionar.
    if (!range?.from || !range?.to) return

    setOpen(false)
    router.push(
      `/production?scope=${scope}&from=${toDateParam(
        range.from
      )}&to=${toDateParam(range.to)}`
    )
  }

  const label = selected?.from
    ? `${format(selected.from, "d MMM", { locale: es })} – ${
        selected.to ? format(selected.to, "d MMM yyyy", { locale: es }) : "…"
      }`
    : "Rango de fechas"

  return (
    <div className='flex items-center gap-1'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={selected?.from ? "default" : "outline"}
            className='justify-start text-left font-normal'
          >
            <Icons.calendar className='mr-2 h-4 w-4' />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='end'>
          <Calendar
            initialFocus
            mode='range'
            defaultMonth={selected?.from}
            selected={selected}
            onSelect={onSelect}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>

      {selected?.from && (
        <Button
          variant='ghost'
          size='icon'
          aria-label='Quitar el rango de fechas'
          onClick={() => router.push(`/production?scope=${scope}`)}
        >
          <Icons.x className='h-4 w-4' />
        </Button>
      )}
    </div>
  )
}

export default DateRangeFilter
