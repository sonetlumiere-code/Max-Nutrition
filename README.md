# Máxima Nutrición

Tienda de viandas sin TACC: catálogo y checkout para el cliente, y un panel
para tomar pedidos, cargar recetas, planificar la producción y ver cómo va el
negocio.

Next.js 16 con App Router, Prisma sobre Postgres, NextAuth, Tailwind con
shadcn/ui, Resend para los mails y Mercado Pago para el cobro online.

## Arrancar

```bash
npm install
```

Copiar `.env.example` a `.env` y completar las variables (están explicadas una
por una en [docs/operaciones.md](docs/operaciones.md)). Después:

```bash
npx prisma generate
```

```bash
npm run dev
```

Queda en [http://localhost:3000](http://localhost:3000).

La base es Postgres en Neon y **no hay carpeta de migraciones**: el esquema se
sincroniza con `npx prisma db push`. Antes de correrlo contra la base
compartida, leer la advertencia en [CLAUDE.md](CLAUDE.md).

## Tests

```bash
npm test
```

Cubren la matemática del negocio —conversiones de unidades, costo de
ingredientes con merma, promociones, límites de período y las agregaciones de
producción— y las acciones por donde entra la plata, con la base doblada: crear
y editar un pedido, el webhook de Mercado Pago y el endpoint del cron. No hace
falta levantar ninguna infraestructura.

El manejo de fechas tiene que ser independiente del huso de la máquina: el
negocio opera en Argentina y el servidor de build suele correr en UTC. Antes de
tocar esa parte, conviene correr la suite en otra zona:

```bash
TZ=UTC npm test
```

## Documentación

- [docs/invariantes.md](docs/invariantes.md) — las reglas de negocio que no se
  pueden romper, cada una con el test que la sostiene.
- [docs/operaciones.md](docs/operaciones.md) — variables de entorno, cobros con
  Mercado Pago y las tareas programadas de las suscripciones.
- [CLAUDE.md](CLAUDE.md) — convenciones del repo y las trampas del entorno de
  desarrollo.
