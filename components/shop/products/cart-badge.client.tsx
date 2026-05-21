"use client"

import dynamic from "next/dynamic"

const CartBadge = dynamic(() => import("./cart-badge"), { ssr: false })

export default CartBadge
