"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCallback, useState } from "react"
import useSWR from "swr"
import { useDebounce } from "use-debounce"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Icons } from "./icons"
import { AddressesGeoRef, AddressGeoRef } from "@/types/georef-types"

type SelectedAddress = Pick<
  AddressGeoRef,
  "altura" | "calle" | "departamento" | "provincia" | "nomenclatura"
>

interface AsyncSelectAddressProps {
  selected: SelectedAddress | null
  onChange: (value: SelectedAddress | null) => void
  disabled?: boolean
  className?: string
  province?: string
  municipality?: string
}

const apiGeoRef = process.env.NEXT_PUBLIC_API_GEOREF

const fetcher = (url: string) => fetch(url).then((res) => res.json())

function AsyncSelectAddress({
  selected,
  onChange,
  disabled,
  className,
  province,
  municipality,
}: AsyncSelectAddressProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500)

  const params = new URLSearchParams()

  if (debouncedSearchQuery) {
    params.append("direccion", debouncedSearchQuery)
  }

  if (province) {
    params.append("provincia", province)
  }

  if (municipality) {
    params.append("departamento", municipality)
  }

  const apiUrl = `${apiGeoRef}/direcciones?${params.toString()}`

  const { data, error, isValidating } = useSWR<AddressesGeoRef>(
    debouncedSearchQuery ? apiUrl : null,
    fetcher
  )

  const handleSelect = useCallback(
    (result: SelectedAddress) => {
      onChange(result)
      setOpen(false)
    },
    [onChange]
  )

  const renderItem = (address: SelectedAddress) =>
    `${address.calle.nombre}, ${address.departamento.nombre}, ${address.provincia.nombre}`

  const uniqueAddresses = data?.direcciones
    ? Array.from(
        new Map(data.direcciones.map((item) => [item.calle.id, item])).values()
      )
    : []

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger
        asChild
        className={cn("hover:bg-transparent hover:border-ring", className)}
      >
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className='w-full justify-between h-9'
          onClick={() => setOpen(!open)}
        >
          <div className='flex gap-1 flex-wrap align-middle'>
            {selected && (
              <Badge
                variant='outline'
                className='mr-1 capitalize'
                onClick={(e) => e.stopPropagation()}
              >
                {renderItem(selected).toLowerCase()}
                <span
                  className='ml-1 ring-offset-background rounded-full outline-none focus:ring-1 focus:ring-ring focus:ring-offset-2'
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onChange(null)
                    }
                  }}
                  onClick={() => {
                    onChange(null)
                  }}
                >
                  <Icons.x className='h-3 w-3' />
                </span>
              </Badge>
            )}
          </div>
          <Icons.chevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent side='bottom' className='p-0'>
        <Command shouldFilter={false}>
          <CommandInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            placeholder='Buscar dirección'
          />
          <CommandList>
            {isValidating && <div className='p-4 text-sm'>Buscando...</div>}
            {!isValidating &&
              debouncedSearchQuery &&
              uniqueAddresses.length === 0 && (
                <div className='p-4 text-sm'>No hay datos.</div>
              )}
            {uniqueAddresses.map((result) => (
              <CommandItem
                key={result.calle.id}
                onSelect={() =>
                  handleSelect({
                    altura: result.altura,
                    calle: result.calle,
                    departamento: result.departamento,
                    provincia: result.provincia,
                    nomenclatura: result.nomenclatura,
                  })
                }
                value={renderItem(result)}
              >
                <Icons.check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected && selected.calle === result.calle
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                <p className='capitalize'>{renderItem(result)}</p>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default AsyncSelectAddress
