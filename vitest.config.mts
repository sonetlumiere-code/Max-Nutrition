import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    // Los tests de lógica corren en node, que es más liviano. Los de
    // componentes piden jsdom archivo por archivo, con el comentario
    // `@vitest-environment jsdom` en la primera línea.
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    // Los formularios del panel son grandes y el primer render de cada archivo
    // en jsdom se come varios segundos calentando. Con los 5 s por defecto, el
    // primer test de esos archivos falla por tiempo aunque el código esté bien.
    testTimeout: 20_000,
  },
})
