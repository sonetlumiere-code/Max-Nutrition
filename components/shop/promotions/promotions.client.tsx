"use client"

import dynamic from "next/dynamic"

const Promotions = dynamic(() => import("./promotions"), { ssr: false })

export default Promotions
