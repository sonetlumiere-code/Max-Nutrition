// import { Badge } from "@/components/ui/badge"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import { translateOrderStatus } from "@/helpers/helpers"
// import { cn } from "@/lib/utils"
// import { PopulatedOrder } from "@/types/types"
// import { Dispatch, SetStateAction } from "react"

// type OrdersTableProps = {
//   orders: PopulatedOrder[]
//   setSelectedOrder: Dispatch<SetStateAction<PopulatedOrder | null>>
// }

// const OrdersTable = ({ orders, setSelectedOrder }: OrdersTableProps) => {
//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>Cliente</TableHead>
//           <TableHead className='hidden sm:table-cell'>Entrega</TableHead>
//           <TableHead className='hidden sm:table-cell'>Estado</TableHead>
//           <TableHead className='hidden md:table-cell'>Fecha</TableHead>
//           <TableHead className='text-right'>Total</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {orders?.map((order) => (
//           <TableRow
//             key={order.id}
//             onClick={() => setSelectedOrder(order)}
//             className='hover:cursor-pointer'
//           >
//             <TableCell>
//               <div className='font-medium'>{order.customer?.name}</div>
//               <div className='hidden text-sm text-muted-foreground md:inline'>
//                 {order.customer?.user?.email}
//               </div>
//             </TableCell>
//             <TableCell className='hidden sm:table-cell'>
//               <Badge className='text-xs' variant='secondary'>
//                 {order.shippingMethod === "TAKE_AWAY" ? "Take Away" : "DELIVERY"}
//               </Badge>
//             </TableCell>
//             <TableCell className='hidden sm:table-cell'>
//               <Badge
//                 className={cn({
//                   "bg-amber-500 hover:bg-amber-500/80":
//                     order.status === "PENDING",
//                   "bg-sky-500 hover:bg-sky-500/80": order.status === "ACCEPTED",
//                   "bg-emerald-500 hover:bg-emerald-500/80":
//                     order.status === "COMPLETED",
//                   "bg-destructive hover:bg-destructive/80":
//                     order.status === "CANCELLED",
//                 })}
//               >
//                 {translateOrderStatus(order.status)}
//               </Badge>
//             </TableCell>
//             <TableCell className='hidden md:table-cell'>
//               {order.createdAt.toLocaleDateString("es-AR")}
//             </TableCell>
//             <TableCell className='text-right'>${order.total}</TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   )
// }

// export default OrdersTable
