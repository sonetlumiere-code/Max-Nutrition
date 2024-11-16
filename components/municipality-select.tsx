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
import { MunicipalitiesGeoRef } from "@/types/georef-types"

type MunicipalitySelectProps = {
  province: string
  value?: string
  onChange?: (value: string) => void
  isDisabled: boolean
}

const fetchMunicipalities = async (province: string, apiGeoRef: string) => {
  const params = new URLSearchParams()
  if (province) {
    params.append("provincia", province)
  }
  params.append("campos", "id, nombre")
  params.append("max", "135")

  const apiUrl = `${apiGeoRef}/municipios?${params.toString()}`
  const response = await fetch(apiUrl)
  const data: MunicipalitiesGeoRef = await response.json()

  return Array.from(
    new Map(
      data.municipios
        .sort((a, b) =>
          a.nombre.localeCompare(b.nombre, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        )
        .map((item) => [item.nombre, item])
    ).values()
  )
}

const MunicipalitySelect = ({
  province,
  value,
  onChange,
  isDisabled,
}: MunicipalitySelectProps) => {
  const apiGeoRef = process.env.NEXT_PUBLIC_API_GEOREF || ""

  const { data: uniqueMunicipalities = [], isValidating } = useSWR(
    province ? [province, apiGeoRef] : null,
    ([province, apiGeoRef]) => fetchMunicipalities(province, apiGeoRef)
  )

  return (
    <Select
      onValueChange={onChange}
      value={value}
      disabled={isDisabled || !province || isValidating}
    >
      <SelectTrigger>
        <SelectValue placeholder='Selecciona el municipio/comuna' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {uniqueMunicipalities.map((municipality) => (
            <SelectItem key={municipality.id} value={municipality.nombre}>
              {municipality.nombre}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default MunicipalitySelect
