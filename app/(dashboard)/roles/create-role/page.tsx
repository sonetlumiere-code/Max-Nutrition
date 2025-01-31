// import CreateRole from "@/components/dashboard/roles/create-role/create-role"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
// import { getPermissions } from "@/data/permissions"
// import { hasPermission } from "@/helpers/helpers"
// import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"

const CreateRolePage = async () => {
  // NEXT STEP
  return redirect("/welcome")
  // const session = await auth()
  // const user = session?.user

  // if (!user) {
  //   return redirect("/")
  // }

  // if (!hasPermission(user, "create:roles")) {
  //   return redirect("/welcome")
  // }

  // const permissions = await getPermissions()

  // return (
  //   <>
  //     <Breadcrumb>
  //       <BreadcrumbList>
  //         <BreadcrumbItem>
  //           <BreadcrumbLink>Inicio</BreadcrumbLink>
  //         </BreadcrumbItem>
  //         <BreadcrumbSeparator />
  //         <BreadcrumbItem>
  //           <BreadcrumbLink href='/roles'>Roles</BreadcrumbLink>
  //         </BreadcrumbItem>
  //         <BreadcrumbSeparator />
  //         <BreadcrumbItem>
  //           <BreadcrumbPage>Agregar Rol</BreadcrumbPage>
  //         </BreadcrumbItem>
  //       </BreadcrumbList>
  //     </Breadcrumb>

  //     <h2 className='font-semibold text-lg'>Agregar Rol</h2>

  //     <CreateRole permissions={permissions} />
  //   </>
  // )
}

export default CreateRolePage
