"use client"

import { RoleSchema, roleSchema } from "@/lib/validations/role-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Permission, SubjectKey } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/multi-select"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { translateSubject } from "@/helpers/helpers"
import { ResultadoAccion } from "@/types/types"

/**
 * El formulario de rol, uno solo para crear y para editar.
 *
 * Los permisos se muestran agrupados por sujeto —pedidos, productos, clientes—
 * porque una lista plana de todos los permisos del sistema es imposible de
 * revisar. Ese agrupamiento es la única lógica del formulario, y por eso vive
 * acá y no duplicada en las dos pantallas.
 */

type RoleFormProps = {
  permissions: Permission[] | null
  defaultValues: RoleSchema
  guardar: (data: RoleSchema) => Promise<ResultadoAccion>
  textoBoton: string
  avisoExito: { title: string; description: string }
}

const RoleForm = ({
  permissions,
  defaultValues,
  guardar,
  textoBoton,
  avisoExito,
}: RoleFormProps) => {
  const router = useRouter()

  const groupedPermissions = permissions?.reduce(
    (acc, permission) => {
      const subject = permission.subjectKey as SubjectKey
      if (!acc[subject]) {
        acc[subject] = []
      }

      acc[subject].push({
        id: permission.id,
        name: permission.name,
      })
      return acc
    },
    {} as Record<SubjectKey, { id: string; name: string }[]>
  )

  const form = useForm<RoleSchema>({
    resolver: zodResolver(roleSchema),
    defaultValues,
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: RoleSchema) => {
    const res = await guardar(data)

    if (res.success) {
      router.push("/roles")
      toast(avisoExito)
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: res.error,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className='grid gap-6'>
        <Card className='max-w-screen-md'>
          <CardHeader></CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <FormField
                control={control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nombre del rol'
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {Object.entries(groupedPermissions || {}).map(
                ([subject, permissions]) => {
                  const subjectKey = subject as SubjectKey
                  return (
                    <FormField
                      key={subjectKey}
                      control={control}
                      name={`permissionsIds.${subjectKey}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translateSubject(subjectKey)}</FormLabel>
                          <FormControl>
                            <MultiSelect
                              options={permissions.map((permission) => ({
                                value: permission.id,
                                label: permission.name,
                              }))}
                              selected={field.value || []}
                              onChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                }
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              {textoBoton}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default RoleForm
