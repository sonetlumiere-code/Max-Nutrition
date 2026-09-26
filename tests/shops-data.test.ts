import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * La vitrina busca la tienda por la clave que viene en la URL, y a esa ruta
 * llega cualquier cosa que pida un bot. Neon suspende la base cuando nadie la
 * usa: si cada `/robots.txt` o `/wp-login.php` se convierte en una consulta,
 * no se duerme nunca.
 */

const prisma = vi.hoisted(() => ({
  shop: { findFirst: vi.fn(), findMany: vi.fn() },
}))

vi.mock("server-only", () => ({}))
vi.mock("@/lib/db/db", () => ({ default: prisma }))

const { getShop } = await import("@/data/shops")

beforeEach(() => {
  prisma.shop.findFirst.mockReset().mockResolvedValue({ key: "foods" })
})

describe("getShop", () => {
  it.each(["robots.txt", "sitemap.xml", "wp-login.php", ".env"])(
    "no consulta la base para %s, que no puede ser una tienda",
    async (key) => {
      const shop = await getShop({ where: { key, isActive: true } })

      expect(shop).toBeNull()
      expect(prisma.shop.findFirst).not.toHaveBeenCalled()
    }
  )

  it("busca las claves que sí pueden ser una tienda", async () => {
    const shop = await getShop({ where: { key: "foods", isActive: true } })

    expect(shop).toEqual({ key: "foods" })
    expect(prisma.shop.findFirst).toHaveBeenCalledOnce()
  })

  it("no se mete con las búsquedas que no son por clave", async () => {
    await getShop({ where: { id: "tienda.con.punto.en.el.id" } })

    expect(prisma.shop.findFirst).toHaveBeenCalledOnce()
  })
})
