"use client"

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useSWR from "swr"
import { LocalitiesGeoRef } from "@/types/georef-types"

type LocalitySelectProps = {
  province?: string
  municipality?: string
  value: string | undefined
  onChange: (value: string) => void
  isSubmitting: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const LocalitySelect = ({
  province,
  municipality,
  value,
  onChange,
  isSubmitting,
}: LocalitySelectProps) => {
  const apiGeoRef = process.env.NEXT_PUBLIC_API_GEOREF
  const params = new URLSearchParams()

  if (province) {
    params.append("provincia", province)
  }

  if (municipality) {
    params.append("municipio", municipality)
  }

  params.append("campos", "id, nombre")
  params.append("max", "895")

  const apiUrl = `${apiGeoRef}/localidades?${params.toString()}`

  const { data, error, isValidating } = useSWR<LocalitiesGeoRef>(
    province ? apiUrl : null,
    fetcher
  )

  const uniqueLocalities = data?.localidades
    ? Array.from(
        new Map(data.localidades.map((item) => [item.nombre, item])).values()
      )
    : []

  return (
    <FormItem>
      <FormLabel>Localidad/Barrio</FormLabel>
      <Select
        onValueChange={onChange}
        defaultValue={value}
        disabled={isSubmitting || !province || isValidating}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder='Selecciona una localidad' />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectGroup>
            {uniqueLocalities?.map((locality) => (
              <SelectItem key={locality.id} value={locality.nombre}>
                {locality.nombre}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )
}

export default LocalitySelect
