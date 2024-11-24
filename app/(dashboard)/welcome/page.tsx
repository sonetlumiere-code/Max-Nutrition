import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default async function WelcomePage() {
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    return redirect("/")
  }

  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Bienvenida Xime!</h1>
      </div>
    </>
  )
}
