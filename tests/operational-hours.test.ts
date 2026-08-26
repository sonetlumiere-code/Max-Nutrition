import { afterEach, describe, expect, it, vi } from "vitest"
import { DayOfWeek, OperationalHours } from "@prisma/client"
import {
  getOperationalHoursMessage,
  isShopCurrentlyAvailable,
} from "@/helpers/shop-hours"

/**
 * El horario de atención es una de las cosas que deciden si un pedido entra:
 * lo consulta el servidor en `createOrder` antes de aceptarlo, y la vitrina
 * para decirle al cliente cuándo puede pedir.
 *
 * El negocio opera en Argentina (UTC−3, sin horario de verano), así que el día
 * y la hora que valen son los del reloj de allá, no los del servidor. Los tests
 * congelan instantes UTC exactos para que el resultado no dependa del huso de
 * la máquina que los corre.
 */

const horario = (
  dayOfWeek: DayOfWeek,
  startTime: string | null,
  endTime: string | null
): OperationalHours =>
  ({
    id: 1,
    dayOfWeek,
    startTime,
    endTime,
    shopId: "shop_1",
    shopBranchId: null,
    shippingZoneId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as OperationalHours

/** Miércoles 20/05/2026, 12:00 en Argentina. */
const MIERCOLES_MEDIODIA = "2026-05-20T15:00:00Z"

const enElInstante = (iso: string) => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(iso))
}

afterEach(() => {
  vi.useRealTimers()
})

describe("isShopCurrentlyAvailable — si se puede pedir ahora", () => {
  it("sin horarios cargados no se puede pedir", () => {
    enElInstante(MIERCOLES_MEDIODIA)

    expect(isShopCurrentlyAvailable(undefined)).toBe(false)
    expect(isShopCurrentlyAvailable([])).toBe(false)
  })

  it("dentro del horario del día se puede pedir", () => {
    enElInstante(MIERCOLES_MEDIODIA)

    expect(
      isShopCurrentlyAvailable([horario(DayOfWeek.WEDNESDAY, "09:00", "18:00")])
    ).toBe(true)
  })

  it("un minuto antes de abrir todavía no", () => {
    // Miércoles 08:59 en Argentina.
    enElInstante("2026-05-20T11:59:00Z")

    expect(
      isShopCurrentlyAvailable([horario(DayOfWeek.WEDNESDAY, "09:00", "18:00")])
    ).toBe(false)
  })

  it("un minuto después de cerrar ya no", () => {
    // Miércoles 18:01 en Argentina.
    enElInstante("2026-05-20T21:01:00Z")

    expect(
      isShopCurrentlyAvailable([horario(DayOfWeek.WEDNESDAY, "09:00", "18:00")])
    ).toBe(false)
  })

  it("los dos extremos del horario están incluidos", () => {
    // Miércoles 09:00 clavadas: el minuto en que abre ya cuenta.
    enElInstante("2026-05-20T12:00:00Z")
    expect(
      isShopCurrentlyAvailable([horario(DayOfWeek.WEDNESDAY, "09:00", "18:00")])
    ).toBe(true)

    // Miércoles 18:00 clavadas: el minuto en que cierra todavía cuenta.
    enElInstante("2026-05-20T21:00:00Z")
    expect(
      isShopCurrentlyAvailable([horario(DayOfWeek.WEDNESDAY, "09:00", "18:00")])
    ).toBe(true)
  })

  it("el horario de otro día no sirve para hoy", () => {
    enElInstante(MIERCOLES_MEDIODIA)

    expect(
      isShopCurrentlyAvailable([
        horario(DayOfWeek.MONDAY, "00:00", "23:59"),
        horario(DayOfWeek.THURSDAY, "00:00", "23:59"),
      ])
    ).toBe(false)
  })

  it("el día que vale es el de Argentina, no el del servidor", () => {
    // Este instante ya es jueves en UTC, pero en Argentina son las 22:00 del
    // miércoles. Si la función mirara la hora del servidor, buscaría el horario
    // del jueves y diría que está cerrado.
    enElInstante("2026-05-21T01:00:00Z")

    expect(
      isShopCurrentlyAvailable([horario(DayOfWeek.WEDNESDAY, "09:00", "23:00")])
    ).toBe(true)

    // Y el horario del jueves todavía no aplica, aunque en UTC ya sea jueves.
    expect(
      isShopCurrentlyAvailable([horario(DayOfWeek.THURSDAY, "09:00", "23:00")])
    ).toBe(false)
  })

  it("un día cargado a medias se ignora, no se asume abierto", () => {
    enElInstante(MIERCOLES_MEDIODIA)

    expect(
      isShopCurrentlyAvailable([horario(DayOfWeek.WEDNESDAY, "09:00", null)])
    ).toBe(false)
    expect(
      isShopCurrentlyAvailable([horario(DayOfWeek.WEDNESDAY, null, "18:00")])
    ).toBe(false)
  })
})

describe("getOperationalHoursMessage — lo que se le promete al cliente", () => {
  it("sin horarios cargados lo dice, en vez de mostrar una lista vacía", () => {
    expect(getOperationalHoursMessage([])).toBe("No hay horarios disponibles")
  })

  it("un día cargado a medias no cuenta como horario", () => {
    expect(
      getOperationalHoursMessage([
        horario(DayOfWeek.MONDAY, "09:00", null),
        horario(DayOfWeek.TUESDAY, null, null),
      ])
    ).toBe("No hay horarios disponibles")
  })

  it("un solo día se anuncia con su horario", () => {
    expect(
      getOperationalHoursMessage([horario(DayOfWeek.MONDAY, "09:00", "18:00")])
    ).toBe("Lunes: 09:00 a 18:00")
  })

  it("los días consecutivos con el mismo horario se agrupan", () => {
    expect(
      getOperationalHoursMessage([
        horario(DayOfWeek.MONDAY, "09:00", "18:00"),
        horario(DayOfWeek.TUESDAY, "09:00", "18:00"),
        horario(DayOfWeek.WEDNESDAY, "09:00", "18:00"),
        horario(DayOfWeek.THURSDAY, "09:00", "18:00"),
        horario(DayOfWeek.FRIDAY, "09:00", "18:00"),
      ])
    ).toBe("Lunes a Viernes de 09:00 a 18:00")
  })

  it("un día salteado corta el grupo en dos", () => {
    // Sin el miércoles, lunes-martes y jueves-viernes son dos tramos: agruparlos
    // le prometería al cliente un día que la tienda no abre.
    expect(
      getOperationalHoursMessage([
        horario(DayOfWeek.MONDAY, "09:00", "18:00"),
        horario(DayOfWeek.TUESDAY, "09:00", "18:00"),
        horario(DayOfWeek.THURSDAY, "09:00", "18:00"),
        horario(DayOfWeek.FRIDAY, "09:00", "18:00"),
      ])
    ).toBe(
      "Lunes a Martes de 09:00 a 18:00, Jueves a Viernes de 09:00 a 18:00"
    )
  })

  it("dos días seguidos con horarios distintos no se agrupan", () => {
    expect(
      getOperationalHoursMessage([
        horario(DayOfWeek.MONDAY, "09:00", "18:00"),
        horario(DayOfWeek.TUESDAY, "10:00", "20:00"),
      ])
    ).toBe("Lunes: 09:00 a 18:00, Martes: 10:00 a 20:00")
  })

  it("no importa en qué orden vengan de la base, se anuncian de lunes a domingo", () => {
    expect(
      getOperationalHoursMessage([
        horario(DayOfWeek.SATURDAY, "09:00", "18:00"),
        horario(DayOfWeek.MONDAY, "09:00", "18:00"),
        horario(DayOfWeek.TUESDAY, "09:00", "18:00"),
      ])
    ).toBe("Lunes a Martes de 09:00 a 18:00, Sábado: 09:00 a 18:00")
  })

  it("un día entero abierto se anuncia sin horas, que no aportan nada", () => {
    expect(
      getOperationalHoursMessage([horario(DayOfWeek.SUNDAY, "00:00", "23:59")])
    ).toBe("Domingo")

    expect(
      getOperationalHoursMessage([
        horario(DayOfWeek.SATURDAY, "00:00", "23:59"),
        horario(DayOfWeek.SUNDAY, "00:00", "23:59"),
      ])
    ).toBe("de Sábado a Domingo")
  })
})
