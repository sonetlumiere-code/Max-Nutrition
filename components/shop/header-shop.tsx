import { Icons } from "@/components/icons"

const HeaderShop = () => {
  return (
    <header className='text-center min-h-11 py-16 md:py-32 bg-orange-200 mb-5 relative'>
      <div
        style={{
          backgroundImage: "url('/img/portada-header.jpg')",
          backgroundSize: "cover",
        }}
        className='absolute inset-0'
      >
        <div className='absolute inset-0 bg-black bg-opacity-80' />
      </div>
      <div className='relative z-10 px-5'>
        <h1 className='text-4xl md:text-5xl text-balance font-bold py-2 text-red-400 md:max-w-[20ch] mx-auto'>
          Comida saludable, directamente a tu casa
        </h1>
        <h2 className='text-xl flex items-center justify-center text-white'>
          Y lo mejor ¡Todo sin gluten!
          <span className='flex items-center justify-center w-8 h-8'>
            <Icons.wheatOff className='w-4 h-4' />
          </span>
        </h2>
      </div>
    </header>
  )
}

export default HeaderShop
