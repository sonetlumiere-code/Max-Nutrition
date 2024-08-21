"use client"

import { useState } from "react"
import DialogMenu from "./dialog-menu"
import DrawerMenu from "./drawer-menu"
import { Product } from "@prisma/client"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ProductItemProps {
  item: Product
}

const ProductItem: React.FC<ProductItemProps> = ({ item }) => {
  const [open, setOpen] = useState(false)

  const isDesktop = useMediaQuery("(min-width: 768px)")

  return isDesktop ? (
    <DialogMenu item={item} open={open} setOpen={setOpen} />
  ) : (
    <DrawerMenu item={item} open={open} setOpen={setOpen} />
  )
}

export default ProductItem
