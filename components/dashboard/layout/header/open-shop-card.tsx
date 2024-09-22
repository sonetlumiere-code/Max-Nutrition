import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const OpenShopCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Abrir tienda</CardTitle>
        <CardDescription>Horario activo: 7:00 hs a 23:00 hs</CardDescription>
      </CardHeader>
      <CardContent>
        <Button size='sm' className='w-full'>
          Abrir tienda
        </Button>
      </CardContent>
    </Card>
  )
}

export default OpenShopCard
