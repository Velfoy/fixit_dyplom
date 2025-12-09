import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
    partId: string;
  }>;
}

// DELETE a part from order
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id, partId } = await params;
    const orderId = parseInt(id);
    const partIdNum = parseInt(partId);

    if (isNaN(orderId) || isNaN(partIdNum)) {
      return NextResponse.json(
        { error: "Invalid order ID or part ID" },
        { status: 400 }
      );
    }

    // Verify part exists and belongs to order
    const orderPart = await prisma.service_order_part.findUnique({
      where: { id: partIdNum },
    });

    if (!orderPart || orderPart.service_order_id !== orderId) {
      return NextResponse.json(
        { error: "Part not found or does not belong to this order" },
        { status: 404 }
      );
    }

    // Get order before deletion
    const order = await prisma.service_order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Calculate new total - SUBTRACT the part cost if it was included
    const currentTotal = order.total_cost
      ? parseFloat(order.total_cost.toString())
      : 0;

    const partCost = orderPart.price_at_time
      ? parseFloat(orderPart.price_at_time.toString())
      : 0;

    const newTotal = orderPart.deductFromWarehouse
      ? currentTotal - partCost
      : currentTotal;

    console.log(
      `[DELETE] Order ${orderId}: Current=${currentTotal}, PartCost=${partCost}, WasIncluded=${orderPart.deductFromWarehouse}, NewTotal=${newTotal}`
    );

    // Delete the part
    await prisma.service_order_part.delete({
      where: { id: partIdNum },
    });

    // Update order total
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

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error deleting part:", error);
    return NextResponse.json(
      { error: "Failed to delete part" },
      { status: 500 }
    );
  }
}

// PUT - update deduct_from_warehouse flag or quantity
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id, partId } = await params;
    const orderId = parseInt(id);
    const partIdNum = parseInt(partId);

    if (isNaN(orderId) || isNaN(partIdNum)) {
      return NextResponse.json(
        { error: "Invalid order ID or part ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { deductFromWarehouse, quantity, priceAtTime } = body;

    // Verify part exists and belongs to order
    const orderPart = await prisma.service_order_part.findUnique({
      where: { id: partIdNum },
    });

    if (!orderPart || orderPart.service_order_id !== orderId) {
      return NextResponse.json(
        { error: "Part not found or does not belong to this order" },
        { status: 404 }
      );
    }

    // Get order before update
    const order = await prisma.service_order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update part
    const updateData: any = {};
    if (quantity !== undefined) {
      updateData.quantity = quantity;
    }
    if (priceAtTime !== undefined) {
      updateData.price_at_time = parseFloat(priceAtTime.toString());
    }

    const updatedPart = await prisma.service_order_part.update({
      where: { id: partIdNum },
      data: updateData,
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

    // Update deduct_from_warehouse flag using raw SQL if needed
    if (deductFromWarehouse !== undefined) {
      await prisma.$executeRaw`UPDATE service_order_part SET deduct_from_warehouse = ${deductFromWarehouse} WHERE id = ${partIdNum}`;
    }

    // Fetch the updated part again to get the latest deductFromWarehouse flag
    const finalPart = await prisma.service_order_part.findUnique({
      where: { id: partIdNum },
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

    // Update order total_cost - ADD or SUBTRACT based on toggle
    const currentTotal = order.total_cost
      ? parseFloat(order.total_cost.toString())
      : 0;

    const partCost = finalPart?.price_at_time
      ? parseFloat(finalPart.price_at_time.toString())
      : 0;

    // If toggling TO true (was false): ADD part cost
    // If toggling TO false (was true): SUBTRACT part cost
    let newTotal = currentTotal;
    if (deductFromWarehouse !== undefined) {
      if (deductFromWarehouse) {
        // Toggled from false to true - ADD
        newTotal = currentTotal + partCost;
      } else {
        // Toggled from true to false - SUBTRACT
        newTotal = currentTotal - partCost;
      }
    }

    console.log(
      `[PUT] Order ${orderId}: Current=${currentTotal}, PartCost=${partCost}, NewFlag=${deductFromWarehouse}, NewTotal=${newTotal}`
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

    return NextResponse.json({ part: finalPart, order: updatedOrder });
  } catch (error) {
    console.error("Error updating part:", error);
    return NextResponse.json(
      { error: "Failed to update part" },
      { status: 500 }
    );
  }
}
