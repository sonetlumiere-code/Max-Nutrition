import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className='space-y-6 w-full max-w-3xl mx-auto pt-5 px-4 md:px-6'>
      <Skeleton className='w-36 h-10' />
      <div className='space-y-2'>
        <Skeleton className='w-48 h-6' />
        <Skeleton className='w-60 h-5' />
      </div>
      <div className='grid gap-6'>
        <Skeleton className='h-48' />
        <Skeleton className='h-48' />
        <Skeleton className='h-48' />
        <Skeleton className='h-48' />
      </div>
    </div>
  )
}

export default Loading
