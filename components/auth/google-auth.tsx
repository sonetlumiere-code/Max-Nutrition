"use client"

import { signIn } from "next-auth/react"
import { Dispatch, SetStateAction } from "react"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { DEFAULT_REDIRECT } from "@/routes"

type GoogleAuthProps = {
  isSubmitting: boolean
  isGoogleLoading: boolean
  setIsGoogleLoading: Dispatch<SetStateAction<boolean>>
  redirectTo?: string
}

const GoogleAuth = ({
  isSubmitting,
  isGoogleLoading,
  setIsGoogleLoading,
  redirectTo,
}: GoogleAuthProps) => {
  const signInWithGoogle = async () => {
    try {
      setIsGoogleLoading(true)
      await signIn("google", {
        callbackUrl: redirectTo || DEFAULT_REDIRECT,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "La autenticación con Google ha fallado.",
        description: "Intenta nuevamente más tarde.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      variant='outline'
      type='button'
      disabled={isGoogleLoading || isSubmitting}
      onClick={signInWithGoogle}
    >
      {isGoogleLoading ? (
        <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        <Icons.google />
      )}
      Google
    </Button>
  )
}

export default GoogleAuth
