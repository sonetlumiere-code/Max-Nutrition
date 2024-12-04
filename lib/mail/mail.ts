import WelcomeClient from "@/components/emails/bienvenida-mx"
import OrderDetails from "@/components/emails/pedido-realizado-mx"
import PasswordReset from "@/components/emails/recuperar-password-mx"
import VerificationEmail from "@/components/emails/verificacion-mx"
import { PopulatedOrder } from "@/types/types"
import { ReactElement } from "react"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const baseUrl = process.env.BASE_URL

export const sendVerificacionEmail = async (email: string, token: string) => {
  const confirmLink = `${baseUrl}/new-verification?token=${token}`

  await resend.emails.send({
    from: "onboarding@resend.dev",
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
    from: "onboarding@resend.dev",
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
    from: "onboarding@resend.dev",
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
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Detalles de tu pedido en Máxima Nutrición",
    react: OrderDetails({
      order,
      orderLink: `${baseUrl}/${orderLink}`,
    }) as ReactElement,
  })
}
