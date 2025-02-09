/* eslint-disable @next/next/no-img-element */
import { Product } from "@prisma/client"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import dynamic from "next/dynamic"

const CartBadge = dynamic(
  () => import("@/components/shop/products/cart-badge"),
  {
    ssr: false,
  }
)

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className='flex items-start p-2 relative'>
      <div className='w-32 h-32 flex-shrink-0 overflow-hidden rounded-md mr-2 relative'>
        <CartBadge product={product} className='translate-y-[6.1rem]' />
        <img
          src={
            product.image
              ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${product.image}`
              : "/img/no-image.jpg"
          }
          alt={product.name}
          className='rounded-lg object-cover w-full h-full'
        />
      </div>
      <CardHeader className='text-start p-2'>
        <CardTitle className='text-base md:text-lg font-medium line-clamp-2'>
          {product.name}
        </CardTitle>
        <CardDescription className='mt-1 line-clamp-2'>
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className='absolute bottom-2 right-3 p-0'>
        <span className='text-base md:text-lg font-semibold md:font-bold'>
          ${product.price}
        </span>
      </CardFooter>
    </Card>
  )
}

export default ProductCard
