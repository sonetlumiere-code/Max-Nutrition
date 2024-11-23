"use client"

import { cn } from "@/lib/utils"
import { FC, useEffect, useState } from "react"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

export interface ConfirmationOptions {
  catchOnCancel?: boolean
  variant?: "destructive" | "info"
  title: string
  description: string
  countDown?: number
}

interface ConfirmationDialogProps extends ConfirmationOptions {
  open: boolean
  onSubmit: () => void
  onClose: () => void
}

export const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  open,
  title,
  variant,
  description,
  onSubmit,
  onClose,
  countDown = 0,
}) => {
  const [seconds, setSeconds] = useState(countDown)

  useEffect(() => {
    setSeconds(countDown)
  }, [countDown])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (open && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [seconds, open])

  return (
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
          <div className='flex items-start'>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter>
          <div className='flex gap-2 justify-end'>
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              disabled={seconds > 0}
              onClick={onSubmit}
              className='w-24'
            >
              {seconds > 0 ? seconds : "Confirmar"}
            </Button>
            <Button variant='outline' onClick={onClose} autoFocus>
              Cancelar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
