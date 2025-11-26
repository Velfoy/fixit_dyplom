import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

//GET /api/customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany();
    return NextResponse.json(customers);
  } catch (error) {
    console.log("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const customer = await prisma.customer.create({
      data: {},
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.log("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
