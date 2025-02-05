"use client"

import { PopulatedSafeUser } from "@/types/types"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { UserSchema, userSchema } from "@/lib/validations/user-validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Role } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { editUser } from "@/actions/users/edit-user"
import { toast } from "@/components/ui/use-toast"

type EditUserProps = {
  user: PopulatedSafeUser
  roles: Role[]
}

const EditUser = ({ user, roles }: EditUserProps) => {
  const router = useRouter()

  const form = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      roleId: user.role?.id,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: UserSchema) => {
    const res = await editUser({ id: user.id, values: data })

    if (res.success) {
      router.push("/users")
      toast({
        title: "Usuario actualizado",
        description: "El usuario se actualizó correctamente.",
      })
    }

    if (res.error) {
      toast({
        variant: "destructive",
        title: "Error actualizando usuario.",
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
                name={"roleId"}
                render={({ field }) => (
                  <FormItem className='col-span-5'>
                    <FormLabel className='text-xs'>Rol</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Selecciona una categoría' />
                        </SelectTrigger>
                        <SelectContent>
                          {roles?.map(({ id, name }) => (
                            <SelectItem key={id} value={id}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className='text-xs' />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              )}
              Editar Usuario
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

export default EditUser
