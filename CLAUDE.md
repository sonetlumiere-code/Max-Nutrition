# Notas para trabajar en este repo

Máxima Nutrición: tienda de viandas sin TACC. Next.js 15 (App Router), Prisma
sobre Postgres, NextAuth, Tailwind con shadcn/ui, Resend para mails y Mercado
Pago para el cobro online.

Lo que sigue es lo que no se deduce leyendo el código y ya costó caro
redescubrir.

## Antes de tocar nada

- **Leé [docs/invariantes.md](docs/invariantes.md).** Son las reglas de negocio
  que no se pueden romper, cada una con el test que la sostiene. Si un cambio
  hace fallar uno de esos tests, la pregunta es si de verdad se quiere cambiar
  la regla, no cómo arreglar el test.
- **Los tests se corren.** `npm test`: todo es lógica pura o corre con la base
  doblada, así que no hace falta levantar infraestructura. No hay CI todavía,
  así que corren cuando alguien se acuerda.
- **La aritmética de dinero vive en un solo lugar:** `lib/orders/pricing.ts`. La
  comparten la creación manual y la generación automática de suscripciones para
  que un pedido recurrente no se cobre distinto que el mismo pedido hecho a
  mano.

## La base de datos es productiva

- Es **Neon en la nube y tiene datos reales**. No hay carpeta de migraciones:
  el esquema se sincroniza con `npx prisma db push`.
- **Confirmá cualquier cambio de esquema con el dueño del proyecto antes de
  aplicarlo.** Para ver el SQL exacto sin tocar nada:

  ```bash
  npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
  ```

- **Nunca uses `--accept-data-loss` sin haber verificado qué borraría.** Contá
  las filas afectadas primero; si se pierde algo, es una decisión del dueño, no
  tuya.
- Agregar una columna con `@default` es seguro y no necesita backfill. Borrar
  una columna no se puede deshacer.

## Credenciales

No cargues secretos por nadie. `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET` y
`CRON_SECRET` los carga el dueño del proyecto en `.env` y en Vercel, y también
es quien registra el webhook en el panel de Mercado Pago. Sin esas variables el
pago online y las suscripciones quedan inactivos a propósito, y el resto de la
aplicación sigue funcionando. Ver [docs/operaciones.md](docs/operaciones.md).

## Verificar cambios detrás del login

El panel está detrás de sesión y no hay forma de autenticarse desde una
herramienta. El patrón que funciona: crear una página temporal en
`app/<algo>.tmp/page.tsx` —el punto en el nombre la deja fuera del matcher
del proxy—, comprobar ahí contra la base real, y **borrarla al terminar**.

Sirve tanto para verificar consultas del servidor como para renderizar un
componente de cliente con datos reales y revisarlo en el navegador.

## Entorno de desarrollo (Windows)

- **Parar el dev server antes de buildear.** En Windows bloquea el DLL de
  Prisma y el build falla con `EPERM ... query_engine-windows.dll.node`.
- **Si el build se cuelga o tira errores internos raros, es la caché.** Primero
  `npx tsc --noEmit` para separar errores de tipos del pipeline de Next; si los
  tipos están limpios, borrar `.next` y rebuildear.
- El build tarda entre 20 s y 5 minutos según la carga de la máquina.
  Conviene lanzarlo en segundo plano en vez de arriesgar un timeout que deje el
  lock tomado. No lanzar dos builds concurrentes sobre el mismo `.next`.
- Después de borrar una página `.tmp`, borrar también `.next/types`: quedan
  tipos generados que apuntan al archivo que ya no está y `tsc` los reporta.
- **En PowerShell 5.1 no pongas comillas dobles dentro de un mensaje de
  commit:** rompe la tokenización de argumentos.

## Convenciones del código

- Los comentarios explican **por qué**, no qué hace la línea de abajo. Están en
  español, igual que los nombres de los tests y los mensajes al usuario. Los
  mensajes de commit están en inglés.
- La lógica pura va a `helpers/` o `lib/`, separada de las pantallas, y se
  testea. `helpers/production.ts` es el ejemplo: lo comparten la pantalla de
  producción y la exportación a Excel justamente para que los dos números no se
  separen con el tiempo.
- `helpers/` es código que también corre en el navegador; lo que necesite
  `server-only` o el cliente de Prisma va a `lib/` o `data/`.
- Los `import "server-only"` son deliberados. Si un test necesita ese módulo, se
  doblan con `vi.mock`, que evita cargarlo.
- Los tests de componentes van en `tests/*.test.tsx` y piden jsdom con
  `// @vitest-environment jsdom` en la primera línea; el resto corre en node,
  que es más liviano. El JSX lo transforma vitest tomando el `jsx: react-jsx`
  del tsconfig, que mantiene Next: si alguien lo vuelve a `preserve`, los tests
  de componentes dejan de parsear y hay que indicarle el runtime a mano
  (`oxc: { jsx: { runtime: "automatic" } }`; vitest 4 usa oxc, no esbuild).
- Las páginas del dashboard filtran del lado del servidor y pasan el filtro por
  la URL (ver `/analytics`, `/production` y la lista de pedidos). No bajar la
  tabla entera al cliente para filtrarla ahí.
