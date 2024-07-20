"use client"

import React, { useState } from "react"
import DialogMenu from "./dialog-menu"
import DrawerMenu from "./drawer-menu"
import { Product } from "@prisma/client"

interface ProductItemProps {
  item: Product
  isDesktop: boolean
}

const ProductItem: React.FC<ProductItemProps> = ({ item, isDesktop }) => {
  const [open, setOpen] = useState(false)

  return isDesktop ? (
    <DialogMenu item={item} open={open} setOpen={setOpen} />
  ) : (
    <DrawerMenu item={item} open={open} setOpen={setOpen} />
  )
}

export default ProductItem
