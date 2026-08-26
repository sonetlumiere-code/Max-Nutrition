"use client"

/**
 * Muestra el error de un campo que es un objeto, no un valor suelto.
 *
 * `FormMessage` de shadcn mira la ruta exacta del campo. Cuando el esquema
 * valida un objeto anidado —la dirección de georef, por ejemplo— zod deja el
 * error en la ruta del hijo que falló (`addressGeoRef.calle.nombre`), así que
 * el campo padre no tiene nada que mostrar y el formulario se queda mudo: no
 * envía y no explica por qué.
 */

/** El primer mensaje que aparezca en un error, por más hondo que esté. */
const primerMensaje = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined

  if (
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message
  }

  for (const valor of Object.values(error)) {
    const mensaje = primerMensaje(valor)
    if (mensaje) return mensaje
  }

  return undefined
}

const NestedFormMessage = ({ error }: { error: unknown }) => {
  const mensaje = primerMensaje(error)

  if (!mensaje) return null

  return <p className='text-sm font-medium text-destructive'>{mensaje}</p>
}

export default NestedFormMessage
