import { afterEach, describe, expect, it, vi } from "vitest"
import { ActionKey, SubjectKey } from "@prisma/client"
import { getPermissionsKeys, groupOrdersByPeriod, hasPermission } from "@/helpers/helpers"
import { ExtendedUser } from "@/types/next-auth"
import { PopulatedOrder } from "@/types/types"

const permission = (actionKey: ActionKey, subjectKey: SubjectKey) =>
  ({ id: `${actionKey}-${subjectKey}`, actionKey, subjectKey }) as never

const userWith = (permissions: unknown[]): ExtendedUser =>
  ({ id: "u1", role: { permissions } }) as unknown as ExtendedUser

describe("hasPermission", () => {
  const user = userWith([
    permission(ActionKey.view, SubjectKey.orders),
    permission(ActionKey.update, SubjectKey.orders),
    permission(ActionKey.view, SubjectKey.products),
  ])

  it("reconoce los permisos que el rol tiene", () => {
    expect(hasPermission(user, "view:orders")).toBe(true)
    expect(hasPermission(user, "update:orders")).toBe(true)
    expect(hasPermission(user, "view:products")).toBe(true)
  })

  it("niega los que no tiene", () => {
    expect(hasPermission(user, "delete:orders")).toBe(false)
    expect(hasPermission(user, "view:analytics")).toBe(false)
  })

  it("no confunde la acción con el sujeto", () => {
    // Tiene update:orders y view:products, pero no update:products.
    expect(hasPermission(user, "update:products")).toBe(false)
  })

  it("niega todo si el usuario no tiene rol", () => {
    const sinRol = { id: "u2" } as unknown as ExtendedUser

    expect(hasPermission(sinRol, "view:orders")).toBe(false)
  })

  it("niega todo si el rol no tiene permisos", () => {
    expect(hasPermission(userWith([]), "view:orders")).toBe(false)
  })
})

describe("getPermissionsKeys", () => {
  it("arma las claves accion:sujeto", () => {
    const keys = getPermissionsKeys([
      permission(ActionKey.view, SubjectKey.orders),
      permission(ActionKey.create, SubjectKey.products),
    ])

    expect(keys).toEqual(["view:orders", "create:products"])
  })

  it("devuelve vacío sin permisos", () => {
    expect(getPermissionsKeys([])).toEqual([])
    expect(getPermissionsKeys()).toEqual([])
  })
})

const order = (createdAt: string) =>
  ({ id: createdAt, createdAt: new Date(createdAt) }) as PopulatedOrder

describe("groupOrdersByPeriod", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("incluye todos los pedidos de la semana en curso", () => {
    // Miércoles 20 de mayo de 2026, 15:00 en Argentina.
    vi.setSystemTime(new Date("2026-05-20T18:00:00.000Z"))

    const groups = groupOrdersByPeriod(
      [
        order("2026-05-18T13:00:00.000Z"), // lunes
        order("2026-05-19T13:00:00.000Z"), // martes
        order("2026-05-20T13:00:00.000Z"), // miércoles
      ],
      "week"
    )

    // Un único grupo, con los tres pedidos: ninguno se descarta.
    expect(Object.keys(groups)).toHaveLength(1)
    expect(Object.values(groups)[0]).toHaveLength(3)
  })

  it("deja afuera los pedidos de la semana anterior", () => {
    vi.setSystemTime(new Date("2026-05-20T18:00:00.000Z"))

    const groups = groupOrdersByPeriod(
      [
        order("2026-05-15T13:00:00.000Z"), // viernes previo
        order("2026-05-19T13:00:00.000Z"), // martes de esta semana
      ],
      "week"
    )

    expect(Object.values(groups).flat()).toHaveLength(1)
  })

  it("devuelve un objeto vacío cuando no hay pedidos en el período", () => {
    vi.setSystemTime(new Date("2026-05-20T18:00:00.000Z"))

    const groups = groupOrdersByPeriod([order("2026-01-10T13:00:00.000Z")], "week")

    // Antes devolvía { undefined: undefined }, que rompía a quien lo recorriera.
    expect(groups).toEqual({})
    expect(Object.keys(groups)).toHaveLength(0)
  })

  it("agrupa el mes en curso sin descartar días", () => {
    vi.setSystemTime(new Date("2026-05-20T18:00:00.000Z"))

    const groups = groupOrdersByPeriod(
      [
        order("2026-05-02T13:00:00.000Z"),
        order("2026-05-15T13:00:00.000Z"),
        order("2026-05-20T13:00:00.000Z"),
        order("2026-04-28T13:00:00.000Z"), // mes anterior
      ],
      "month"
    )

    expect(Object.keys(groups)).toEqual(["2026-05"])
    expect(groups["2026-05"]).toHaveLength(3)
  })

  it("con 'all' devuelve todo junto, sin filtrar por fecha", () => {
    const groups = groupOrdersByPeriod(
      [order("2024-01-01T13:00:00.000Z"), order("2026-05-20T13:00:00.000Z")],
      "all"
    )

    expect(Object.keys(groups)).toEqual(["all"])
    expect(groups.all).toHaveLength(2)
  })

  it("un pedido de las 22:00 no se escapa al día siguiente", () => {
    // 20 de mayo 22:00 en Argentina = 21 de mayo 01:00 UTC. Agrupando en UTC
    // caería en otro día, y a fin de mes en otro mes.
    vi.setSystemTime(new Date("2026-05-21T12:00:00.000Z"))

    const groups = groupOrdersByPeriod(
      [order("2026-05-21T01:00:00.000Z")],
      "month"
    )

    expect(Object.keys(groups)).toEqual(["2026-05"])
  })

  it("no pierde pedidos: la suma de los grupos es el total filtrado", () => {
    vi.setSystemTime(new Date("2026-05-20T18:00:00.000Z"))

    const orders = [
      order("2026-05-01T13:00:00.000Z"),
      order("2026-05-10T13:00:00.000Z"),
      order("2026-05-20T13:00:00.000Z"),
    ]
    const groups = groupOrdersByPeriod(orders, "month")

    expect(Object.values(groups).flat()).toHaveLength(orders.length)
  })
})
