import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { User } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"
import { zodAuthSchema } from "@/lib/validations/auth-validator"
import prisma from "@/lib/db/db"

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { email, password } = zodAuthSchema.parse(body)

    const hashedPassword = await bcrypt.hash(password, 12)

    const user: User = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    const userWithoutPassword = {
      ...user,
      password: null,
    }

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error: ", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request payload." },
        { status: 422 }
      )
    }

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    )
  }
}
