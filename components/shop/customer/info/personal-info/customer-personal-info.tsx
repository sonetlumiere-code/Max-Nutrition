import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PopulatedCustomer } from "@/types/types"
import CustomerEditPersonalInfo from "./edit/customer-edit-personal-info"

type CustomerPersonalInfoProps = {
  customer: PopulatedCustomer
}

const CustomerPersonalInfo = ({ customer }: CustomerPersonalInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <div className='space-between flex items-center'>
          <div className='max-w-screen-sm'>
            <CardTitle className='text-xl'>Mis datos</CardTitle>
            <CardDescription className='hidden md:block'>
              Información personal
            </CardDescription>
          </div>
          <div className='ml-auto'>
            <CustomerEditPersonalInfo customer={customer}>
              <Button type='button'>
                <Icons.pencil className='w-4 h-4 mr-1' />
                Editar
              </Button>
            </CustomerEditPersonalInfo>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          <div className='grid gap-1'>
            <p className='text-sm font-medium leading-none'>Nombre</p>
            <p className='text-sm text-muted-foreground'>
              {customer.name || customer.user?.name}
            </p>
          </div>

          <div className='grid gap-1'>
            <p className='text-sm font-medium leading-none'>Email</p>
            <p className='text-sm text-muted-foreground'>
              {customer.user?.email}
            </p>
          </div>

          <div className='grid gap-1'>
            <p className='text-sm font-medium leading-none'>Teléfono</p>
            <p className='text-sm text-muted-foreground'>
              {customer.phone || "-"}
            </p>
          </div>

          <div className='grid gap-1'>
            <p className='text-sm font-medium leading-none'>
              Fecha de nacimiento
            </p>
            <p className='text-sm text-muted-foreground'>
              {customer.birthdate?.toLocaleDateString() || "-"}
            </p>
          </div>

          <div className='grid gap-1'>
            <p className='text-sm font-medium leading-none'>
              Fecha de registro
            </p>
            <p className='text-sm text-muted-foreground'>
              {customer.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CustomerPersonalInfo
