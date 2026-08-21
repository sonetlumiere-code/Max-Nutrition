import { PrismaClient } from "@prisma/client"
import { categorias, productos, recetas } from "./catalogo"

/**
 * Carga el catálogo declarado en `catalogo.ts`.
 *
 * Dos propiedades que no se negocian, porque esto corre contra la base
 * productiva:
 *
 * 1. **No borra nada.** Si una receta ya cargada tiene un ingrediente que el
 *    catálogo no declara, se avisa y se deja donde está.
 * 2. **Es idempotente.** Busca por nombre y crea o actualiza. `Product.name` y
 *    `Recipe.name` no son únicos en el esquema, así que la búsqueda por nombre
 *    es lo que evita duplicar en cada corrida.
 *
 * Por defecto solo informa qué haría. Para aplicarlo hay que pasar `--aplicar`.
 */

const prisma = new PrismaClient()

const aplicar = process.argv.includes("--aplicar")

const log = (mensaje: string) => console.log(mensaje)

/** Aborta antes de escribir si el catálogo referencia algo que no existe. */
const validar = async () => {
  const problemas: string[] = []

  const [ingredientes, tipos] = await Promise.all([
    prisma.ingredient.findMany({ select: { name: true } }),
    prisma.productRecipeType.findMany({ select: { name: true } }),
  ])

  const nombresIngredientes = new Set(ingredientes.map((i) => i.name))
  const nombresTipos = new Set(tipos.map((t) => t.name))
  const nombresRecetas = new Set(recetas.map((r) => r.nombre))
  const nombresCategorias = new Set(categorias.map((c) => c.nombre))

  for (const receta of recetas) {
    if (!receta.ingredientes.length) {
      problemas.push(`La receta "${receta.nombre}" no tiene ingredientes.`)
    }

    for (const item of receta.ingredientes) {
      if (!nombresIngredientes.has(item.ingrediente)) {
        problemas.push(
          `La receta "${receta.nombre}" usa un ingrediente que no existe: "${item.ingrediente}".`
        )
      }
      if (!(item.cantidad > 0)) {
        problemas.push(
          `La receta "${receta.nombre}" tiene una cantidad inválida en "${item.ingrediente}".`
        )
      }
    }

    const repetidos = receta.ingredientes.length !== new Set(receta.ingredientes.map((i) => i.ingrediente)).size
    if (repetidos) {
      problemas.push(`La receta "${receta.nombre}" repite un ingrediente.`)
    }
  }

  const recetasDuplicadas = recetas.length !== nombresRecetas.size
  if (recetasDuplicadas) problemas.push("Hay dos recetas con el mismo nombre.")

  for (const producto of productos) {
    if (!nombresCategorias.has(producto.categoria)) {
      problemas.push(
        `El producto "${producto.nombre}" está en una categoría no declarada: "${producto.categoria}".`
      )
    }
    if (!producto.componentes.length) {
      problemas.push(`El producto "${producto.nombre}" no tiene componentes.`)
    }
    for (const componente of producto.componentes) {
      if (!nombresTipos.has(componente.tipo)) {
        problemas.push(
          `El producto "${producto.nombre}" usa un tipo de receta que no existe: "${componente.tipo}".`
        )
      }
      if (!nombresRecetas.has(componente.receta)) {
        problemas.push(
          `El producto "${producto.nombre}" apunta a una receta no declarada: "${componente.receta}".`
        )
      }
    }
  }

  return problemas
}

const main = async () => {
  log(aplicar ? "APLICANDO el catálogo.\n" : "ENSAYO: no se escribe nada.\n")

  const problemas = await validar()

  if (problemas.length) {
    console.error("El catálogo tiene problemas y no se cargó nada:\n")
    problemas.forEach((p) => console.error("  - " + p))
    process.exitCode = 1
    return
  }

  const ingredientes = await prisma.ingredient.findMany({
    select: { id: true, name: true },
  })
  const idIngrediente = new Map(ingredientes.map((i) => [i.name, i.id]))

  const tipos = await prisma.productRecipeType.findMany({
    select: { id: true, name: true },
  })
  const idTipo = new Map(tipos.map((t) => [t.name, t.id]))

  // -------------------------------------------------------------- categorías
  const idCategoria = new Map<string, string>()

  for (const categoria of categorias) {
    const existente = await prisma.category.findUnique({
      where: { name: categoria.nombre },
    })

    if (existente) {
      idCategoria.set(categoria.nombre, existente.id)
      log(`categoría · ya estaba: ${categoria.nombre}`)
      continue
    }

    log(`categoría · CREAR: ${categoria.nombre} [${categoria.tienda}]`)

    if (aplicar) {
      const creada = await prisma.category.create({
        data: { name: categoria.nombre, shopCategory: categoria.tienda },
      })
      idCategoria.set(categoria.nombre, creada.id)
    }
  }

  // ----------------------------------------------------------------- recetas
  const idReceta = new Map<string, string>()

  for (const receta of recetas) {
    const existente = await prisma.recipe.findFirst({
      where: { name: receta.nombre },
      include: { recipeIngredients: true },
    })

    let recetaId = existente?.id

    if (existente) {
      log(`receta · actualizar: ${receta.nombre}`)
      if (aplicar) {
        await prisma.recipe.update({
          where: { id: existente.id },
          data: { description: receta.descripcion ?? existente.description },
        })
      }
    } else {
      log(`receta · CREAR: ${receta.nombre}`)
      if (aplicar) {
        const creada = await prisma.recipe.create({
          data: { name: receta.nombre, description: receta.descripcion ?? null },
        })
        recetaId = creada.id
      }
    }

    // Ingredientes de la receta: se agregan y se actualizan, nunca se borran.
    const declarados = new Set(
      receta.ingredientes.map((i) => idIngrediente.get(i.ingrediente)!)
    )

    for (const item of receta.ingredientes) {
      const ingredienteId = idIngrediente.get(item.ingrediente)!

      if (aplicar && recetaId) {
        await prisma.recipeIngredient.upsert({
          where: {
            recipeId_ingredientId: { recipeId: recetaId, ingredientId: ingredienteId },
          },
          update: {
            quantity: item.cantidad,
            variantScope: item.variante ?? "ALWAYS",
          },
          create: {
            recipeId: recetaId,
            ingredientId: ingredienteId,
            quantity: item.cantidad,
            variantScope: item.variante ?? "ALWAYS",
          },
        })
      }
    }

    for (const previo of existente?.recipeIngredients ?? []) {
      if (!declarados.has(previo.ingredientId)) {
        const nombre =
          ingredientes.find((i) => i.id === previo.ingredientId)?.name ??
          previo.ingredientId
        log(
          `  ⚠ "${receta.nombre}" ya tenía "${nombre}", que el catálogo no declara. Se deja como está.`
        )
      }
    }

    if (recetaId) idReceta.set(receta.nombre, recetaId)
  }

  // ---------------------------------------------------------------- productos
  for (const producto of productos) {
    // El nombre anterior tiene prioridad: sirve para adoptar un producto que ya
    // está cargado, con sus pedidos colgando, en vez de crear otro al lado.
    const existente =
      (producto.renombraDe
        ? await prisma.product.findFirst({ where: { name: producto.renombraDe } })
        : null) ?? (await prisma.product.findFirst({ where: { name: producto.nombre } }))

    const categoriaId = idCategoria.get(producto.categoria)

    const datos = {
      name: producto.nombre,
      description: producto.descripcion,
      price: producto.precio,
      promotionalPrice: 0,
      featured: producto.destacado ?? false,
      stock: true,
      show: true,
    }

    let productoId = existente?.id

    if (existente) {
      const renombre =
        existente.name !== producto.nombre ? ` (era "${existente.name}")` : ""
      log(`producto · actualizar: ${producto.nombre}${renombre}`)

      if (aplicar) {
        await prisma.product.update({
          where: { id: existente.id },
          data: {
            ...datos,
            image: existente.image,
            categories: categoriaId ? { connect: { id: categoriaId } } : undefined,
          },
        })
      }
    } else {
      log(`producto · CREAR: ${producto.nombre} · $${producto.precio}`)

      if (aplicar) {
        const creado = await prisma.product.create({
          data: {
            ...datos,
            image: "",
            categories: categoriaId ? { connect: { id: categoriaId } } : undefined,
          },
        })
        productoId = creado.id
      }
    }

    for (const componente of producto.componentes) {
      const recetaId = idReceta.get(componente.receta)
      const tipoId = idTipo.get(componente.tipo)

      if (aplicar && productoId && recetaId) {
        await prisma.productRecipe.upsert({
          where: {
            productId_recipeId: { productId: productoId, recipeId: recetaId },
          },
          update: { typeId: tipoId },
          create: { productId: productoId, recipeId: recetaId, typeId: tipoId },
        })
      }
    }
  }

  log(
    aplicar
      ? "\nListo."
      : "\nNada de esto se escribió. Para aplicarlo: npm run seed:catalogo -- --aplicar"
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
