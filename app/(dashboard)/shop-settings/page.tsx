// import { hasPermission } from "@/helpers/helpers"
import { redirect } from "next/navigation"

// const shopSettingsId = process.env.SHOP_SETTINGS_ID

const ShopSettingsPage = async () => {
  return redirect("/orders")

  // const session = await auth()
  // const user = session?.user

  // if (!user) {
  //   return redirect("/")
  // }

  // if (!hasPermission(user, "view:shopSettings")) {
  //   return redirect("/")
  // }

  // const settings = await getShopSettings({
  //   where: { id: shopSettingsId },
  //   include: {
  //     branches: {
  //       include: {
  //         operationalHours: true,
  //       },
  //     },
  //   },
  // })

  // return (
  //   <>
  //     <Breadcrumb>
  //       <BreadcrumbList>
  //         <BreadcrumbItem>
  //           <BreadcrumbLink>Inicio</BreadcrumbLink>
  //         </BreadcrumbItem>
  //         <BreadcrumbSeparator />
  //         <BreadcrumbItem>
  //           <BreadcrumbPage>Configuración</BreadcrumbPage>
  //         </BreadcrumbItem>
  //       </BreadcrumbList>
  //     </Breadcrumb>

  //     <h2 className='font-semibold text-lg'>Configuración</h2>

  //     {settings && <EditShopSettings settings={settings} />}
  //   </>
  // )
}

export default ShopSettingsPage
