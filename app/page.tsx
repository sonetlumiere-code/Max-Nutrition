/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import {
  Card,
  CardDescription,
  CardHeader,
  CardImage,
  CardTitle,
} from "@/components/ui/card"
import { getShops } from "@/data/shops"
import { redirect } from "next/navigation"

const HomePage = async () => {
  const shops = await getShops({
    where: { isActive: true },
  })

  if (!shops?.length) {
    console.warn("No hay tiendas disponibles.")
    return (
      <div className='flex items-center justify-center h-screen'>
        <img
          src='img/logo-mxm.svg'
          alt='MXM Máxima Nutrición'
          className='opacity-30 w-96'
        />
      </div>
    )
  }

  if (shops.length === 1) {
    return redirect(`/${shops[0].key}`)
  }

  return (
    <div className='flex items-center justify-center min-h-screen p-4'>
      <div
        className='grid gap-6 place-items-center w-full max-w-5xl'
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
        }}
      >
        {shops.map((shop) => (
          <Link key={shop.id} href={`/${shop.key}`}>
            <Card className='w-80 shadow-lg overflow-hidden'>
              <CardImage
                src={
                  shop.bannerImage
                    ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${shop.bannerImage}`
                    : "/img/foods-banner.jpg"
                }
                alt={`${shop.name} image`}
                className='object-cover h-40'
              />
              <CardHeader>
                <CardTitle>{shop.name}</CardTitle>
                <CardDescription>
                  {shop.title}
                  <br />
                  {shop.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default HomePage
