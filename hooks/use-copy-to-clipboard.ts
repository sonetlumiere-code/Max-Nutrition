import { toast } from "@/components/ui/use-toast"

export function useCopyToClipboard() {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Texto copiado al portapapeles",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error al copiar el texto",
      })
    }
  }

  return { copyToClipboard }
}
