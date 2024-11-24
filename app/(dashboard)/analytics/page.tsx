import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default async function AnalyiticsPage() {
  // const session = await getSession()
  const session = await auth()

  if (session?.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Proximamente..</h1>
        {JSON.stringify(session, null, 4)}
      </div>
    </>
  )
}
