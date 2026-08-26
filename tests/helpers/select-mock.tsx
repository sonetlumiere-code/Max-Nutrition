/**
 * Doble del Select de shadcn/radix para los tests de formularios.
 *
 * El Select real se abre con eventos de puntero que jsdom no implementa, así
 * que en un test no hay forma de elegir una opción. Los tests de formulario no
 * prueban ese componente —prueban qué manda el formulario—, así que se
 * reemplaza por un `<select>` nativo, que sí se puede operar con fireEvent.
 *
 * Se exportan todos los nombres del módulo real: si falta uno, vitest falla con
 * "No X export is defined on the mock" aunque el formulario no lo use.
 */

type Hijos = { children?: React.ReactNode }

/**
 * @param ariaLabel nombre accesible para el `<select>`, cuando el test necesita
 * encontrarlo por etiqueta y no por posición.
 */
export const selectMock = (ariaLabel?: string) => ({
  Select: ({
    children,
    onValueChange,
    defaultValue,
    value,
  }: Hijos & {
    onValueChange: (v: string) => void
    defaultValue?: string
    value?: string
  }) => (
    <select
      aria-label={ariaLabel}
      defaultValue={value ?? defaultValue ?? ""}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value=''></option>
      {children}
    </select>
  ),
  SelectItem: ({ value, children }: Hijos & { value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectContent: ({ children }: Hijos) => <>{children}</>,
  SelectGroup: ({ children }: Hijos) => <>{children}</>,
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectLabel: ({ children }: Hijos) => <>{children}</>,
  SelectSeparator: () => null,
  SelectScrollUpButton: () => null,
  SelectScrollDownButton: () => null,
})
