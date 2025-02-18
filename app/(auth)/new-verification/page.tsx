import NewVerificationForm from "@/components/auth/new-verification-form"
import { Icons } from "@/components/icons"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

const NewVerificationPage = () => {
  return (
    <div className='container flex h-screen w-screen flex-col items-center justify-center'>
      <Link
        href='/'
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-4 top-4 md:left-8 md:top-8"
        )}
      >
        <>
          <Icons.chevronLeft className='mr-2 h-4 w-4' />
          Volver
        </>
      </Link>
      <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <Link href='/' className='block'>
            <span className='sr-only'>HOME</span>
            <Image
              src='/img/logo-mxm.svg'
              alt='Máxima Nutrición logo'
              height={36}
              width={120}
              quality={100}
              className='mx-auto py-6'
            />
          </Link>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Verificación de Email
          </h1>
          <p className='text-sm text-muted-foreground'>Confirmando tu Email</p>
        </div>

        <Suspense>
          <NewVerificationForm />
        </Suspense>

        <p className='px-8 text-center text-sm text-muted-foreground'>
          <Link
            href='/signup'
            className='hover:text-brand underline underline-offset-4'
          >
            ¿Aún no tenés cuenta? Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}

export default NewVerificationPage
