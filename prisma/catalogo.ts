import { IngredientVariantScope, ShopCategory } from "@prisma/client"

/**
 * Catálogo de productos y recetas.
 *
 * Esto son DATOS, no lógica: se editan acá y se cargan con
 * `npm run seed:catalogo`. El cargador es idempotente, así que correrlo dos
 * veces no duplica nada, y no borra ninguna fila.
 *
 * OJO CON LAS CANTIDADES: van siempre en la **unidad base** del ingrediente
 * —gramos, mililitros o unidades— sin importar cómo esté cargado. Un
 * ingrediente en KILOGRAM con cantidad 150 son 150 gramos, no 150 kilos. Es la
 * convención que asume `calculateIngredientData`, y equivocarse acá multiplica
 * por mil la lista de compras y el costo.
 */

export type IngredienteDeReceta = {
  /** Nombre exacto del ingrediente, que ya tiene que existir en la base. */
  ingrediente: string
  /** En unidad base: gramos, mililitros o unidades. */
  cantidad: number
  /** En qué variante entra. Por defecto en las dos. */
  variante?: IngredientVariantScope
}

export type RecetaSeed = {
  nombre: string
  descripcion?: string
  ingredientes: IngredienteDeReceta[]
}

export type ProductoSeed = {
  nombre: string
  descripcion: string
  precio: number
  categoria: string
  /** Cada componente engancha una receta a un tipo: Principal, Guarnición... */
  componentes: { tipo: string; receta: string }[]
  destacado?: boolean
  /** Nombre anterior, para adoptar un producto que ya está cargado en vez de
   * crear uno nuevo al lado. Los pedidos viejos lo siguen apuntando. */
  renombraDe?: string
}

export type CategoriaSeed = { nombre: string; tienda: ShopCategory }

const SOLO_CON_SAL = IngredientVariantScope.ONLY_WITH_SALT

export const categorias: CategoriaSeed[] = [
  { nombre: "Milanesas", tienda: ShopCategory.FOOD },
  { nombre: "Pollo", tienda: ShopCategory.FOOD },
  { nombre: "Carnes", tienda: ShopCategory.FOOD },
  { nombre: "Pescado", tienda: ShopCategory.FOOD },
  { nombre: "Vegetarianas", tienda: ShopCategory.FOOD },
  { nombre: "Budines", tienda: ShopCategory.BAKERY },
  { nombre: "Tartas dulces", tienda: ShopCategory.BAKERY },
  { nombre: "Salados", tienda: ShopCategory.BAKERY },
]

export const recetas: RecetaSeed[] = [
  // ---------------------------------------------------------------- envase
  {
    nombre: "Envase de vianda",
    descripcion:
      "Bandeja, tapa y film de cada vianda. Es una receta compartida por todos los platos, así que el envase entra una vez por unidad en la lista de compras.",
    ingredientes: [
      { ingrediente: "Bandeja 103", cantidad: 1 },
      { ingrediente: "Tapa 103", cantidad: 12 },
      { ingrediente: "Lamina de folez 20 x 25 el kilo", cantidad: 5 },
    ],
  },

  // ------------------------------------------------------------ principales
  {
    nombre: "Receta milanesa",
    descripcion: "Milanesa de carne rebozada sin TACC.",
    ingredientes: [
      { ingrediente: "Carne para guiso", cantidad: 150 },
      { ingrediente: "Rebozador aglu", cantidad: 50 },
      { ingrediente: "Huevo", cantidad: 1 },
      { ingrediente: "Ajo en polvo", cantidad: 1 },
      { ingrediente: "Perejil", cantidad: 2 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Milanesa de pollo",
    ingredientes: [
      { ingrediente: "Pechugas de pollo", cantidad: 160 },
      { ingrediente: "Rebozador natuzen", cantidad: 45 },
      { ingrediente: "Huevo", cantidad: 1 },
      { ingrediente: "Pimenton", cantidad: 1 },
      { ingrediente: "Oregano", cantidad: 1 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Pollo grillado",
    ingredientes: [
      { ingrediente: "Pechugas de pollo", cantidad: 180 },
      { ingrediente: "Aceite", cantidad: 5 },
      { ingrediente: "Cúrcuma", cantidad: 1 },
      { ingrediente: "Pimienta", cantidad: 0.5 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Pollo al curry",
    ingredientes: [
      { ingrediente: "Pechugas de pollo", cantidad: 170 },
      { ingrediente: "Crema de leche", cantidad: 40 },
      { ingrediente: "Cebolla", cantidad: 40 },
      { ingrediente: "Curry", cantidad: 4 },
      { ingrediente: "Jengibre", cantidad: 1 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Pollo con salsa barbacoa",
    ingredientes: [
      { ingrediente: "Pechugas de pollo", cantidad: 170 },
      { ingrediente: "Salsa barbacoa", cantidad: 30 },
      { ingrediente: "Aceite", cantidad: 5 },
      { ingrediente: "Sal", cantidad: 1.5, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Carne al horno",
    ingredientes: [
      { ingrediente: "Carne para guiso", cantidad: 170 },
      { ingrediente: "Cebolla", cantidad: 50 },
      { ingrediente: "Morron rojo", cantidad: 30 },
      { ingrediente: "Aceite", cantidad: 6 },
      { ingrediente: "Pimenton", cantidad: 2 },
      { ingrediente: "Oregano", cantidad: 1 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Carré de cerdo a la mostaza",
    ingredientes: [
      { ingrediente: "Carre de cerdo", cantidad: 170 },
      { ingrediente: "Mostaza", cantidad: 5 },
      { ingrediente: "Miel", cantidad: 8 },
      { ingrediente: "Pimienta", cantidad: 0.5 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Merluza al horno",
    ingredientes: [
      { ingrediente: "Filet de merluza", cantidad: 180 },
      { ingrediente: "Aceite", cantidad: 6 },
      { ingrediente: "Perejil", cantidad: 2 },
      { ingrediente: "Ajo en polvo", cantidad: 1 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Merluza grillada",
    ingredientes: [
      { ingrediente: "Filet de merluza", cantidad: 180 },
      { ingrediente: "Aceite", cantidad: 5 },
      { ingrediente: "Pimenton", cantidad: 1 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Guiso de lentejas",
    descripcion: "Plato único: no lleva guarnición aparte.",
    ingredientes: [
      { ingrediente: "Lentejas secas", cantidad: 90 },
      { ingrediente: "Zanahoria", cantidad: 60 },
      { ingrediente: "Cebolla", cantidad: 50 },
      { ingrediente: "Morron verde", cantidad: 30 },
      { ingrediente: "Papa", cantidad: 80 },
      { ingrediente: "Puré de tomate", cantidad: 80 },
      { ingrediente: "Aceite", cantidad: 8 },
      { ingrediente: "Pimenton", cantidad: 2 },
      { ingrediente: "Oregano", cantidad: 1 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Berenjenas a la parmesana",
    ingredientes: [
      { ingrediente: "Berenjenas", cantidad: 220 },
      { ingrediente: "Quesos frescos", cantidad: 60 },
      { ingrediente: "Quesos duros", cantidad: 20 },
      { ingrediente: "Aceite", cantidad: 8 },
      { ingrediente: "Oregano", cantidad: 2 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },

  // ----------------------------------------------------------- guarniciones
  {
    nombre: "Puré de papas",
    ingredientes: [
      { ingrediente: "Papa", cantidad: 200 },
      { ingrediente: "Leche", cantidad: 30 },
      { ingrediente: "MANTECA", cantidad: 10 },
      { ingrediente: "Nuez Moscada", cantidad: 0.5 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Puré de calabaza",
    ingredientes: [
      { ingrediente: "Calabaza anco", cantidad: 230 },
      { ingrediente: "MANTECA", cantidad: 8 },
      { ingrediente: "Nuez Moscada", cantidad: 0.5 },
      { ingrediente: "Sal", cantidad: 1.5, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Puré mixto de papa y calabaza",
    ingredientes: [
      { ingrediente: "Papa", cantidad: 120 },
      { ingrediente: "Calabaza anco", cantidad: 120 },
      { ingrediente: "Leche", cantidad: 25 },
      { ingrediente: "MANTECA", cantidad: 8 },
      { ingrediente: "Sal", cantidad: 1.5, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Calabaza asada",
    ingredientes: [
      { ingrediente: "Calabaza anco", cantidad: 220 },
      { ingrediente: "Aceite", cantidad: 8 },
      { ingrediente: "Provenzal", cantidad: 2 },
      { ingrediente: "Sal", cantidad: 1.5, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Papas al horno",
    ingredientes: [
      { ingrediente: "Papa", cantidad: 220 },
      { ingrediente: "Aceite", cantidad: 8 },
      { ingrediente: "Provenzal", cantidad: 3 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Arroz integral",
    ingredientes: [
      { ingrediente: "Arroz integral", cantidad: 80 },
      { ingrediente: "Condimento para arroz", cantidad: 2 },
      { ingrediente: "Sal", cantidad: 1.5, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Arroz blanco",
    ingredientes: [
      { ingrediente: "Arroz doble carolina", cantidad: 80 },
      { ingrediente: "Sal", cantidad: 1.5, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Vegetales salteados",
    ingredientes: [
      { ingrediente: "Mix de vegetales", cantidad: 180 },
      { ingrediente: "Aceite", cantidad: 7 },
      { ingrediente: "Salsa de soja", cantidad: 10 },
      { ingrediente: "Sal", cantidad: 1, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Polenta cremosa",
    ingredientes: [
      { ingrediente: "Polenta", cantidad: 70 },
      { ingrediente: "Leche", cantidad: 60 },
      { ingrediente: "MANTECA", cantidad: 10 },
      { ingrediente: "Quesos duros", cantidad: 15 },
      { ingrediente: "Sal", cantidad: 1.5, variante: SOLO_CON_SAL },
    ],
  },

  // ------------------------------------------------------------------ salsa
  {
    nombre: "Salsa de tomate",
    ingredientes: [
      { ingrediente: "Puré de tomate", cantidad: 90 },
      { ingrediente: "Cebolla", cantidad: 30 },
      { ingrediente: "Aceite", cantidad: 5 },
      { ingrediente: "Ajo en polvo", cantidad: 1 },
      { ingrediente: "Oregano", cantidad: 1 },
      { ingrediente: "Sal", cantidad: 1.5, variante: SOLO_CON_SAL },
    ],
  },

  // --------------------------------------------------------- masa y relleno
  {
    nombre: "Masa sin TACC para tarta",
    descripcion: "Compartida por la tarta salada y la dulce.",
    ingredientes: [
      { ingrediente: "Harina de arroz", cantidad: 90 },
      { ingrediente: "Fécula de mandioca", cantidad: 40 },
      { ingrediente: "Almidón de maíz", cantidad: 30 },
      { ingrediente: "MANTECA", cantidad: 45 },
      { ingrediente: "Huevo", cantidad: 1 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Relleno de espinaca y ricota",
    ingredientes: [
      { ingrediente: "Espinaca congelada", cantidad: 120 },
      { ingrediente: "Ricota", cantidad: 90 },
      { ingrediente: "Huevo", cantidad: 1 },
      { ingrediente: "Quesos duros", cantidad: 20 },
      { ingrediente: "Nuez Moscada", cantidad: 0.5 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Relleno de ricota y miel",
    ingredientes: [
      { ingrediente: "Ricota", cantidad: 200 },
      { ingrediente: "Huevo", cantidad: 2 },
      { ingrediente: "Miel", cantidad: 60 },
      { ingrediente: "Leche en polvo", cantidad: 20 },
      { ingrediente: "Nuez Moscada", cantidad: 0.5 },
    ],
  },

  // ------------------------------------------------------------- pastelería
  {
    nombre: "Budín de banana",
    ingredientes: [
      { ingrediente: "Banana", cantidad: 180 },
      { ingrediente: "Harina de arroz", cantidad: 120 },
      { ingrediente: "Almidón de maíz", cantidad: 40 },
      { ingrediente: "Huevo", cantidad: 2 },
      { ingrediente: "MANTECA", cantidad: 60 },
      { ingrediente: "Miel", cantidad: 70 },
      { ingrediente: "Nuez Moscada", cantidad: 0.5 },
      { ingrediente: "Sal", cantidad: 1, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Muffins de banana y miel",
    ingredientes: [
      { ingrediente: "Banana", cantidad: 120 },
      { ingrediente: "Harina de arroz", cantidad: 90 },
      { ingrediente: "Fécula de mandioca", cantidad: 30 },
      { ingrediente: "Huevo", cantidad: 1 },
      { ingrediente: "MANTECA", cantidad: 40 },
      { ingrediente: "Miel", cantidad: 50 },
      { ingrediente: "Leche", cantidad: 40 },
    ],
  },
  {
    nombre: "Scons de queso",
    ingredientes: [
      { ingrediente: "Harina de arroz", cantidad: 110 },
      { ingrediente: "Almidón de maíz", cantidad: 40 },
      { ingrediente: "MANTECA", cantidad: 50 },
      { ingrediente: "Queso blanco", cantidad: 60 },
      { ingrediente: "Quesos duros", cantidad: 30 },
      { ingrediente: "Huevo", cantidad: 1 },
      { ingrediente: "Leche", cantidad: 30 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
  {
    nombre: "Chipá",
    ingredientes: [
      { ingrediente: "Fécula de mandioca", cantidad: 150 },
      { ingrediente: "Quesos frescos", cantidad: 80 },
      { ingrediente: "Quesos duros", cantidad: 30 },
      { ingrediente: "Huevo", cantidad: 1 },
      { ingrediente: "MANTECA", cantidad: 30 },
      { ingrediente: "Leche", cantidad: 40 },
      { ingrediente: "Sal", cantidad: 2, variante: SOLO_CON_SAL },
    ],
  },
]

const ENVASE = { tipo: "Accesorios", receta: "Envase de vianda" }

export const productos: ProductoSeed[] = [
  {
    // Adopta el producto que ya estaba cargado, para no dejar dos milanesas y
    // para que los pedidos que lo tienen sigan apuntando al mismo registro.
    renombraDe: "Milanesa 1",
    nombre: "Milanesa de carne con puré",
    descripcion:
      "Milanesa de carne rebozada sin TACC, con puré de papas cremoso.",
    precio: 23000,
    categoria: "Milanesas",
    destacado: true,
    componentes: [
      { tipo: "Principal", receta: "Receta milanesa" },
      { tipo: "Guarnición", receta: "Puré de papas" },
      ENVASE,
    ],
  },
  {
    nombre: "Milanesa de pollo con calabaza asada",
    descripcion: "Milanesa de pechuga rebozada, con calabaza asada al horno.",
    precio: 23000,
    categoria: "Milanesas",
    componentes: [
      { tipo: "Principal", receta: "Milanesa de pollo" },
      { tipo: "Guarnición", receta: "Calabaza asada" },
      ENVASE,
    ],
  },
  {
    nombre: "Pollo grillado con arroz integral",
    descripcion: "Pechuga grillada con cúrcuma y arroz integral.",
    precio: 22000,
    categoria: "Pollo",
    componentes: [
      { tipo: "Principal", receta: "Pollo grillado" },
      { tipo: "Guarnición", receta: "Arroz integral" },
      ENVASE,
    ],
  },
  {
    nombre: "Pollo al curry con arroz",
    descripcion: "Pollo en salsa de curry suave con arroz blanco.",
    precio: 24000,
    categoria: "Pollo",
    destacado: true,
    componentes: [
      { tipo: "Principal", receta: "Pollo al curry" },
      { tipo: "Guarnición", receta: "Arroz blanco" },
      ENVASE,
    ],
  },
  {
    nombre: "Pollo barbacoa con polenta",
    descripcion: "Pechuga con salsa barbacoa y polenta cremosa con queso.",
    precio: 23500,
    categoria: "Pollo",
    componentes: [
      { tipo: "Principal", receta: "Pollo con salsa barbacoa" },
      { tipo: "Guarnición", receta: "Polenta cremosa" },
      ENVASE,
    ],
  },
  {
    nombre: "Carne al horno con papas",
    descripcion: "Carne al horno con cebolla y morrón, con papas al provenzal.",
    precio: 25000,
    categoria: "Carnes",
    componentes: [
      { tipo: "Principal", receta: "Carne al horno" },
      { tipo: "Guarnición", receta: "Papas al horno" },
      ENVASE,
    ],
  },
  {
    nombre: "Cerdo a la mostaza con puré de calabaza",
    descripcion: "Carré de cerdo con mostaza y miel, con puré de calabaza.",
    precio: 26000,
    categoria: "Carnes",
    componentes: [
      { tipo: "Principal", receta: "Carré de cerdo a la mostaza" },
      { tipo: "Guarnición", receta: "Puré de calabaza" },
      ENVASE,
    ],
  },
  {
    nombre: "Merluza al horno con puré mixto",
    descripcion: "Filet de merluza al horno con ajo y perejil.",
    precio: 24500,
    categoria: "Pescado",
    componentes: [
      { tipo: "Principal", receta: "Merluza al horno" },
      { tipo: "Guarnición", receta: "Puré mixto de papa y calabaza" },
      ENVASE,
    ],
  },
  {
    nombre: "Merluza con vegetales salteados",
    descripcion: "Merluza grillada con mix de vegetales al wok.",
    precio: 24500,
    categoria: "Pescado",
    componentes: [
      { tipo: "Principal", receta: "Merluza grillada" },
      { tipo: "Guarnición", receta: "Vegetales salteados" },
      ENVASE,
    ],
  },
  {
    nombre: "Tarta de espinaca y ricota",
    descripcion: "Tarta con masa sin TACC, rellena de espinaca y ricota.",
    precio: 21000,
    categoria: "Vegetarianas",
    componentes: [
      { tipo: "Masa", receta: "Masa sin TACC para tarta" },
      { tipo: "Relleno", receta: "Relleno de espinaca y ricota" },
      ENVASE,
    ],
  },
  {
    nombre: "Guiso de lentejas",
    descripcion: "Guiso de lentejas con verduras. Plato único.",
    precio: 21000,
    categoria: "Vegetarianas",
    componentes: [
      { tipo: "Principal", receta: "Guiso de lentejas" },
      ENVASE,
    ],
  },
  {
    nombre: "Berenjenas a la parmesana",
    descripcion: "Berenjenas gratinadas con salsa de tomate y queso.",
    precio: 22000,
    categoria: "Vegetarianas",
    componentes: [
      { tipo: "Principal", receta: "Berenjenas a la parmesana" },
      { tipo: "Salsa", receta: "Salsa de tomate" },
      ENVASE,
    ],
  },

  // ------------------------------------------------------------- pastelería
  {
    nombre: "Budín de banana",
    descripcion: "Budín húmedo de banana endulzado con miel, sin TACC.",
    precio: 12000,
    categoria: "Budines",
    destacado: true,
    componentes: [{ tipo: "Principal", receta: "Budín de banana" }],
  },
  {
    nombre: "Muffins de banana y miel (x4)",
    descripcion: "Cuatro muffins de banana y miel, sin TACC.",
    precio: 9500,
    categoria: "Budines",
    componentes: [{ tipo: "Principal", receta: "Muffins de banana y miel" }],
  },
  {
    nombre: "Tarta de ricota",
    descripcion: "Tarta de ricota con miel sobre masa sin TACC.",
    precio: 14000,
    categoria: "Tartas dulces",
    componentes: [
      { tipo: "Masa", receta: "Masa sin TACC para tarta" },
      { tipo: "Relleno", receta: "Relleno de ricota y miel" },
    ],
  },
  {
    nombre: "Scons de queso (x6)",
    descripcion: "Media docena de scons de queso, sin TACC.",
    precio: 8500,
    categoria: "Salados",
    componentes: [{ tipo: "Principal", receta: "Scons de queso" }],
  },
  {
    nombre: "Chipá (x8)",
    descripcion: "Ocho chipás de fécula de mandioca y queso.",
    precio: 8000,
    categoria: "Salados",
    componentes: [{ tipo: "Principal", receta: "Chipá" }],
  },
]
