"use client"

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
  value?: string
  onChange?: (value: string) => void
  isDisabled: boolean
}

const fetchLocalities = async (
  province: string,
  municipality: string | undefined,
  apiGeoRef: string
) => {
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
  const response = await fetch(apiUrl)
  const data: LocalitiesGeoRef = await response.json()

  return Array.from(
    new Map(data.localidades.map((item) => [item.nombre, item])).values()
  )
}

const LocalitySelect = ({
  province,
  municipality,
  value,
  onChange,
  isDisabled,
}: LocalitySelectProps) => {
  const apiGeoRef = process.env.NEXT_PUBLIC_API_GEOREF || ""

  const { data: uniqueLocalities = [], isValidating } = useSWR(
    province ? [province, municipality, apiGeoRef] : null,
    ([province, municipality, apiGeoRef]) =>
      fetchLocalities(province, municipality, apiGeoRef)
  )

  return (
    <Select
      onValueChange={onChange}
      value={value}
      disabled={isDisabled || !province || isValidating}
    >
      <SelectTrigger>
        <SelectValue placeholder='Selecciona una localidad/barrio' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {uniqueLocalities.map((locality) => (
            <SelectItem key={locality.id} value={locality.nombre}>
              {locality.nombre}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default LocalitySelect
