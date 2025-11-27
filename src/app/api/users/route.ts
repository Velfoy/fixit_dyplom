import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

//GET /api/customers
export async function GET() {
  try {
    const users = await prisma.users.findMany({
      orderBy: { updated_at: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.log("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
// POST /api/users -> create new user
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { first_name, last_name, email, phone, password, role } = body;

    // Basic validation
    if (!first_name || !last_name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.users.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);
    const data: any = {
      first_name,
      last_name,
      email,
      phone,
      password: hashedPassword,
      role,
    };
    const newUser = await prisma.users.create({
      data: data,
    });

    // return created user
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, role } = body;

    const userId = parseInt(String(id), 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    if (!role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const allowed = ["ADMIN", "WAREHOUSE", "MECHANIC", "CLIENT"];
    if (!allowed.includes(role)) {
      return NextResponse.json(
        { error: `Role must be one of: ${allowed.join(", ")}` },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.users
      .update({
        where: { id: userId },
        data: { role },
      })
      .catch((err) => {
        console.error("Prisma update error", err);
        return null;
      });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/users error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
