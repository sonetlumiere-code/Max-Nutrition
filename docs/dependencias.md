# Dependencias

Decisiones sobre paquetes que ya se investigaron, con lo que se midió, para no
volver a pagar la investigación cada vez que una herramienta sugiere actualizar.

Para la receta general de cómo verificar una alerta antes de actuar —`npm ls`,
el rango real en la API de advisories, el lockfile histórico— ver el final de
este documento.

## `@react-email/components` se queda en 0.0.25

`npm audit` reporta **3 moderate de `prismjs`** y ofrece resolverlas con
`npm audit fix --force`, que sube `@react-email/components` a la línea 1.x. No
hay que hacerlo. Se evaluó el 23/08/2026 y el remedio es peor que la
enfermedad.

### La vulnerabilidad no tiene superficie acá

Es [GHSA-x7hr-w5r2-h6wg](https://github.com/advisories/GHSA-x7hr-w5r2-h6wg),
DOM Clobbering en PrismJS: un atacante inyecta HTML que ensombrece
`document.currentScript` y consigue ejecutar código. Necesita que PrismJS corra
**en un navegador**, sobre HTML no confiable.

`prismjs` entra por `@react-email/code-block`, que entra por
`@react-email/components`. Este proyecto **no importa `CodeBlock` en ningún
lado** —ni `CodeInline`, ni `Markdown`—, y las plantillas se renderizan en el
servidor. El código vulnerable no llega a ejecutarse nunca.

### Lo que rompe el upgrade

Toda la línea 1.x —desde 1.0.0— trae `@react-email/tailwind@2.x`, que pasó a
ser **asíncrono**. Las cinco plantillas de `components/emails/` envuelven todo
en `<Tailwind>`, así que el primer render de cada proceso suspende:

```
Error: A component suspended while responding to synchronous input.
❯ render node_modules/resend/node_modules/@react-email/render/dist/node/index.js:106:33
```

Quien renderiza en producción es `resend@3.5.0`, que trae su propio
`@react-email/render@0.0.16` **síncrono**. El resultado es que **el primer mail
de cada instancia fría falla**. En Vercel eso es cada arranque en frío, e
incluye el mail de verificación de cuenta: un usuario nuevo no podría
registrarse.

Se verificó que suspende solo la primera vez, y que la causa es exactamente
`<Tailwind>`: el mismo árbol sin ese componente renderiza síncrono sin
problema.

### Por qué tampoco alcanza con subir `resend`

Subir `resend` a 6.x resuelve la suspensión —delega el render en
`@react-email/render@2.x`, que es asíncrono— pero no cierra el caso:

- **Los mails cambian de aspecto.** Comparando el HTML renderizado antes y
  después: `<Tailwind>` ahora envuelve todo en una tabla extra y mueve los
  estilos del `<body>` a un `<td>`; la paleta cambia (el botón pasa de
  `rgb(254,202,202)` a `rgb(255,201,201)`); el espaciado de los párrafos cambia;
  y **la font stack se acorta a `ui-sans-serif, system-ui, sans-serif`**,
  perdiendo `-apple-system`, `Segoe UI`, `Roboto`, `Helvetica Neue`, `Arial` y
  `Noto Sans`. Un cliente de correo que no entienda `system-ui` —Outlook de
  escritorio, varios webmails— se cae a serif.
- **El destino está discontinuado.** npm marca `@react-email/components@1.0.12`
  como *"Package no longer supported"*: quedó reemplazado por el paquete
  unificado `react-email` v6.
- **Y el reemplazo oficial tiene un problema abierto** justo con este stack:
  [resend/react-email#3556](https://github.com/resend/react-email/issues/3556)
  reporta que v6 arrastra `prismjs`, `marked` y el motor entero de Tailwind v4
  por imports de nivel superior, inflando los bundles serverless ~80 MB por
  función y colgando deploys de Vercel en silencio.

### Cuándo reconsiderarlo

Cuando se resuelva el issue de bundles de `react-email` v6, o si aparece una
vulnerabilidad de `prismjs` que sí toque una ruta que el proyecto use. En ese
caso, migrar a `react-email` v6 directamente —no a `@react-email/components`
1.x, que ya está muerto— y **volver a comparar el HTML renderizado** antes de
dar el cambio por bueno: los tests de `tests/mail.test.ts` doblan las
plantillas, así que no ven una rotura del JSX ni un cambio de estilos.

## Verificar una alerta antes de actuar

Las dos alertas *high* de agosto de 2026 —`nanoid` y `js-yaml`— resultaron no
aplicar: el repo ya estaba en una versión parcheada. Antes de tocar nada:

1. `npm ls PAQUETE` — versión instalada y de dónde cuelga. Si dice `(dev)`, no
   llega a producción.
2. `https://api.github.com/advisories?cve_id=EL-CVE` — leer
   `vulnerable_version_range` y `first_patched_version` de la API, que es la
   fuente autoritativa. Los resúmenes en prosa dicen "before X" y confunden las
   líneas.
3. **Leer qué necesita el exploit para funcionar** y si el proyecto usa esa
   ruta. Una dependencia vulnerable que nunca se importa no es una
   vulnerabilidad.
4. `git show COMMIT:package-lock.json` para ver desde cuándo está la versión
   parcheada.

`gh` no está instalado en la máquina de desarrollo, así que descartar alertas en
GitHub lo hace el dueño del proyecto desde la web.
