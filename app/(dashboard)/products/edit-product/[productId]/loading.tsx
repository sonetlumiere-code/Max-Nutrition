import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className='flex flex-col gap-4 lg:gap-6'>
      <Skeleton className='h-5 w-48' />
      <div className='flex justify-between items-center'>
        <Skeleton className='h-7 w-32' />
        <Skeleton className='h-8 w-32' />
      </div>
      <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
        <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
          <Skeleton className='h-64' />
          <Skeleton className='h-64' />
          <Skeleton className='h-44' />
          <Skeleton className='h-44' />
        </div>
        <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
          <Skeleton className='h-96' />
          <Skeleton className='h-64' />
        </div>
      </div>
    </div>
  )
}

export default Loading
