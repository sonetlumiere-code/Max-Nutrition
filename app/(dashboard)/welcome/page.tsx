import { auth } from "@/lib/auth/auth"

export default async function WelcomePage() {
  const session = await auth()

  return (
    <div className='flex items-center'>
      <h1 className='text-lg font-semibold md:text-2xl'>Bienvenida Xime!</h1>
      {JSON.stringify(session, null, 4)}
    </div>
  )
}
