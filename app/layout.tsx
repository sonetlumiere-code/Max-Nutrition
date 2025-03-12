import type { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { ConfirmationProvider } from "@/components/confirmation-provider"
import { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { TooltipProvider } from "@/components/ui/tooltip"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})
export const metadata: Metadata = {
  title: "Máxima Nutrición - Viandas para celiacos sin tacc",
  description:
    "TODO SIN GLUTEN. Viandas para celiacos y sin tacc. Solucioná tus comidas con opciones ricas y saludables hechas por una nutricionista.",
  icons: {
    icon: [
      {
        url: "/img/favicon.ico",
        href: "/img/favicon.ico",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <SessionProvider>
          <TooltipProvider>
            <ConfirmationProvider>
              {children}
              <Toaster />
            </ConfirmationProvider>
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
