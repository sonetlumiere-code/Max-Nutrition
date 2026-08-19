import WelcomeClient from "@/components/emails/welcome-email"
import OrderDetails from "@/components/emails/order-details-email"
import OrderStatusEmail from "@/components/emails/order-status-email"
import PasswordReset from "@/components/emails/reset-password-email"
import VerificationEmail from "@/components/emails/verification-email"
import { orderStatusSubject } from "@/lib/mail/order-status-copy"
import { PopulatedOrder } from "@/types/types"
import { OrderStatus, ShippingMethod } from "@prisma/client"
import { ReactElement } from "react"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const resendEmail = process.env.RESEND_EMAIL
const baseUrl = process.env.BASE_URL

if (!resendEmail) {
  throw new Error("RESEND_EMAIL is not defined in the environment variables.")
}

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${baseUrl}/new-verification?token=${token}`

  await resend.emails.send({
    from: resendEmail,
    to: email,
    subject: "Confirma tu Email",
    react: VerificationEmail({
      confirmLink: `${confirmLink}`,
    }) as ReactElement,
  })
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/new-password?token=${token}`

  await resend.emails.send({
    from: resendEmail,
    to: email,
    subject: "Cambia tu contraseña",
    react: PasswordReset({
      userName: email,
      resetLink: resetLink,
    }) as ReactElement,
  })
}

/**
 * Aviso de bienvenida.
 *
 * Como todos los avisos, nunca lanza: que falle no puede romper la
 * verificación de la cuenta, que para este punto ya ocurrió.
 */
export const sendWelcomeEmail = async ({
  email,
  userName,
}: {
  email: string
  userName: string
}) => {
  if (!email) return false

  try {
    await resend.emails.send({
      from: resendEmail,
      to: email,
      subject: "¡Te damos la Bienvenida a Máxima Nutrición!",
      react: WelcomeClient({
        userName: userName,
      }) as ReactElement,
    })

    return true
  } catch (error) {
    console.error("Error enviando el email de bienvenida:", error)
    return false
  }
}

/**
 * Avisa al cliente que su pedido cambió de estado.
 *
 * Nunca lanza: que falle el aviso no puede impedir que el pedido se actualice.
 * Devuelve si el mail llegó a enviarse, para poder registrarlo.
 */
export const sendOrderStatusEmail = async ({
  email,
  customerName,
  status,
  shippingMethod,
  orderLink,
}: {
  email?: string | null
  customerName: string
  status: OrderStatus
  shippingMethod: ShippingMethod
  orderLink: string
}) => {
  const subject = orderStatusSubject(status)

  // Sin dirección o sin un estado que amerite aviso, no se manda nada.
  if (!email || !subject) return false

  try {
    await resend.emails.send({
      from: resendEmail,
      to: email,
      subject,
      react: OrderStatusEmail({
        customerName,
        status,
        shippingMethod,
        orderLink: `${baseUrl}${orderLink}`,
      }) as ReactElement,
    })

    return true
  } catch (error) {
    console.error("Error enviando aviso de estado de pedido:", error)
    return false
  }
}

/**
 * Detalle del pedido recién creado.
 *
 * Es un aviso: el pedido ya está guardado, así que un fallo de Resend se
 * registra y se sigue adelante en vez de hacer fracasar la compra.
 */
export const sendOrderDetailsEmail = async ({
  email,
  order,
  orderLink,
}: {
  email: string
  order: PopulatedOrder
  orderLink: string
}) => {
  if (!email) return false

  try {
    await resend.emails.send({
      from: resendEmail,
      to: email,
      subject: "Detalles de tu pedido en Máxima Nutrición",
      react: OrderDetails({
        order,
        orderLink: `${baseUrl}/${orderLink}`,
      }) as ReactElement,
    })

    return true
  } catch (error) {
    console.error("Error enviando el detalle del pedido:", error)
    return false
  }
}
