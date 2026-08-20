import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * `docs/invariantes.md` no es prosa suelta: cada invariante apunta al test que
 * lo sostiene. Este test verifica que esas referencias existan de verdad, así
 * que renombrar o borrar un test rompe la suite en vez de dejar el documento
 * mintiendo en silencio.
 */

const ROOT = resolve(import.meta.dirname, "..")
const DOC = resolve(ROOT, "docs/invariantes.md")

/** El markdown corta las líneas, así que se aplasta antes de buscar. */
const doc = readFileSync(DOC, "utf8").replace(/\s+/g, " ")

type Reference = { file: string; testNames: string[] }

/**
 * Levanta cada referencia con la forma:
 *   [algo](../tests/x.test.ts): *nombre del test*, *otro nombre*
 * cortando en el separador de la próxima referencia.
 */
const parseReferences = (): Reference[] => {
  const references: Reference[] = []
  const linkPattern = /\(\.\.\/tests\/([\w-]+\.test\.ts)\):/g

  let match: RegExpExecArray | null

  while ((match = linkPattern.exec(doc))) {
    const rest = doc.slice(match.index + match[0].length)
    // La lista de nombres termina donde arranca la próxima referencia o el
    // próximo párrafo en negrita.
    const end = rest.search(/·|\*\*|→/)
    const segment = end === -1 ? rest : rest.slice(0, end)

    const testNames = [...segment.matchAll(/\*([^*]+)\*/g)].map((m) =>
      m[1].trim()
    )

    references.push({ file: match[1], testNames })
  }

  return references
}

const references = parseReferences()

describe("docs/invariantes.md", () => {
  it("existe y cita tests", () => {
    expect(existsSync(DOC)).toBe(true)
    // Si el parseo se rompe, el resto de los tests pasarían en vacío.
    expect(references.length).toBeGreaterThan(20)
  })

  it("cada archivo de test citado existe", () => {
    const faltantes = references
      .map((reference) => reference.file)
      .filter((file) => !existsSync(resolve(ROOT, "tests", file)))

    expect([...new Set(faltantes)]).toEqual([])
  })

  it("cada test citado existe con ese nombre exacto", () => {
    const faltantes: string[] = []

    for (const { file, testNames } of references) {
      const path = resolve(ROOT, "tests", file)
      if (!existsSync(path)) continue

      const source = readFileSync(path, "utf8")

      for (const name of testNames) {
        if (!source.includes(`it("${name}"`)) {
          faltantes.push(`${file}: ${name}`)
        }
      }
    }

    expect(faltantes).toEqual([])
  })

  it("ninguna referencia quedó sin nombre de test", () => {
    const vacias = references.filter((r) => r.testNames.length === 0)

    expect(vacias.map((r) => r.file)).toEqual([])
  })
})
