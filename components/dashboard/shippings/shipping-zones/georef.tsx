"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Province {
  id: string
  nombre: string
}

interface Municipality {
  id: string
  nombre: string
}

interface Address {
  calle: { nombre: string; id: string }
  provincia: { nombre: string }
  departamento: { nombre: string }
  altura: { valor: number }
  nomenclatura: string
}

export function AddressSelect() {
  const [provinces, setProvinces] = React.useState<Province[]>([])
  const [municipalities, setMunicipalities] = React.useState<Municipality[]>([])
  const [addresses, setAddresses] = React.useState<Address[]>([])
  const [selectedProvince, setSelectedProvince] = React.useState<string | null>(
    null
  )
  const [selectedMunicipality, setSelectedMunicipality] = React.useState<
    string | null
  >(null)
  const [addressQuery, setAddressQuery] = React.useState<string>("")
  const [selectedAddress, setSelectedAddress] = React.useState<string | null>(
    null
  )
  const [selectedAddressNumber, setSelectedAddressNumber] = React.useState<
    number | null
  >(null)

  // Fetch provinces when the component mounts
  React.useEffect(() => {
    async function fetchProvinces() {
      try {
        const response = await fetch(
          "https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre"
        )
        const data = await response.json()
        setProvinces(data.provincias)
      } catch (error) {
        console.error("Error fetching provinces:", error)
      }
    }
    fetchProvinces()
  }, [])

  // Fetch municipalities when a province is selected
  React.useEffect(() => {
    if (!selectedProvince) return

    async function fetchMunicipalities() {
      try {
        const response = await fetch(
          `https://apis.datos.gob.ar/georef/api/municipios?provincia=${selectedProvince}&campos=id,nombre&max=135`
        )
        const data = await response.json()
        setMunicipalities(data.municipios)
      } catch (error) {
        console.error("Error fetching municipalities:", error)
      }
    }
    fetchMunicipalities()
  }, [selectedProvince])

  // Debounce effect for address search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (addressQuery && selectedProvince) {
        fetchAddresses(addressQuery, selectedProvince)
      }
    }, 500) // Wait for 500ms before making the API call

    return () => clearTimeout(timer) // Clean up timeout on unmount
  }, [addressQuery, selectedProvince])

  // Fetch addresses based on input query and selected province
  const fetchAddresses = async (query: string, provinceId: string) => {
    try {
      const response = await fetch(
        `https://apis.datos.gob.ar/georef/api/direcciones?direccion=${encodeURIComponent(
          query
        )}&provincia=${provinceId}`
      )
      const data = await response.json()

      // Filter unique addresses by calle.id
      const uniqueAddresses: Address[] = []
      const uniqueIds = new Set()

      for (const address of data.direcciones) {
        if (!uniqueIds.has(address.calle.id)) {
          uniqueIds.add(address.calle.id)
          uniqueAddresses.push(address)
        }
      }

      setAddresses(uniqueAddresses)
    } catch (error) {
      console.error("Error fetching addresses:", error)
    }
  }

  // Handle address selection
  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address.nomenclatura)
    setSelectedAddressNumber(address.altura.valor)
  }

  return (
    <div>
      {/* Province Select */}
      <Select onValueChange={(value) => setSelectedProvince(value)}>
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Select a province' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Provinces</SelectLabel>
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {province.nombre}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Municipality Select */}
      <Select
        onValueChange={(value) => setSelectedMunicipality(value)}
        disabled={!selectedProvince || municipalities.length === 0}
      >
        <SelectTrigger className='w-[180px] mt-4'>
          <SelectValue placeholder='Select a municipality' />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Municipalities</SelectLabel>
            {municipalities.map((municipality) => (
              <SelectItem key={municipality.id} value={municipality.id}>
                {municipality.nombre}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* Address Input */}
      <input
        type='text'
        value={addressQuery}
        onChange={(e) => setAddressQuery(e.target.value)}
        placeholder='Enter your address'
        className='mt-4 p-2 border border-gray-300 rounded w-[180px]'
      />

      {/* Address Select */}
      {addresses.length > 0 && (
        <Select
          onValueChange={(value) => handleAddressSelect(JSON.parse(value))}
        >
          <SelectTrigger className='w-[180px] mt-4'>
            <SelectValue placeholder='Select your address' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Addresses</SelectLabel>
              {addresses.map((address) => (
                <SelectItem
                  key={address.calle.id}
                  value={JSON.stringify(address)}
                >
                  {`${address.calle.nombre} ${address.altura.valor}, ${address.departamento.nombre}, ${address.provincia.nombre}`}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {/* Display selected address */}
      {selectedAddress && (
        <div className='mt-4'>
          <p>
            <strong>Selected Address:</strong> {selectedAddress}
          </p>
          <p>
            <strong>Address Number:</strong> {selectedAddressNumber}
          </p>
        </div>
      )}
    </div>
  )
}
