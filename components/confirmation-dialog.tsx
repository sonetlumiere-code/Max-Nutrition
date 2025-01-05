"use client"

import { cn } from "@/lib/utils"
import { FC } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer"
import { Icons } from "./icons"

interface ConfirmationDialogProps {
  open: boolean
  isDesktop: boolean
  seconds: number
  title: string
  description: string
  variant?: "destructive" | "info"
  onSubmit: () => void
  onClose: () => void
}

export const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  open,
  isDesktop,
  title,
  description,
  variant,
  seconds,
  onSubmit,
  onClose,
}) => {
  return isDesktop ? (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle
            className={cn(
              { "text-destructive": variant === "destructive" },
              "text-start"
            )}
          >
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            disabled={seconds > 0}
            onClick={onSubmit}
            className='w-24'
          >
            {seconds > 0 ? seconds : "Confirmar"}
          </Button>
          <Button variant='outline' onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={open} onOpenChange={(isOpen) => (!isOpen ? onClose() : null)}>
      <DrawerContent className='min-h-[40vh]'>
        <DrawerHeader>
          <DrawerTitle
            className={cn({ "text-destructive": variant === "destructive" })}
          >
            {title}
          </DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className='border-t-2 lg:border-t-0'>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            disabled={seconds > 0}
            onClick={onSubmit}
          >
            {seconds > 0 ? seconds : "Confirmar"}
          </Button>
          <DrawerClose asChild>
            <Button variant='outline'>
              <Icons.moveLeftIcon className='w-4 h-4 mr-3' /> Volver
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
