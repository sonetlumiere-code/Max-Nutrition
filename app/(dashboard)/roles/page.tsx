// import DeleteRole from "@/components/dashboard/roles/delete-role/delete-role"
// import { Icons } from "@/components/icons"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
// import { Button, buttonVariants } from "@/components/ui/button"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { getRoles } from "@/data/roles"
// import { getPermissionsKeys, hasPermission } from "@/helpers/helpers"
// import { auth } from "@/lib/auth/auth"
// import { cn } from "@/lib/utils"
// import Link from "next/link"
import { redirect } from "next/navigation"

export default async function RolesPage() {
  // NEXT STEP
  return redirect("/welcome")
  // const session = await auth()
  // const user = session?.user

  // if (!user) {
  //   return redirect("/")
  // }

  // if (!hasPermission(user, "view:roles")) {
  //   return redirect("/welcome")
  // }

  // const userPermissionsKeys = getPermissionsKeys(
  //   session?.user.role?.permissions
  // )

  // const roles = await getRoles({
  //   include: {
  //     users: {
  //       select: {
  //         id: true,
  //       },
  //     },
  //     permissions: {
  //       select: {
  //         id: true,
  //       },
  //     },
  //   },
  // })
  // const rolesLength = roles?.length || 0

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
  //       </BreadcrumbList>
  //     </Breadcrumb>

  //     <div className='flex items-center'>
  //       <h1 className='text-lg font-semibold md:text-2xl'>Roles</h1>
  //     </div>

  //     {rolesLength > 0 ? (
  //       <Card>
  //         <CardHeader>
  //           <div className='space-between flex items-center'>
  //             <div className='max-w-screen-sm'>
  //               <CardTitle className='text-xl'>Roles</CardTitle>
  //               <CardDescription className='hidden md:block'>
  //                 Gestiona y actualiza los roles.
  //               </CardDescription>
  //             </div>
  //             {userPermissionsKeys.includes("create:roles") && (
  //               <div className='ml-auto'>
  //                 <Link
  //                   href='roles/create-role'
  //                   className={cn(buttonVariants({ variant: "default" }))}
  //                 >
  //                   <>
  //                     <Icons.circlePlus className='mr-2 h-4 w-4' />
  //                     Agregar
  //                   </>
  //                 </Link>
  //               </div>
  //             )}
  //           </div>
  //         </CardHeader>
  //         <CardContent>
  //           <Table>
  //             <TableHeader>
  //               <TableRow>
  //                 <TableHead>Nombre</TableHead>
  //                 <TableHead className='hidden md:table-cell'>
  //                   Usuarios
  //                 </TableHead>
  //                 <TableHead className='hidden md:table-cell'>
  //                   Permisos
  //                 </TableHead>
  //                 <TableHead className='text-end'>
  //                   <span>Acciones</span>
  //                 </TableHead>
  //               </TableRow>
  //             </TableHeader>
  //             <TableBody>
  //               {roles?.map((role) => (
  //                 <TableRow key={role.id}>
  //                   <TableCell>{role.name}</TableCell>
  //                   <TableCell className='hidden md:table-cell'>
  //                     {role.users.length}
  //                   </TableCell>
  //                   <TableCell className='hidden md:table-cell'>
  //                     {role.permissions.length}
  //                   </TableCell>
  //                   {(userPermissionsKeys.includes("update:roles") ||
  //                     userPermissionsKeys.includes("delete:roles")) && (
  //                     <TableCell className='text-end'>
  //                       <DropdownMenu modal={false}>
  //                         <DropdownMenuTrigger asChild>
  //                           <Button
  //                             aria-haspopup='true'
  //                             size='icon'
  //                             variant='ghost'
  //                           >
  //                             <Icons.moreHorizontal className='h-4 w-4' />
  //                             <span className='sr-only'>Mostrar menú</span>
  //                           </Button>
  //                         </DropdownMenuTrigger>
  //                         <DropdownMenuContent align='end'>
  //                           <DropdownMenuLabel>Acciones</DropdownMenuLabel>
  //                           {userPermissionsKeys.includes("update:roles") && (
  //                             <Link href={`roles/edit-role/${role.id}`}>
  //                               <DropdownMenuItem>
  //                                 <Icons.pencil className='w-4 h-4 mr-2' />
  //                                 Editar
  //                               </DropdownMenuItem>
  //                             </Link>
  //                           )}
  //                           {userPermissionsKeys.includes("delete:roles") && (
  //                             <DropdownMenuItem>
  //                               <DeleteRole role={role} />
  //                             </DropdownMenuItem>
  //                           )}
  //                         </DropdownMenuContent>
  //                       </DropdownMenu>
  //                     </TableCell>
  //                   )}
  //                 </TableRow>
  //               ))}
  //             </TableBody>
  //           </Table>
  //         </CardContent>
  //         <CardFooter>
  //           <div className='text-xs text-muted-foreground'>
  //             Mostrando <strong>{rolesLength}</strong> role
  //             {rolesLength > 1 ? "s" : ""}
  //           </div>
  //         </CardFooter>
  //       </Card>
  //     ) : (
  //       <div className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'>
  //         <div className='flex flex-col items-center gap-1 text-center'>
  //           <h3 className='text-2xl font-bold tracking-tight'>
  //             Todavía no tenés ningún rol
  //           </h3>
  //           {userPermissionsKeys.includes("create:roles") && (
  //             <>
  //               <p className='text-sm text-muted-foreground'>
  //                 Cargá tu primer rol haciendo click en el siguiente botón
  //               </p>

  //               <Button className='mt-4' asChild>
  //                 <Link href='/roles/create-role'>
  //                   <Icons.circlePlus className='mr-2 h-4 w-4' />
  //                   Agregar rol
  //                 </Link>
  //               </Button>
  //             </>
  //           )}
  //         </div>
  //       </div>
  //     )}
  //   </>
  // )
}
