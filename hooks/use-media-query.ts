// hooks/use-media-query.ts
import { useEffect, useState } from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handleChange = () => setMatches(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)
    handleChange() // Check on mount (callback with the current value)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [query])

  return matches
}
