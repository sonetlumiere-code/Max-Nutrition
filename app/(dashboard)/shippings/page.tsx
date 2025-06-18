import EditShippingSettings from "@/components/dashboard/shippings/shipping-settings/edit-shipping-settings/edit-shipping-settings"
import ShippingZonesDataTable from "@/components/dashboard/shippings/shipping-zones/list/shipping-zones-data-table/shipping-zones-data-table"
import { Icons } from "@/components/icons"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getShopSettings } from "@/data/shop-settings"
import { getPermissionsKeys, hasPermission } from "@/helpers/helpers"
import { cn } from "@/lib/utils"
import { ShippingSettings } from "@prisma/client"
import Link from "next/link"
import { redirect } from "next/navigation"
import { DEFAULT_REDIRECT_DASHBOARD } from "@/routes"
import { verifySession } from "@/lib/auth/verify-session"

const shopSettingsId = process.env.SHOP_SETTINGS_ID

const Shippings = async () => {
  if (!shopSettingsId) {
    return <span>Es necesario el ID de la configuración de tienda.</span>
  }

  const session = await verifySession()
  const user = session?.user

  if (!user) {
    return redirect("/")
  }

  if (
    !hasPermission(user, "view:shippingZones") &&
    !hasPermission(user, "update:shippingSettings")
  ) {
    return redirect(DEFAULT_REDIRECT_DASHBOARD)
  }

  const userPermissionsKeys = getPermissionsKeys(
    session?.user.role?.permissions
  )

  const shopSettings = await getShopSettings({
    where: { id: shopSettingsId },
    include: {
      shippingSettings: true,
      shippingZones: true,
    },
  })

  const shippingSettings = shopSettings?.shippingSettings
  const shippingZones = shopSettings?.shippingZones

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Inicio</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/shippings'>Envíos</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Envíos</h1>
      </div>

      <div className='grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8'>
        <div className='grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8'>
          {shippingZones && shippingZones.length > 0 ? (
            <Card>
              <CardHeader>
                <div className='space-between flex items-center'>
                  <div className='max-w-screen-sm'>
                    <CardTitle className='text-xl'>Zonas de envío</CardTitle>
                    <CardDescription className='hidden md:block'>
                      Gestiona y actualiza tus zonas de envío.
                    </CardDescription>
                  </div>
                  {userPermissionsKeys.includes("create:shippingZones") && (
                    <div className='ml-auto'>
                      <Link
                        href='shippings/create-shipping-zone'
                        className={cn(buttonVariants({ variant: "default" }))}
                      >
                        <>
                          <Icons.circlePlus className='mr-2 h-4 w-4' />
                          Agregar
                        </>
                      </Link>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ShippingZonesDataTable shippingZones={shippingZones} />
              </CardContent>
            </Card>
          ) : (
            <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-64 p-6'>
              <div className='flex flex-col items-center gap-1 text-center'>
                <h3 className='text-2xl font-bold tracking-tight'>
                  Todavía no tenés ninguna zona de envío
                </h3>
                {userPermissionsKeys.includes("create:shippingZones") && (
                  <>
                    <p className='text-sm text-muted-foreground'>
                      Cargá tu primera zona de envío haciendo click en el
                      siguiente botón
                    </p>

                    <Button className='mt-4' asChild>
                      <Link href='/shippings/create-shipping-zone'>
                        <Icons.circlePlus className='mr-2 h-4 w-4' />
                        Agregar Zona de envío
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {hasPermission(user, "update:shippingSettings") && (
          <div className='grid auto-rows-max items-start gap-4 lg:gap-8'>
            <EditShippingSettings
              shippingSettings={shippingSettings as ShippingSettings}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default Shippings
