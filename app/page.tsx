import { DEFAULT_REDIRECT } from "@/routes"
import { redirect } from "next/navigation"

export default function HomePage() {
  redirect(DEFAULT_REDIRECT)
}
