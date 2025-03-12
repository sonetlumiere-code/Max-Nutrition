import { ReactNode } from "react"

interface ShopLayoutProps {
  children: ReactNode
}

export default function ShopLayout({ children }: ShopLayoutProps) {
  return <div>{children}</div>
}
