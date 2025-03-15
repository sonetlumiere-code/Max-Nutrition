import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <>
      <div className='w-full flex flex-col items-center justify-center'>
        <Skeleton className='w-full h-60 md:h-[38vh]' />
        <div className='w-full max-w-3xl mx-auto p-4 mt-4'>
          <div className='grid grid-cols-2 gap-4'>
            <Skeleton className='h-24' />
            <Skeleton className='h-24' />
          </div>
        </div>
        <div className='w-full grid gap-8 max-w-3xl mx-auto px-4 pt-5'>
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className='grid gap-4 w-full'>
              <Skeleton className='h-6 w-1/3' />
              <div className='grid gap-6'>
                {Array.from({ length: 2 }, (_, i) => (
                  <Skeleton key={i} className='h-20' />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Loading
