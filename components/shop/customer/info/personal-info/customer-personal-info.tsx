import { PopulatedCustomer } from "@/types/types"

type CustomerPersonalInfoProps = {
  customer: PopulatedCustomer
}

const CustomerPersonalInfo = ({ customer }: CustomerPersonalInfoProps) => {
  return (
    <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
      <div className='grid gap-1'>
        <p className='text-sm font-medium leading-none'>Nombre</p>
        <p className='text-sm text-muted-foreground'>{customer.user?.name}</p>
      </div>

      <div className='grid gap-1'>
        <p className='text-sm font-medium leading-none'>Email</p>
        <p className='text-sm text-muted-foreground'>{customer.user?.email}</p>
      </div>

      <div className='grid gap-1'>
        <p className='text-sm font-medium leading-none'>Fecha de cumpleaños</p>
        <p className='text-sm text-muted-foreground'>
          {customer.birthdate?.toLocaleDateString()}
        </p>
      </div>

      <div className='grid gap-1'>
        <p className='text-sm font-medium leading-none'>Fecha de registro</p>
        <p className='text-sm text-muted-foreground'>
          {customer.createdAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

export default CustomerPersonalInfo
