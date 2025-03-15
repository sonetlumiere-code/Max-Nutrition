import { ShopRoutes } from "@/routes"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

const HomePage = () => {
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
        <Card className='w-64 h-40 flex items-center justify-center text-center'>
          <CardContent>
            <Link
              href={ShopRoutes.FOODS}
              className='text-xl font-semibold text-primary hover:underline'
            >
              Viandas
            </Link>
          </CardContent>
        </Card>

        <Card className='w-64 h-40 flex items-center justify-center text-center'>
          <CardContent>
            <Link
              href={ShopRoutes.BAKERY}
              className='text-xl font-semibold text-primary hover:underline'
            >
              Pastelería
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HomePage
