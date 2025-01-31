// import CreateShopBranch from "@/components/dashboard/shop-branches/create-shop-branch/create-shop-branch"
// import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
// import { hasPermission } from "@/helpers/helpers"

const CreateShopBranchPage = async () => {
  // NEXT STEP
  return redirect("/welcome")

  // const session = await auth()
  // const user = session?.user

  // if (!user) {
  //   return redirect("/")
  // }

  // if (!hasPermission(user, "create:shopBranches")) {
  //   return redirect("/welcome")
  // }

  // return (
  //   <>
  //     <Breadcrumb>
  //       <BreadcrumbList>
  //         <BreadcrumbItem>
  //           <BreadcrumbLink>Inicio</BreadcrumbLink>
  //         </BreadcrumbItem>
  //         <BreadcrumbSeparator />
  //         <BreadcrumbItem>
  //           <BreadcrumbLink href='/shop-branches'>Sucursales</BreadcrumbLink>
  //         </BreadcrumbItem>
  //         <BreadcrumbSeparator />
  //         <BreadcrumbItem>
  //           <BreadcrumbPage>Agregar Sucursal</BreadcrumbPage>
  //         </BreadcrumbItem>
  //       </BreadcrumbList>
  //     </Breadcrumb>

  //     <CreateShopBranch />
  //   </>
  // )
}

export default CreateShopBranchPage
