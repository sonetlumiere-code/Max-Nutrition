// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import { useMediaQuery } from "@/hooks/use-media-query"
// import { Dispatch, SetStateAction } from "react"
// import { Button } from "@/components/ui/button"
// import { MoveLeftIcon } from "lucide-react"
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
// } from "@/components/ui/drawer"
// import { PopulatedOrder } from "@/types/types"
// import CustomerOrderHistoryDetail from "./customer-order-history-detail"

// type CustomerOrdersHistoryItemProps = {
//   open: boolean
//   setOpen: Dispatch<SetStateAction<boolean>>
//   orders: PopulatedOrder[]
// }

// const CustomerOrdersHistoryItem = ({
//   open,
//   setOpen,
//   orders,
// }: CustomerOrdersHistoryItemProps) => {
//   const isDesktop = useMediaQuery("(min-width: 768px)")

//   if (isDesktop) {
//     return (
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent className='sm:max-w-[600px]'>
//           <DialogHeader>
//             <DialogTitle>Historial de pedidos</DialogTitle>
//             <DialogDescription>Pedidos realizados</DialogDescription>

//             <CustomerOrderHistoryDetail />

//             <DialogFooter className='flex flex-col'>
//               <DialogClose asChild>
//                 <Button variant='outline'>
//                   <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver a la tienda
//                 </Button>
//               </DialogClose>
//             </DialogFooter>
//           </DialogHeader>
//         </DialogContent>
//       </Dialog>
//     )
//   }

//   return (
//     <Drawer open={open} onOpenChange={setOpen}>
//       <DrawerContent className='min-h-[40vh]'>
//         <DrawerHeader>
//           <DrawerTitle>Historial de pedidos</DrawerTitle>
//           <DrawerDescription>Pedidos realizados</DrawerDescription>
//         </DrawerHeader>

//         <CustomerOrderHistoryDetail />

//         <DrawerFooter className='border-t-2 lg:border-t-0'>
//           <DrawerClose asChild>
//             <Button variant='outline'>
//               <MoveLeftIcon className='w-4 h-4 mr-3' /> Volver a la tienda
//             </Button>
//           </DrawerClose>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   )
// }

// export default CustomerOrdersHistoryItem
