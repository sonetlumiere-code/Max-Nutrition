"use client"

import dynamic from "next/dynamic"

const CartHeaderButton = dynamic(() => import("./cart-header-button"), {
  ssr: false,
})

export default CartHeaderButton
