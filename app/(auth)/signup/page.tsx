/* eslint-disable @next/next/no-img-element */
import SignUpForm from "@/components/auth/signup-form"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Crear cuenta - Máxima nutrición",
  description: "Crea una cuenta para comenzar.",
}

export default function SignupPage() {
  return (
    <div className='container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/login'
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
      >
        Iniciar sesión
      </Link>
      <div className='relative hidden h-full flex-col p-10 text-white dark:border-r lg:flex'>
        <div className='absolute inset-0 bg-[url("../public/img/banner-crearcuenta.webp")]' />
        <div className='relative z-20 flex items-center'>
          <Link href='/' className='block'>
            <span className='sr-only'>HOME</span>
            <img
              src='img/logo-mxm.svg'
              alt='MXM Máxima Nutrición'
              className='mx-auto py-4 invert'
            />
          </Link>
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            {/* <p className='text-md'>Máxima Nutrición</p> */}
            <footer className='text-sm'>Máxima Nutrición</footer>
          </blockquote>
        </div>
      </div>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Crear cuenta
            </h1>
            <p className='text-sm text-muted-foreground'>
              Introduce tu correo electrónico a continuación para crear tu
              cuenta
            </p>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
