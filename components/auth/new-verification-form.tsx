"use client"

import { Icons } from "@/components/icons"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { newVerification } from "@/actions/new-verification"
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

  const onSubmit = useCallback(async () => {
    if (success || error) {
      return
    }

    if (!token) {
      setError("El token no existe.")
      return
    }

    const res = await newVerification(token)

    if (res && res.success) {
      setSuccess(res.success)
    }

    if (res && res.error) {
      setError("Algo salió mal.")
    }
  }, [token, success, error])

  useEffect(() => {
    onSubmit()
  }, [onSubmit])

  return (
    <div className='grid gap-3'>
      {!success && !error && (
        <div className='flex justify-center items-center'>
          <Icons.spinner className='w-8 h-8 animate-spin' />
        </div>
      )}

      {!success && <FormError message={error} />}

      <FormSuccess message={success} />

      {(success || error) && (
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
