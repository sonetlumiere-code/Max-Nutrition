import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className='flex flex-col gap-4'>
      <Skeleton className='h-6 w-1/4' />
      <div className='flex justify-between'>
        <Skeleton className='h-8 w-36' />
        <Skeleton className='h-10 w-1/12' />
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
