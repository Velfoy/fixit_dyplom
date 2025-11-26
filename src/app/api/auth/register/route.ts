import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, phone } =
      await request.json();

    // Basic validation
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    // Map TS fields -> DB columns
    const data: any = {
      email,
      password: hashedPassword,
      phone,
      role: "CLIENT",
      first_name: firstName, // prisma/users field
      last_name: lastName, // prisma/users field
    };

    const newUser = await prisma.users.create({
      data, // if TS still complains, keep the `any` cast on data
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: newUser.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
