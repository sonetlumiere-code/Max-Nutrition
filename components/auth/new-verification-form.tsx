"use client"

import { Icons } from "@/components/icons"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { newVerification } from "@/actions/auth/new-verification"
import FormError from "@/components/auth/form-error"
import FormSuccess from "@/components/auth/form-success"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const NewVerificationForm = () => {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  // Que falte el token no necesita estado: se deduce al renderizar.
  const shownError = token ? error : "El token no existe."

  useEffect(() => {
    if (!token) return

    // El token se consume al verificarlo, así que si el efecto se rearma
    // mientras la llamada está en vuelo, se descarta la respuesta vieja en vez
    // de pisar el resultado de la nueva.
    let cancelado = false

    newVerification(token).then((res) => {
      if (cancelado) return

      if (res?.success) {
        setSuccess(res.success)
      }

      if (res?.error) {
        setError("Algo salió mal.")
      }
    })

    return () => {
      cancelado = true
    }
  }, [token])

  return (
    <div className='grid gap-3'>
      {!success && !shownError && (
        <div className='flex justify-center items-center'>
          <Icons.spinner className='w-8 h-8 animate-spin' />
        </div>
      )}

      {!success && <FormError message={shownError} />}

      <FormSuccess message={success} />

      {(success || shownError) && (
        <Link
          href='/login'
          className={cn(buttonVariants({ variant: "ghost" }), "")}
        >
          Iniciar sesión
        </Link>
      )}
    </div>
  )
}

export default NewVerificationForm
