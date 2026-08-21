import { defineConfig } from "eslint/config"
import nextCoreWebVitals from "eslint-config-next/core-web-vitals"

// Next 16 sacó `next lint`: ahora se corre ESLint directo (`npm run lint`) y el
// build ya no lintea. La configuración pasó al formato plano, que es lo único
// que soporta ESLint 9 en adelante.
export default defineConfig([
  {
    extends: [...nextCoreWebVitals],
  },
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
])
