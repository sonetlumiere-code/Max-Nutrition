export interface Province {
  id: string
  nombre: string
}

export interface Municipality {
  id: string
  nombre: string
}

export interface Locality {
  id: string
  nombre: string
}

export interface AddressesGeoRef {
  cantidad: number
  direcciones: AddressGeoRef[]
}

export interface AddressGeoRef {
  altura: Altura
  calle: Calle
  calle_cruce_1: Callecruce1
  calle_cruce_2: Callecruce1
  departamento: Municipality
  localidad_censal: Municipality
  nomenclatura: string
  piso?: string | null
  provincia: Province
  ubicacion: Ubicacion
}

interface Ubicacion {
  lat: number
  lon: number
}

interface Callecruce1 {
  categoria?: string | null
  id?: string | null
  nombre?: string | null
}

interface Calle {
  categoria: "CALLE" | "AV"
  id: string
  nombre: string
}

interface Altura {
  unidad: string | null
  valor: number
}
