import { Icons } from "@/components/icons"
import CustomerEditAddressForm from "@/components/shop/customer/info/address/edit/customer-edit-address-form"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCustomer } from "@/data/customer"
import { getShop } from "@/data/shops"
import { auth } from "@/lib/auth/auth"
import { cn } from "@/lib/utils"
import { DEFAULT_REDIRECT_SHOP } from "@/routes"
import Link from "next/link"
import { redirect } from "next/navigation"

type CreateCustomerAddressProps = {
  params: {
    shopKey: string
    addressId: string
  }
  searchParams: {
    redirectTo?: string
  }
}

const EditCustomerAddressPage = async ({
  params,
  searchParams,
}: CreateCustomerAddressProps) => {
  const session = await auth()

  const { shopKey } = params
  const { redirectTo } = searchParams

  const shop = await getShop({
    where: { key: shopKey, isActive: true },
  })

  if (!shop) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  const customer = await getCustomer({
    where: {
      userId: session?.user.id,
    },
    include: {
      addresses: {
        orderBy: {
          createdAt: "asc",
        },
      },
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  })

  if (!customer) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  const customerAddresses = customer.addresses
  const addressToEdit = customerAddresses?.find(
    (address) => address.id === params.addressId
  )

  if (!addressToEdit) {
    return redirect(DEFAULT_REDIRECT_SHOP)
  }

  return (
    <div className='space-y-6 w-full max-w-3xl mx-auto pt-5 px-4 md:px-6'>
      <div className='flex items-start'>
        <Link
          href={redirectTo ? redirectTo : `/${shop.key}`}
          className={cn(buttonVariants({ variant: "ghost" }), "")}
        >
          <>
            <Icons.chevronLeft className='mr-2 h-4 w-4' />
            Volver
          </>
        </Link>
      </div>

      {customer && customerAddresses && addressToEdit && (
        <Card>
          <CardHeader>
            <CardTitle className='text-xl'>Editar dirección de envío</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <CustomerEditAddressForm
              address={addressToEdit}
              customerAddresses={customerAddresses}
              redirectTo={redirectTo ? redirectTo : `/${shop.key}`}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EditCustomerAddressPage
