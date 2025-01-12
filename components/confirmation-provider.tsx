"use client"

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useMediaQuery } from "@/hooks/use-media-query"

export interface ConfirmationOptions {
  catchOnCancel?: boolean
  variant?: "destructive" | "info"
  title: string
  description: string
  countDown?: number
}

export const ConfirmationServiceContext = createContext<
  (options: ConfirmationOptions) => Promise<boolean>
>(Promise.reject)

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationOptions | null>(null)
  const [open, setOpen] = useState<boolean>(false)
  const [seconds, setSeconds] = useState<number>(0)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const awaitingPromiseRef = useRef<{
    resolve: (value: boolean) => void
    reject: (value: boolean) => void
  }>()

  const openConfirmation = (options: ConfirmationOptions) => {
    setConfirmationState(options)
    setSeconds(options.countDown || 0)
    setOpen(true)
    return new Promise<boolean>((resolve, reject) => {
      awaitingPromiseRef.current = { resolve, reject }
    })
  }

  const handleClose = () => {
    if (
      confirmationState &&
      confirmationState.catchOnCancel &&
      awaitingPromiseRef.current
    ) {
      awaitingPromiseRef.current.reject(false)
    }
    setOpen(false)
  }

  const handleSubmit = () => {
    if (awaitingPromiseRef.current) {
      awaitingPromiseRef.current.resolve(true)
    }
    setOpen(false)
  }

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

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setConfirmationState(null)
      }, 500)
    }
  }, [open])

  return (
    <ConfirmationServiceContext.Provider value={openConfirmation}>
      {children}
      {confirmationState && (
        <ConfirmationDialog
          open={open}
          onSubmit={handleSubmit}
          onClose={handleClose}
          seconds={seconds}
          isDesktop={isDesktop}
          {...confirmationState}
        />
      )}
    </ConfirmationServiceContext.Provider>
  )
}

export const useConfirmation = () => useContext(ConfirmationServiceContext)
