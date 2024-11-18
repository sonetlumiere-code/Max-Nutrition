import ProductItem from "./product-item"
import { getCategories } from "@/data/categories"

const ProductsList = async () => {
  const categories = await getCategories({
    include: {
      products: {
        where: {
          show: true,
        },
        include: {
          categories: true,
        },
      },
      promotions: true,
    },
  })

  return (
    <div className='grid gap-8'>
      {categories?.map((category) => (
        <div className='grid gap-4' key={category.id}>
          {category.products && category.products.length > 0 && (
            <>
              <h2 className='text-xl font-semibold'>{category.name}</h2>
              <div className='grid gap-6'>
                {category.products?.map(
                  (product) =>
                    product.show && (
                      <ProductItem key={product.id} product={product} />
                    )
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export default ProductsList

// "use client"

// import useSWR from "swr"
// import ProductItem from "./product-item"
// import { getCategories } from "@/data/categories"
// import { PopulatedCategory } from "@/types/types"

// const fetchCategories = async () => {
//   const categories = await getCategories({
//     include: {
//       products: {
//         where: {
//           show: true,
//         },
//         include: {
//           categories: true,
//         },
//       },
//       promotions: true,
//     },
//   })

//   return categories
// }

// const ProductsList = ({
//   initialCategories,
// }: {
//   initialCategories: PopulatedCategory[] | null
// }) => {
//   const { data: categories = initialCategories, mutate } = useSWR(
//     "categories",
//     fetchCategories,
//     {
//       fallbackData: initialCategories,
//       revalidateOnFocus: true,
//     }
//   )

//   return (
//     <div className='grid gap-8'>
//       {categories?.map((category) => (
//         <div className='grid gap-4' key={category.id}>
//           {category.products && category.products.length > 0 && (
//             <>
//               <h2 className='text-xl font-semibold'>{category.name}</h2>
//               <div className='grid gap-6'>
//                 {category.products?.map(
//                   (product) =>
//                     product.show && (
//                       <ProductItem key={product.id} product={product} />
//                     )
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       ))}
//     </div>
//   )
// }

// export default ProductsList
