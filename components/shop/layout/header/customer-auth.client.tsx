"use client"

import dynamic from "next/dynamic"

const CustomerAuth = dynamic(() => import("./customer-auth"), { ssr: false })

export default CustomerAuth
