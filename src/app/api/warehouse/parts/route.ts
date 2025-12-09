import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - list all available parts in warehouse with search/filter
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 50;

    const whereClause: any = {
      quantity: { gt: 0 }, // Only show parts with available quantity
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { part_number: { contains: search, mode: "insensitive" } },
      ];
    }

    const parts = await prisma.part.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        part_number: true,
        quantity: true,
        price: true,
        min_quantity: true,
        supplier: true,
      },
      take: limit,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(parts);
  } catch (error) {
    console.error("Error fetching parts:", error);
    return NextResponse.json(
      { error: "Failed to fetch parts" },
      { status: 500 }
    );
  }
}
