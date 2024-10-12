import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-6 w-1/12' />
      <Skeleton className='h-8 w-1/4' />
      <Skeleton className='h-96' />
    </div>
  )
}

export default Loading
