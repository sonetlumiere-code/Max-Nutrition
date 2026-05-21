"use client"

import dynamic from "next/dynamic"

const CartFixedButton = dynamic(() => import("./cart-fixed-button"), {
  ssr: false,
})

export default CartFixedButton
