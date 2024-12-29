import dynamic from "next/dynamic"
import { getPromotions } from "@/data/promotions"
import { Icons } from "../icons"
import { Card, CardContent } from "../ui/card"

const Promotions = dynamic(() => import("./promotions/promotions"), {
  ssr: false,
})

const ButtonsInfoShop = async () => {
  const promotions = await getPromotions({
    where: {
      isActive: true,
    },
  })

  return (
    <div className='w-full max-w-3xl mx-auto p-4'>
      <div className='grid grid-cols-2 gap-4'>
        <Card className='w-full cursor-pointer hover:bg-gray-50 transition-colors'>
          <CardContent className='flex flex-col items-center justify-center p-2 sm:p-4 h-full'>
            <Icons.truck className='w-8 h-8 mb-2' />
            <p className='text-center text-xs sm:text-sm'>
              Ver zonas y costos de envío
            </p>
          </CardContent>
        </Card>

        {promotions && promotions.length > 0 ? (
          <Promotions promotions={promotions}>
            <Card className='w-full cursor-pointer hover:bg-gray-50 transition-colors'>
              <CardContent className='flex flex-col items-center justify-center p-2 sm:p-4 h-full'>
                <Icons.badgePercent className='w-8 h-8 mb-2' />
                <p className='text-center text-xs sm:text-sm'>
                  Ver Promociones vigentes
                </p>
              </CardContent>
            </Card>
          </Promotions>
        ) : (
          <Card className='w-full'>
            <CardContent className='flex flex-col items-center justify-center p-2 sm:p-4 h-full'>
              <Icons.badgePercent className='w-8 h-8 mb-2' />
              <p className='text-center text-xs sm:text-sm'>
                Sin promociones disponibles
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ButtonsInfoShop
