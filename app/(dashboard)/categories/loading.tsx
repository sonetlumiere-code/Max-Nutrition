import { Skeleton } from "@/components/ui/skeleton"

const Loading = async () => {
  return (
    <div className='h-screen flex flex-col gap-4 lg:gap-6'>
      <Skeleton className='h-5 w-36' />
      <Skeleton className='h-8 w-32' />
      <Skeleton className='h-1/2' />
    </div>
  )
}

export default Loading
