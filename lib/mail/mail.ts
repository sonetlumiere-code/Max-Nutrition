import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const baseUrl = process.env.BASE_URL

export const sendVerificacionEmail = async (email: string, token: string) => {
  const confirmLink = `${baseUrl}/new-verification?token=${token}`

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Confirma tu Email",
    html: `<p>Click <a href="${confirmLink}">aquí</a> para confirmar tu email.</p>`,
  })
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${baseUrl}/new-password?token=${token}`

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Cambia tu contraseña",
    html: `<p>Click <a href="${resetLink}">aquí</a> para cambiar tu contraseña.</p>`,
  })
}
