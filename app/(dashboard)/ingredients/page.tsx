import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function IngredientsPage() {
  return (
    <>
      <div className='flex items-center'>
        <h1 className='text-lg font-semibold md:text-2xl'>Ingredientes</h1>
      </div>
      <div
        className='flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm'
        x-chunk='dashboard-02-chunk-1'
      >
        <div className='flex flex-col items-center gap-1 text-center'>
          <h3 className='text-2xl font-bold tracking-tight'>
            Todavía no tenes ningun ingrediente
          </h3>
          <p className='text-sm text-muted-foreground'>
            Cargá tu primer ingrediente haciendo click en el siguiente boton
          </p>

          <Button className='mt-4' asChild>
            <Link href='/ingredients/create-ingredient'>Crear ingrediente</Link>
          </Button>
        </div>
      </div>
    </>
  )
}
