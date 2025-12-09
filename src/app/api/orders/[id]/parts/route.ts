import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET all parts assigned to an order
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const parts = await prisma.service_order_part.findMany({
      where: { service_order_id: orderId },
      include: {
        part: {
          select: {
            id: true,
            name: true,
            part_number: true,
            price: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
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

// POST - add part to order from warehouse
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await req.json();
    const { partId, quantity, priceAtTime, deductFromWarehouse } = body;

    // Validate input
    if (!partId || !quantity || quantity <= 0 || priceAtTime === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: partId, quantity, priceAtTime" },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await prisma.service_order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify part exists
    const part = await prisma.part.findUnique({
      where: { id: partId },
    });

    if (!part) {
      return NextResponse.json({ error: "Part not found" }, { status: 404 });
    }

    // Create service_order_part
    const orderPart = await prisma.service_order_part.create({
      data: {
        service_order_id: orderId,
        part_id: partId,
        quantity,
        price_at_time: parseFloat(priceAtTime.toString()),
      },
      include: {
        part: {
          select: {
            id: true,
            name: true,
            part_number: true,
            price: true,
          },
        },
      },
    });

    // Update deduct_from_warehouse flag using raw query if needed
    if (deductFromWarehouse) {
      await prisma.$executeRaw`UPDATE service_order_part SET deduct_from_warehouse = true WHERE id = ${orderPart.id}`;
    }

    // Update order total_cost - ADD the new part cost if deductFromWarehouse is true
    const currentTotal = order.total_cost
      ? parseFloat(order.total_cost.toString())
      : 0;

    const newTotal = deductFromWarehouse
      ? currentTotal + parseFloat(priceAtTime.toString())
      : currentTotal;

    console.log(
      `[POST] Order ${orderId}: Current=${currentTotal}, PartCost=${priceAtTime}, Included=${deductFromWarehouse}, NewTotal=${newTotal}`
    );

    await prisma.service_order.update({
      where: { id: orderId },
      data: { total_cost: newTotal },
    });

    // Fetch updated order with all relations
    const updatedOrder = await prisma.service_order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        vehicle: true,
        employees: { include: { users: true } },
        service_task: true,
      },
    });

    // Fetch the created part with relations to return consistent structure
    const partWithRelations = await prisma.service_order_part.findUnique({
      where: { id: orderPart.id },
      include: {
        part: {
          select: {
            id: true,
            name: true,
            part_number: true,
            price: true,
          },
        },
      },
    });

    return NextResponse.json(
      { part: partWithRelations, order: updatedOrder },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating part assignment:", error);
    return NextResponse.json(
      { error: "Failed to create part assignment" },
      { status: 500 }
    );
  }
}
