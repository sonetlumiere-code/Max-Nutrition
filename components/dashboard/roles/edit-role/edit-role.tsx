"use client"

import { roleSchema } from "@/lib/validations/role-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Permission, SubjectKey } from "@prisma/client"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
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
import { PopulatedRole } from "@/types/types"
import { editRole } from "@/actions/roles/edit-role"
import { toast } from "@/components/ui/use-toast"
import { translateSubject } from "@/helpers/helpers"

type RoleShema = z.infer<typeof roleSchema>

type EditRoleProps = {
  role: PopulatedRole
  permissions: Permission[] | null
}

const EditRole = ({ role, permissions }: EditRoleProps) => {
  const router = useRouter()

  const groupedPermissions = permissions?.reduce((acc, permission) => {
    const subject = permission.subjectKey as SubjectKey
    if (!acc[subject]) {
      acc[subject] = []
    }

    acc[subject].push({
      id: permission.id,
      name: permission.name,
    })
    return acc
  }, {} as Record<SubjectKey, { id: string; name: string }[]>)

  const defaultPermissionsIds = role.permissions.reduce((acc, permission) => {
    const subjectKey = permission.subjectKey

    if (!acc[subjectKey]) {
      acc[subjectKey] = []
    }

    acc[subjectKey].push(permission.id)
    return acc
  }, {} as Record<string, string[]>)

  const form = useForm<RoleShema>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role.name,
      permissionsIds: defaultPermissionsIds,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: RoleShema) => {
    const res = await editRole({ id: role.id, values: data })

    if (res.success) {
      router.push("/roles")
      toast({
        title: "Rol actualizado",
        description: "El rol ha sido actualizado correctamente.",
      })
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
              Editar rol
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default EditRole
