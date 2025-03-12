"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoginSchema, loginSchema } from "@/lib/validations/login-validation"
import { login } from "@/actions/auth/login"
import { Icons } from "@/components/icons"
import GoogleAuth from "@/components/auth/google-auth"
import FormError from "@/components/auth/form-error"
import FormSuccess from "@/components/auth/form-success"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

type LoginFormProps = {
  redirectTo?: string
}

const LoginForm = ({ redirectTo }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)

  const searchParams = useSearchParams()
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "El email ya se encuentra registrado."
      : ""

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  async function onSubmit(values: LoginSchema) {
    setError("")
    setSuccess("")

    const res = await login({ values, redirectTo })

    if (res && res.success) {
      setSuccess(res.success)
    }

    if (res && res.error) {
      setError(res.error)
    }
  }

  return (
    <div className='grid gap-6'>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
          <div className='space-y-3'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='email'
                      disabled={isSubmitting || isGoogleLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='contraseña'
                        type={showPassword ? "text" : "password"}
                        autoCapitalize='none'
                        autoComplete='on'
                        disabled={isSubmitting || isGoogleLoading}
                        {...field}
                      />
                      <span className='absolute inset-y-0 end-1'>
                        <Button
                          type='button'
                          size='icon'
                          variant='ghost'
                          className='hover:bg-transparent'
                          disabled={isSubmitting || isGoogleLoading}
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          <span className='sr-only'></span>
                          {showPassword ? (
                            <Icons.eyeOff className='h-5 w-5' />
                          ) : (
                            <Icons.eye className='h-5 w-5' />
                          )}
                        </Button>
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                  <Button
                    size='sm'
                    variant='link'
                    asChild
                    className='px-0 font-normal'
                    disabled={isSubmitting || isGoogleLoading}
                  >
                    <Link href='/reset-password'>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </Button>
                </FormItem>
              )}
            />
          </div>

          <FormError message={error || urlError} />
          <FormSuccess message={success} />

          <Button type='submit' disabled={isSubmitting || isGoogleLoading}>
            {isSubmitting ? (
              <Icons.spinner className='w-4 h-4 animate-spin' />
            ) : (
              <>Iniciar sesión</>
            )}
          </Button>
        </form>
      </Form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            O continúa con
          </span>
        </div>
      </div>

      <GoogleAuth
        isSubmitting={isSubmitting}
        isGoogleLoading={isGoogleLoading}
        setIsGoogleLoading={setIsGoogleLoading}
        redirectTo={redirectTo}
      />
    </div>
  )
}

export default LoginForm
