import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { zodAuthSchema } from "@/lib/validations/auth-validator"
import prisma from "@/lib/db/db"

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { email, password } = zodAuthSchema.parse(body)

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ message: "Cuenta creada." }, { status: 200 })
  } catch (error) {
    console.error("Error: ", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Correo o contraseña no válidos." },
        { status: 422 }
      )
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "El Email ya se encuentra registrado." },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    )
  }
}
