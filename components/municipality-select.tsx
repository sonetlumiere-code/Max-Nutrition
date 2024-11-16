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
import { MunicipalitiesGeoRef } from "@/types/georef-types"

type MunicipalitySelectProps = {
  province: string
  value: string | undefined
  onChange: (value: string) => void
  isSubmitting: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const MunicipalitySelect = ({
  province,
  value,
  onChange,
  isSubmitting,
}: MunicipalitySelectProps) => {
  const apiGeoRef = process.env.NEXT_PUBLIC_API_GEOREF
  const params = new URLSearchParams()

  if (province) {
    params.append("provincia", province)
  }

  params.append("campos", "id, nombre")
  params.append("max", "135")

  const apiUrl = `${apiGeoRef}/municipios?${params.toString()}`

  const { data, error, isValidating } = useSWR<MunicipalitiesGeoRef>(
    province ? apiUrl : null,
    fetcher
  )

  const uniqueMunicipalities = data?.municipios
    ? Array.from(
        new Map(data.municipios.map((item) => [item.nombre, item])).values()
      )
    : []

  return (
    <FormItem>
      <FormLabel>Municipio/Comuna</FormLabel>
      <Select
        onValueChange={onChange}
        defaultValue={value}
        disabled={isSubmitting || !province || isValidating}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder='Selecciona el municipio/comuna' />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectGroup>
            {uniqueMunicipalities?.map((municipality) => (
              <SelectItem key={municipality.id} value={municipality.nombre}>
                {municipality.nombre}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )
}

export default MunicipalitySelect
