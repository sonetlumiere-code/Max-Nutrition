"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Button, buttonVariants } from "@/components/ui/button"
import { CreditCard, DollarSign } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { useState } from "react"

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className='space-y-6'>
      <div className='flex items-start'>
        <Link
          href='/shop'
          className={cn(buttonVariants({ variant: "ghost" }), "")}
        >
          <>
            <Icons.chevronLeft className='mr-2 h-4 w-4' />
            Volver a tienda
          </>
        </Link>
      </div>

      <div className='flex flex-col gap-8 max-w-4xl mx-auto'>
        <div className='grid gap-6'>
          <div>
            <h1 className='text-xl md:text-2xl font-bold'>Checkout</h1>
            <p className='text-muted-foreground'>
              Review your order and complete checkout.
            </p>
          </div>
          <div className='grid gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Resumen del pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Margherita Pizza</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>$12.99</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Chicken Teriyaki Bowl</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>$9.99</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Veggie Burrito</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>$8.99</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4'>
                  <div className='grid gap-2'>
                    <Label htmlFor='name'>Name</Label>
                    <Input id='name' placeholder='Enter your name' />
                  </div>
                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='city'>City</Label>
                      <Input id='city' placeholder='Enter your city' />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='state'>State</Label>
                      <Input id='state' placeholder='Enter your state' />
                    </div>
                  </div>
                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div className='grid gap-2'>
                      <Label htmlFor='zip'>Zip Code</Label>
                      <Input id='zip' placeholder='Enter your zip code' />
                    </div>
                    <div className='grid gap-2'>
                      <Label htmlFor='phone'>Phone</Label>
                      <Input id='phone' placeholder='Enter your phone number' />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className='text-xl'>Metodo de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4'>
                  <RadioGroup
                    defaultValue='card'
                    className='grid grid-cols-2 gap-4'
                  >
                    <div>
                      <RadioGroupItem
                        value='card'
                        id='card'
                        className='peer sr-only'
                      />
                      <Label
                        htmlFor='card'
                        className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                      >
                        <CreditCard className='mb-3 h-6 w-6' />
                        Mercado Pago
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value='cash'
                        id='cash'
                        className='peer sr-only'
                      />
                      <Label
                        htmlFor='cash'
                        className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                      >
                        <DollarSign className='mb-3 h-6 w-6' />
                        Efectivo
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className='grid gap-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Total del pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-2'>
                <div className='flex items-center justify-between'>
                  <span>Subtotal</span>
                  <span>$31.97</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span>Tax</span>
                  <span>$2.56</span>
                </div>
                <Separator />
                <div className='flex items-center justify-between font-bold'>
                  <span>Total</span>
                  <span>$34.53</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className='ml-auto'>
                {isLoading && (
                  <Icons.spinner className='w-4 h-4 animate-spin' />
                )}
                Place Order
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
