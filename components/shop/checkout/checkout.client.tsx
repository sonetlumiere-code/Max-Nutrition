"use client"

import dynamic from "next/dynamic"

const Checkout = dynamic(() => import("./checkout"), { ssr: false })

export default Checkout
