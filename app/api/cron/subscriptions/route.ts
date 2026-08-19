import { NextRequest, NextResponse } from "next/server"
import { matchesCronSecret } from "@/lib/cron/auth"
import { generateSubscriptionOrders } from "@/lib/subscriptions/generate-orders"

export const dynamic = "force-dynamic"
// Generar muchos pedidos puede tardar más que el límite por defecto.
export const maxDuration = 60

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Genera los pedidos de las suscripciones que vencen hoy.
 *
 * Pensado para un cron diario: la función decide cuáles corresponden según el
 * día de la semana, y es idempotente, así que correrla de más no duplica
 * pedidos.
 */
export async function GET(request: NextRequest) {
  if (!CRON_SECRET) {
    console.error("CRON_SECRET no está configurado.")
    return new NextResponse(null, { status: 503 })
  }

  if (!matchesCronSecret(request.headers.get("authorization"), CRON_SECRET)) {
    return new NextResponse(null, { status: 401 })
  }

  try {
    const result = await generateSubscriptionOrders()

    if (result.skipped.length) {
      console.warn("Suscripciones salteadas:", result.skipped)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error corriendo las suscripciones:", error)
    return new NextResponse(null, { status: 500 })
  }
}
