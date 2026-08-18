import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Shop, ShopCategory } from "@prisma/client"
import {
  ArrowRight,
  CalendarCheck,
  ChefHat,
  HeartPulse,
  Truck,
  WheatOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { getShops } from "@/data/shops"

const shopFallbackBanner: Record<ShopCategory, string> = {
  [ShopCategory.FOOD]: "/img/foods-banner.jpg",
  [ShopCategory.BAKERY]: "/img/bakery-banner.jpg",
}

const getShopBanner = (shop: Shop) =>
  shop.bannerImage
    ? `${process.env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/${shop.bannerImage}`
    : shopFallbackBanner[shop.shopCategory] ?? "/img/no-image.jpg"

const features = [
  {
    icon: WheatOff,
    title: "Todo sin TACC",
    description:
      "El 100% de nuestro menú es libre de gluten. Sin contaminación cruzada, sin letra chica.",
  },
  {
    icon: HeartPulse,
    title: "Creado por una nutricionista",
    description:
      "Cada vianda está pensada para que comas rico y equilibrado, sin resignar salud.",
  },
  {
    icon: CalendarCheck,
    title: "Elegís semana a semana",
    description:
      "Armá tu pedido con las viandas que quieras y recibilo listo para resolver tu semana.",
  },
  {
    icon: Truck,
    title: "Envío a domicilio o retiro",
    description:
      "Te lo llevamos a tu casa o lo retirás por nuestras sucursales, como te quede mejor.",
  },
]

const steps = [
  {
    number: "1",
    title: "Elegí tus comidas",
    description:
      "Explorá el menú de viandas y pastelería, y agregá tus favoritas al carrito.",
  },
  {
    number: "2",
    title: "Confirmá tu pedido",
    description:
      "Elegí envío o retiro, tu método de pago, y listo: nosotros cocinamos por vos.",
  },
  {
    number: "3",
    title: "Disfrutá sin gluten",
    description:
      "Recibí tus viandas listas para calentar y comer. Tu semana, resuelta.",
  },
]

// Revalida la landing cada hora para reflejar cambios de tiendas activas.
export const revalidate = 3600

const HomePage = async () => {
  const shops = await getShops({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  })

  if (!shops?.length) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Image
          src='/img/logo-mxm.svg'
          alt='MXM Máxima Nutrición'
          width={288}
          height={110}
          className='opacity-30 w-72'
        />
      </div>
    )
  }

  if (shops.length === 1) {
    return redirect(`/${shops[0].key}`)
  }

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      {/* Header */}
      <header className='sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8'>
          <Image
            src='/img/logo-mxm.svg'
            alt='MXM Máxima Nutrición'
            width={116}
            height={44}
            priority
          />
          <nav className='flex items-center gap-2'>
            <Button variant='ghost' asChild className='hidden sm:inline-flex'>
              <Link href='/login' prefetch={false}>
                Iniciar sesión
              </Link>
            </Button>
            <Button asChild className='rounded-full'>
              <Link href='#tiendas'>Hacer mi pedido</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className='flex-1'>
        {/* Hero */}
        <section className='relative overflow-hidden'>
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0 bg-gradient-to-b from-amber-50/80 via-white to-white'
          />
          <div
            aria-hidden
            className='pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-amber-100/60 blur-3xl'
          />
          <div className='relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-28 lg:pt-20'>
            <div className='max-w-xl'>
              <span className='inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-900'>
                <WheatOff className='h-4 w-4' aria-hidden />
                100% libre de gluten · Sin TACC
              </span>
              <h1 className='mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl'>
                Comé rico y saludable,{" "}
                <span className='text-amber-600'>sin gluten</span>
              </h1>
              <p className='mt-6 text-lg leading-relaxed text-slate-600'>
                Viandas y pastelería artesanales para celíacos, creadas por una
                nutricionista. Elegí tus comidas de la semana, cocinamos por
                vos y las recibís donde quieras.
              </p>
              <div className='mt-8 flex flex-wrap items-center gap-3'>
                <Button size='lg' asChild className='rounded-full px-8'>
                  <Link href='#tiendas'>
                    Elegir mis viandas
                    <ArrowRight className='ml-2 h-4 w-4' aria-hidden />
                  </Link>
                </Button>
                <Button
                  size='lg'
                  variant='outline'
                  asChild
                  className='rounded-full px-8'
                >
                  <Link href='#como-funciona'>¿Cómo funciona?</Link>
                </Button>
              </div>
              <div className='mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500'>
                <span className='inline-flex items-center gap-2'>
                  <ChefHat className='h-4 w-4 text-amber-600' aria-hidden />
                  Elaboración propia
                </span>
                <span className='inline-flex items-center gap-2'>
                  <HeartPulse className='h-4 w-4 text-amber-600' aria-hidden />
                  Hecho por nutricionista
                </span>
                <span className='inline-flex items-center gap-2'>
                  <Truck className='h-4 w-4 text-amber-600' aria-hidden />
                  Envío o retiro
                </span>
              </div>
            </div>

            <div className='relative mx-auto hidden w-full max-w-lg lg:block'>
              <div className='absolute -left-6 -top-6 h-full w-full rounded-3xl bg-amber-100/70' />
              <Image
                src='/img/foods-banner.jpg'
                alt='Viandas caseras sin gluten'
                width={640}
                height={420}
                priority
                className='relative aspect-[4/3] w-full rounded-3xl object-cover shadow-xl'
              />
              <Image
                src='/img/bakery-banner.jpg'
                alt='Pastelería sin TACC'
                width={320}
                height={240}
                className='absolute -bottom-10 -right-6 aspect-[4/3] w-52 rounded-2xl border-4 border-white object-cover shadow-lg'
              />
            </div>
          </div>
        </section>

        {/* Tiendas */}
        <section id='tiendas' className='scroll-mt-20 bg-slate-50 py-20'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-2xl text-center'>
              <h2 className='text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                Nuestras tiendas
              </h2>
              <p className='mt-4 text-lg text-slate-600'>
                Elegí por dónde empezar: comidas listas para tu semana o
                pastelería para darte un gusto.
              </p>
            </div>
            <div className='mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2'>
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/${shop.key}`}
                  className='group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
                >
                  <div className='relative h-56 overflow-hidden'>
                    <Image
                      src={getShopBanner(shop)}
                      alt={shop.name}
                      fill
                      sizes='(min-width: 640px) 28rem, 100vw'
                      className='object-cover transition-transform duration-500 group-hover:scale-105'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent' />
                    <h3 className='absolute bottom-4 left-5 text-2xl font-bold text-white drop-shadow'>
                      {shop.name}
                    </h3>
                  </div>
                  <div className='p-6'>
                    <p className='font-medium text-slate-900'>{shop.title}</p>
                    <p className='mt-1 line-clamp-2 text-sm text-slate-600'>
                      {shop.description}
                    </p>
                    <span className='mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-700'>
                      Entrar a la tienda
                      <ArrowRight
                        className='h-4 w-4 transition-transform group-hover:translate-x-1'
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Por qué elegirnos */}
        <section className='py-20'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-2xl text-center'>
              <h2 className='text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                ¿Por qué Máxima Nutrición?
              </h2>
            </div>
            <div className='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
              {features.map((feature) => (
                <div key={feature.title} className='text-center sm:text-left'>
                  <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 sm:mx-0'>
                    <feature.icon className='h-6 w-6' aria-hidden />
                  </div>
                  <h3 className='mt-4 text-lg font-semibold text-slate-900'>
                    {feature.title}
                  </h3>
                  <p className='mt-2 text-sm leading-relaxed text-slate-600'>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section
          id='como-funciona'
          className='scroll-mt-20 bg-slate-50 py-20'
        >
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='mx-auto max-w-2xl text-center'>
              <h2 className='text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                Tu semana resuelta en 3 pasos
              </h2>
            </div>
            <div className='mx-auto mt-12 grid max-w-4xl gap-10 sm:grid-cols-3'>
              {steps.map((step) => (
                <div key={step.number} className='text-center'>
                  <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white'>
                    {step.number}
                  </div>
                  <h3 className='mt-5 text-lg font-semibold text-slate-900'>
                    {step.title}
                  </h3>
                  <p className='mt-2 text-sm leading-relaxed text-slate-600'>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className='py-20'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-center sm:px-16'>
              <div
                aria-hidden
                className='pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl'
              />
              <div
                aria-hidden
                className='pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl'
              />
              <h2 className='relative text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                ¿Arrancamos con tu semana?
              </h2>
              <p className='relative mx-auto mt-4 max-w-xl text-lg text-slate-300'>
                Armá tu pedido en minutos y despreocupate de cocinar. Todo
                rico, todo saludable, todo sin TACC.
              </p>
              <Button
                size='lg'
                asChild
                className='relative mt-8 rounded-full bg-amber-500 px-10 text-slate-900 hover:bg-amber-400'
              >
                <Link href='#tiendas'>
                  Hacer mi pedido
                  <ArrowRight className='ml-2 h-4 w-4' aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-slate-100 bg-white'>
        <div className='mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8'>
          <Image
            src='/img/logo-mxm.svg'
            alt='MXM Máxima Nutrición'
            width={90}
            height={34}
            className='opacity-70'
          />
          <p className='text-sm text-slate-500'>
            © {new Date().getFullYear()} Máxima Nutrición — Viandas para
            celíacos, sin TACC.
          </p>
          <nav className='flex gap-4 text-sm text-slate-500'>
            {shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/${shop.key}`}
                className='hover:text-slate-900'
              >
                {shop.name}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
