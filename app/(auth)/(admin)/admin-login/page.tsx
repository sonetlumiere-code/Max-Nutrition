import { AdminLoginForm } from "@/components/auth/admin/admin-login-form"
import Image from "next/image"
import Link from "next/link"

export default function AdminLoginPage() {
  return (
    <div className='container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='relative hidden h-full flex-col p-10 text-white dark:border-r lg:flex'>
        <div className='absolute inset-0 bg-[url("../public/img/admin-login.jpg")]' />
        <div className='relative z-20 flex items-center'>
          <Link href='/' className='block'>
            <span className='sr-only'>Home</span>
            <Image
              src='/img/logo.png'
              alt='Máxima nutrición logo'
              height={36}
              width={120}
              quality={100}
            />
          </Link>
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-md'>Máxima nutrición</p>
            <footer className='text-sm'>Máxima nutrición</footer>
          </blockquote>
        </div>
      </div>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Iniciar sesión
            </h1>
            <p className='text-sm text-muted-foreground'>
              Introduce tu correo electrónico a continuación para crear tu
              cuenta
            </p>
          </div>
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
