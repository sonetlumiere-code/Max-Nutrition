import WelcomeClient from "@/components/emails/welcome-email"
import OrderDetails from "@/components/emails/order-details-email"
import PasswordReset from "@/components/emails/reset-password-email"
import VerificationEmail from "@/components/emails/verification-email"
import { PopulatedOrder } from "@/types/types"
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

export const sendWelcomeEmail = async ({
  email,
  userName,
}: {
  email: string
  userName: string
}) => {
  await resend.emails.send({
    from: resendEmail,
    to: email,
    subject: "¡Te damos la Bienvenida a Máxima Nutrición!",
    react: WelcomeClient({
      userName: userName,
    }) as ReactElement,
  })
}

export const sendOrderDetailsEmail = async ({
  email,
  order,
  orderLink,
}: {
  email: string
  order: PopulatedOrder
  orderLink: string
}) => {
  if (!email) {
    throw new Error("Email is required to send order details.")
  }

  await resend.emails.send({
    from: resendEmail,
    to: email,
    subject: "Detalles de tu pedido en Máxima Nutrición",
    react: OrderDetails({
      order,
      orderLink: `${baseUrl}/${orderLink}`,
    }) as ReactElement,
  })
}
