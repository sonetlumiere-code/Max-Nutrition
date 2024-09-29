import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className='space-y-6'>
      <Skeleton className='w-1/6 h-10' />
      <Skeleton className='h-40' />
      <Skeleton className='h-40' />
    </div>
  )
}

export default Loading
