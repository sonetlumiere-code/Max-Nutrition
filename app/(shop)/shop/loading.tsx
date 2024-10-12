import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className='grid gap-8'>
      {Array.from({ length: 2 }, (_, i) => (
        <div key={i} className='grid gap-4'>
          <Skeleton className='h-6 w-1/3' />
          <div className='grid gap-6'>
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className='h-20' />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Loading
