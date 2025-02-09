import { Icons } from "./icons"

type LoadingOverlayProps = {
  message: string
}

const LoadingOverlay = ({ message }: LoadingOverlayProps) => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='flex flex-col items-center gap-3'>
        <Icons.spinner className='animate-spin h-16 w-16 text-white' />
        <p className='text-white'>{message}</p>
      </div>
    </div>
  )
}

export default LoadingOverlay
