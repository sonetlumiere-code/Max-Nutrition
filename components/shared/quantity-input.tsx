import React from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface QuantityInputProps {
  value: number
  onIncrement: () => void
  onDecrement: () => void
  disabled?: boolean
  minQuantity?: number
}

export const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onIncrement,
  onDecrement,
  disabled = false,
  minQuantity = 1,
}) => {
  return (
    <div className='flex items-center border rounded-md justify-between max-w-24 h-10'>
      <Button
        type='button'
        variant='link'
        size='icon'
        className='rounded-full p-1 hover:bg-muted transition-colors'
        onClick={onDecrement}
        disabled={value <= minQuantity || disabled}
      >
        <Icons.minus className='w-4 h-4' />
      </Button>
      <div className='text-sm font-bold min-w-4 text-center'>{value}</div>
      <Button
        type='button'
        variant='link'
        size='icon'
        className='rounded-full p-1 hover:bg-muted transition-colors'
        onClick={onIncrement}
        disabled={disabled}
      >
        <Icons.plus className='w-4 h-4' />
      </Button>
    </div>
  )
}
