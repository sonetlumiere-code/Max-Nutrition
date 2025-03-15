import { DEFAULT_REDIRECT_SHOP } from "@/routes"
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect(DEFAULT_REDIRECT_SHOP)
}
