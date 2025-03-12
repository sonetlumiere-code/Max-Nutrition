import { DEFAULT_REDIRECT } from "@/routes"
import { redirect } from "next/navigation"

const DefaultPage = () => {
  return redirect(DEFAULT_REDIRECT)
}

export default DefaultPage
