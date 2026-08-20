import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  // El tsconfig usa `jsx: preserve` porque de la transformación se encarga
  // Next. Vitest no pasa por Next, así que acá se le indica el runtime moderno
  // de React; sin esto un archivo con JSX no llega ni a parsearse.
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    // Los tests de lógica corren en node, que es más liviano. Los de
    // componentes piden jsdom archivo por archivo, con el comentario
    // `@vitest-environment jsdom` en la primera línea.
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
})
