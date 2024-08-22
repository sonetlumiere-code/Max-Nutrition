import { Product } from "@prisma/client"

/* eslint-disable @next/next/no-img-element */
interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className='grid grid-cols-[auto_1fr_auto] items-center gap-4 hover:cursor-pointer hover:shadow-sm'>
      <img
        src={
          product.image
            ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${product.image}`
            : "/img/no-image.jpg"
        }
        width='80'
        height='80'
        alt={product.name}
        className='rounded-lg object-cover'
      />
      <div className='space-y-1'>
        <h3 className='text-base text-left font-semibold'>{product.name}</h3>
        <p className='text-sm text-left text-muted-foreground line-clamp-2'>
          {product.description}
        </p>
      </div>
      <p className='text-base font-semibold'>${product.price}</p>
    </div>
  )
}

export default ProductCard
