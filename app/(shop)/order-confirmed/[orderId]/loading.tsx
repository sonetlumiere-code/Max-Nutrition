import { Skeleton } from "@/components/ui/skeleton"

const Loading = () => {
  return (
    <div className='space-y-6 w-full max-w-3xl mx-auto pt-5 px-4 md:px-6'>
      <Skeleton className='w-36 h-10' />
      <Skeleton className='h-[80dvh]' />
    </div>
  )
}

export default Loading
