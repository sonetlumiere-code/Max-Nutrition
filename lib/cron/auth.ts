import { timingSafeEqual } from "node:crypto"

/**
 * Compara el encabezado Authorization de una tarea programada contra el
 * secreto configurado.
 *
 * La comparación es en tiempo constante para no filtrar el secreto por el
 * tiempo de respuesta, y exige el prefijo "Bearer " que envía Vercel.
 */
export const matchesCronSecret = (
  authorizationHeader: string | null | undefined,
  secret: string | undefined
) => {
  if (!secret || !authorizationHeader) return false

  const received = Buffer.from(authorizationHeader)
  const expected = Buffer.from(`Bearer ${secret}`)

  // timingSafeEqual exige longitudes iguales; comparar antes no filtra nada
  // útil porque la longitud del secreto no es lo que lo protege.
  if (received.length !== expected.length) return false

  return timingSafeEqual(received, expected)
}
