"use client"
import React, { useState } from "react"
import DialogMenu from "./dialog-menu"
import DrawerMenu from "./drawer-menu"

interface ProductItemProps {
  item: {
    id: number
    title: string
    description: string
    price: number
    image: string
    options: Array<{ value: string; label: string }>
  }
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
