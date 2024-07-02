import getSession from "@/lib/auth/get-session"

export default async function AnalyiticsPage() {
  const session = await getSession()

  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Proximamente..</h1>
        {JSON.stringify(session, null, 4)}
      </div>
    </>
  )
}
