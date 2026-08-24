# Notas para trabajar en este repo

Máxima Nutrición: tienda de viandas sin TACC. Next.js 16 (App Router), Prisma
sobre Postgres, NextAuth, Tailwind con shadcn/ui, Resend para mails y Mercado
Pago para el cobro online.

Lo que sigue es lo que no se deduce leyendo el código y ya costó caro
redescubrir.

## Antes de tocar nada

- **Leé [docs/invariantes.md](docs/invariantes.md).** Son las reglas de negocio
  que no se pueden romper, cada una con el test que la sostiene y con **qué capa
  la garantiza**: si es *estructural* (la base o una función única la hacen
  cumplir sola), *puntual* (vive en una acción concreta, y un camino nuevo tiene
  que acordarse) o pura *convención*. Si un cambio hace fallar uno de esos
  tests, la pregunta es si de verdad se quiere cambiar la regla, no cómo
  arreglar el test.
- **Si una palabra del dominio no se entiende, está en
  [docs/glosario.md](docs/glosario.md).** Merma, unidad base, bolsón, modo
  catálogo, día del negocio, las tres puertas. El negocio habla en español y el
  código en inglés; el glosario tiene las dos formas.
- **El build ya no lintea.** Next 16 sacó `next lint`: ESLint corre aparte con
  `npm run lint` y config plana. Hoy da 0 errores y 24 warnings informativos del
  plugin de React; si aparece un error nuevo, es de algo que se tocó.
- **Los tests se corren.** `npm test`: todo es lógica pura o corre con la base
  doblada, así que no hace falta levantar infraestructura. No hay CI todavía,
  así que corren cuando alguien se acuerda.
- **El catálogo se carga con un seed, no a mano.** `npm run seed:catalogo` solo
  informa; escribe con `-- --aplicar`. Los datos están en `prisma/catalogo.ts` y
  las cantidades de receta van SIEMPRE en unidad base (gramos, mililitros,
  unidades), sin importar cómo esté cargado el ingrediente. Ver
  [docs/operaciones.md](docs/operaciones.md).
- **La aritmética de dinero vive en un solo lugar:** `lib/orders/pricing.ts`. La
  comparten la creación manual y la generación automática de suscripciones para
  que un pedido recurrente no se cobre distinto que el mismo pedido hecho a
  mano.
- **No subas `@react-email/components` a la línea 1.x.** `npm audit` va a
  ofrecerlo para cerrar 3 moderate de `prismjs`, que entran por `code-block` —un
  componente que este proyecto no usa, y cuya vulnerabilidad es DOM Clobbering
  en el navegador—. A cambio rompe el envío: toda la línea 1.x trae
  `@react-email/tailwind@2.x`, que es asíncrono, y el `<Tailwind>` de las cinco
  plantillas suspende en el primer render de cada proceso. Como el que renderiza
  es `resend@3.5.0` con su `@react-email/render@0.0.16` síncrono, el primer mail
  de cada instancia fría falla — incluido el de verificación de cuenta. Ver
  [docs/dependencias.md](docs/dependencias.md).

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
  tipos están limpios, borrar `.next` y rebuildear. Con Turbopack la falla
  aparece como `ChunkLoadError ... Failed to collect page data` en una página
  cualquiera: el mismo build vuelve a pasar sin tocar nada.
- El build tarda entre 20 s y 5 minutos según la carga de la máquina.
  Conviene lanzarlo en segundo plano en vez de arriesgar un timeout que deje el
  lock tomado. No lanzar dos builds concurrentes sobre el mismo `.next`.
- Después de borrar una página `.tmp`, borrar también los tipos generados que
  apuntan a ella o `tsc` los reporta. En Next 16 el dev server escribe en
  `.next/dev/types` y el build en `.next/types`; con borrar `.next` entero
  alcanza.
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
