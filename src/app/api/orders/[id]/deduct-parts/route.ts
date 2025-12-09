import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST - deduct parts from warehouse for completed order or manual trigger
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Get order
    const order = await prisma.service_order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get all parts assigned to this order that should be deducted using raw SQL
    const partsToDeduct = await prisma.$queryRaw`
      SELECT sop.*, p.quantity as part_quantity, p.name as part_name
      FROM service_order_part sop
      JOIN part p ON sop.part_id = p.id
      WHERE sop.service_order_id = ${orderId}
      AND sop.deduct_from_warehouse = true
      AND sop.warehouse_deducted_at IS NULL
    `;

    // Deduct each part from warehouse
    const deductedParts = [];
    for (const orderPart of partsToDeduct as any[]) {
      // Check if warehouse has enough quantity
      if (orderPart.part_quantity < orderPart.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient quantity for part: ${orderPart.part_name}. Available: ${orderPart.part_quantity}, Needed: ${orderPart.quantity}`,
          },
          { status: 400 }
        );
      }

      // Deduct from warehouse
      await prisma.part.update({
        where: { id: orderPart.part_id },
        data: {
          quantity: {
            decrement: orderPart.quantity,
          },
        },
      });

      // Mark as deducted using raw SQL
      await prisma.$executeRaw`UPDATE service_order_part SET warehouse_deducted_at = NOW() WHERE id = ${orderPart.id}`;

      // Get the part name for response
      const part = await prisma.part.findUnique({
        where: { id: orderPart.part_id },
        select: { name: true, part_number: true },
      });

      deductedParts.push({
        id: orderPart.id,
        part: part,
      });
    }

    return NextResponse.json({
      message: `Successfully deducted ${deductedParts.length} part(s) from warehouse`,
      deductedParts,
    });
  } catch (error) {
    console.error("Error deducting parts:", error);
    return NextResponse.json(
      { error: "Failed to deduct parts from warehouse" },
      { status: 500 }
    );
  }
}
