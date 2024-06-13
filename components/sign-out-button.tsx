"use client"

import { signOut } from "next-auth/react"
import { ReactNode } from "react"

interface SignOutButtonProps {
  children?: ReactNode
}

const SignOutButton = ({ children }: SignOutButtonProps) => {
  return <span onClick={() => signOut()}>{children}</span>
}

export default SignOutButton
