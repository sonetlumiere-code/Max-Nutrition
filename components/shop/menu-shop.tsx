import React from "react"

const MenuShop = () => {
  return (
    <div className='flex flex-col w-full max-w-4xl mx-auto py-8 px-4 md:px-6'>
      <header className='flex items-center justify-between mb-8'>
        <div className='flex items-center gap-4'>
          <img
            src='img/placeholder.svg'
            width='48'
            height='48'
            alt='Restaurant Logo'
            className='rounded-full'
          />
          <h1 className='text-2xl font-bold'>Acme Restaurant</h1>
        </div>
        <p className='text-sm text-muted-foreground'>Est. 2015</p>
      </header>
      <div className='grid gap-8'>
        <div className='grid gap-4'>
          <h2 className='text-lg font-semibold'>Vegetarianos</h2>
          <div className='grid gap-6'>
            <div className='grid grid-cols-[auto_1fr_auto] items-center gap-4'>
              <img
                src='img/placeholder.svg'
                width='80'
                height='80'
                alt='Dish Image'
                className='rounded-lg object-cover'
              />
              <div className='space-y-1'>
                <h3 className='text-base font-semibold'>
                  Musaka de berenjenas
                </h3>
                <p className='text-sm text-muted-foreground line-clamp-2'>
                  Exquisita musaka griega con capas de berenjenas asadas, carne
                  de cordero, salsa de tomate y bechamel gratinada. Ideal para
                  una comida reconfortante.
                </p>
              </div>
              <p className='text-base font-semibold'>$4.000</p>
            </div>
            <div className='grid grid-cols-[auto_1fr_auto] items-center gap-4'>
              <img
                src='img/placeholder.svg'
                width='80'
                height='80'
                alt='Dish Image'
                className='rounded-lg object-cover'
              />
              <div className='space-y-1'>
                <h3 className='text-base font-semibold'>Calamari Fritti</h3>
                <p className='text-sm text-muted-foreground'>
                  Fried calamari rings served with a zesty marinara sauce.
                </p>
              </div>
              <p className='text-base font-semibold'>$12.99</p>
            </div>
          </div>
        </div>
        <div className='grid gap-4'>
          <h2 className='text-lg font-semibold'>Con carne</h2>
          <div className='grid gap-6'>
            <div className='grid grid-cols-[auto_1fr_auto] items-center gap-4'>
              <img
                src='img/placeholder.svg'
                width='80'
                height='80'
                alt='Dish Image'
                className='rounded-lg object-cover'
              />
              <div className='space-y-1'>
                <h3 className='text-base font-semibold'>Spaghetti Bolognese</h3>
                <p className='text-sm text-muted-foreground'>
                  Homemade pasta with a rich meat sauce.
                </p>
              </div>
              <p className='text-base font-semibold'>$16.99</p>
            </div>
            <div className='grid grid-cols-[auto_1fr_auto] items-center gap-4'>
              <img
                src='img/placeholder.svg'
                width='80'
                height='80'
                alt='Dish Image'
                className='rounded-lg object-cover'
              />
              <div className='space-y-1'>
                <h3 className='text-base font-semibold'>Grilled Salmon</h3>
                <p className='text-sm text-muted-foreground'>
                  Fresh salmon fillet grilled to perfection, served with a
                  lemon-dill sauce.
                </p>
              </div>
              <p className='text-base font-semibold'>$22.99</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuShop
