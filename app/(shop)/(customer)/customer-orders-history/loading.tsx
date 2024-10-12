import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className='space-y-6'>
      <Skeleton className='w-36 h-10' />
      <Skeleton className='h-52' />
    </div>
  )
}

export default Loading
