"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { UserAuthSchema, zodAuthSchema } from "@/lib/validations/auth-validator"
import axios, { AxiosError } from "axios"
import { toast } from "@/components/ui/use-toast"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ClientSignUpForm = ({
  className,
  ...props
}: UserAuthFormProps) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserAuthSchema>({
    resolver: zodResolver(zodAuthSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: UserAuthSchema) => {
    try {
      const res = await axios.post("/api/auth/signup", data)

      if (res.status === 200) {
        toast({
          title: res.data.message,
          description: "La cuenta se ha creado correctamente.",
        })
      }
    } catch (error) {
      console.error(error)
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          toast({
            title: error.response?.data.message || "Email ya registrado.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Ha ocurrido un error.",
            description: "Por favor, intenta de nuevo más tarde.",
            variant: "destructive",
          })
        }
      }
    }
  }

  const signInWithGoogle = async () => {
    setIsGoogleLoading(true)
    // TO DO
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='grid gap-4'>
          <div className='grid gap-1.5'>
            <Label htmlFor='email'>Correo electrónico</Label>
            <Input
              id='email'
              placeholder='nombre@ejemplo.com'
              type='email'
              autoCapitalize='none'
              autoComplete='email'
              autoCorrect='off'
              disabled={isSubmitting || isGoogleLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className='px-1 text-xs text-red-600'>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className='grid gap-1.5'>
            <Label htmlFor='email'>Contraseña</Label>
            <Input
              id='password'
              placeholder='contraseña'
              type='password'
              autoCapitalize='none'
              autoComplete='password'
              autoCorrect='off'
              disabled={isSubmitting || isGoogleLoading}
              {...register("password")}
            />
            {errors?.password && (
              <p className='px-1 text-xs text-red-600'>
                {errors.password.message}
              </p>
            )}
          </div>
          <Button disabled={isSubmitting || isGoogleLoading}>
            {isSubmitting && (
              <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
            )}
            Crear cuenta con correo
          </Button>
        </div>
      </form>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>
            O crear cuenta con
          </span>
        </div>
      </div>

      <Button
        variant='outline'
        type='button'
        disabled={isSubmitting || isGoogleLoading}
        onClick={signInWithGoogle}
      >
        {isGoogleLoading ? (
          <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <Icons.google />
        )}
        Google
      </Button>
    </div>
  )
}
