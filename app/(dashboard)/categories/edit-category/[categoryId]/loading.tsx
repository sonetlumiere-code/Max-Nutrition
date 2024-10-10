import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className='h-screen flex flex-col gap-4 lg:gap-6'>
      <Skeleton className='h-5 w-48' />
      <Skeleton className='h-7 w-32' />
      <Skeleton className='h-1/3 max-w-screen-md' />
    </div>
  )
}

export default Loading
