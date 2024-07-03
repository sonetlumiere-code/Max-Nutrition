"use client"

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  ConfirmationDialog,
  ConfirmationOptions,
} from "@/components/confirmation-dialog"

export const ConfirmationServiceContext = createContext<
  (options: ConfirmationOptions) => Promise<boolean>
>(Promise.reject)

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationOptions | null>(null)

  const [open, setOpen] = useState<boolean>(false)

  const awaitingPromiseRef = useRef<{
    resolve: (value: boolean) => void
    reject: (value: boolean) => void
  }>()

  const openConfirmation = (options: ConfirmationOptions) => {
    setConfirmationState(options)
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
    if (!open) {
      setTimeout(() => {
        setConfirmationState(null)
      }, 500)
    }
  }, [open])

  return (
    <ConfirmationServiceContext.Provider value={openConfirmation}>
      {children}

      <ConfirmationDialog
        open={open}
        onSubmit={handleSubmit}
        onClose={handleClose}
        {...(confirmationState as ConfirmationOptions)}
      />
    </ConfirmationServiceContext.Provider>
  )
}

export const useConfirmation = () => useContext(ConfirmationServiceContext)
