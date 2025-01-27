import { hasPermission } from "@/helpers/helpers"
import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

export default async function AnalyiticsPage() {
  const session = await auth()

  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (!hasPermission(session.user, "view:analytics")) {
    return redirect("/welcome")
  }

  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Proximamente..</h1>
      </div>

      <pre className='text-xs'>{JSON.stringify(session, null, 4)}</pre>
    </>
  )
}
