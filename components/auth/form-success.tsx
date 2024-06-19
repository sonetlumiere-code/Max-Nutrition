import { Icons } from "@/components/icons"

type FormSuccessProps = {
  message: string
}

const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null

  return (
    <div className='bg-emerald-100 p-3 rounded-md flex items-center gap-x-2 text-emerald-500 text-sm'>
      <Icons.circleCheck className='w-4 h-4' />
      {message}
    </div>
  )
}

export default FormSuccess
