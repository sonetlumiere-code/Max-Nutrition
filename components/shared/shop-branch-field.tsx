"use client"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { OrderSchema } from "@/lib/validations/order-validation"
import { Control } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { PopulatedShopBranch } from "@/types/types"
import { Label } from "../ui/label"
import ShopBranchData from "./checkout-shop-branch"

interface ShopBranchFieldProps {
  control: Control<OrderSchema>
  branches: PopulatedShopBranch[]
  isSubmitting: boolean
}

const ShopBranchField = ({
  control,
  branches,
  isSubmitting,
}: ShopBranchFieldProps) => {
  return (
    <FormField
      control={control}
      name='shopBranchId'
      render={({ field }) => (
        <FormItem className='space-y-3'>
          {branches.length > 1 && (
            <FormLabel>Selecciona una sucursal</FormLabel>
          )}
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className='space-y-3'
            >
              {branches.map((branch) => (
                <div key={branch.id}>
                  <RadioGroupItem
                    value={branch.id}
                    id={branch.id}
                    className='peer sr-only'
                    disabled={isSubmitting}
                  />
                  <Label
                    htmlFor={branch.id}
                    className='flex flex-col items-center justify-between text-center rounded-lg border-2 border-muted peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary'
                  >
                    <ShopBranchData shopBranch={branch} />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default ShopBranchField
