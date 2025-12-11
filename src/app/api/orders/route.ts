import prisma from "@/lib/prisma";
import {
  PriorityOrder,
  ServiceOrders,
  StatusServiceOrder,
} from "@/types/serviceorders";
import { NextRequest, NextResponse } from "next/server";
export async function GET() {
  try {
    const orders = await prisma.service_order.findMany({
      include: {
        vehicle: true,
        employees: { include: { users: true } },
      },
      orderBy: { updated_at: "desc" },
    });
    const ordersGet: ServiceOrders[] = orders.map((o) => {
      return {
        id: o.id,
        orderNumber: o.order_number,
        carBrand: o.vehicle?.brand || "",
        carModel: o.vehicle?.model || "",
        carYear: o.vehicle?.year?.toString() || "",
        carLicensePlate: o.vehicle?.license_plate || "",
        issue: o.issue || "",
        description: o.description || "",
        status: o.status as StatusServiceOrder,
        startDate: o.start_date?.toISOString() || "",
        endDate: o.end_date?.toISOString() || "",
        total_cost: Number(o.total_cost) || 0,
        created_at: o.created_at.toISOString(),
        updated_at: o.updated_at.toISOString(),
        progress: Number(o.progress) || 0,
        priority: o.priority as PriorityOrder,
        mechanicFirstName: o?.employees?.users.first_name || "",
        mechanicLastName: o?.employees?.users.last_name || "",
      };
    });
    return NextResponse.json(ordersGet, { status: 202 });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerId,
      vehicleId,
      mechanicId,
      orderNumber,
      issue,
      description,
      status,
      startDate,
      endDate,
      total_cost,
      priority,
    } = body;

    if (
      !customerId ||
      !vehicleId ||
      !mechanicId ||
      !issue ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newOrder = await prisma.service_order.create({
      data: {
        order_number: orderNumber || `SO-${Date.now()}`,
        vehicle_id: vehicleId,
        customer_id: customerId,
        mechanic_id: mechanicId,
        issue,
        description: description || null,
        status: (status as StatusServiceOrder) || "NEW",
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        total_cost: Number(total_cost) || 0,
        progress: 0,
        priority: (priority as PriorityOrder) || "NORMAL",
      },
      include: {
        vehicle: true,
      },
    });

    const mechanic = await prisma.users.findUnique({
      where: { id: mechanicId },
    });

    const formattedOrder: ServiceOrders = {
      id: newOrder.id,
      orderNumber: newOrder.order_number,
      carBrand: newOrder.vehicle?.brand || "",
      carModel: newOrder.vehicle?.model || "",
      carLicensePlate: newOrder.vehicle?.license_plate || "",
      carYear: newOrder.vehicle?.year?.toString() || "",
      issue: newOrder.issue || "",
      description: newOrder.description || "",
      status: newOrder.status as StatusServiceOrder,
      startDate: newOrder.start_date.toISOString(),
      endDate: newOrder.end_date?.toISOString() || "",
      total_cost: Number(newOrder.total_cost),
      created_at: newOrder.created_at.toISOString(),
      updated_at: newOrder.updated_at.toISOString(),
      progress: Number(newOrder.progress),
      priority: newOrder.priority as PriorityOrder,
      mechanicFirstName: mechanic?.first_name || "",
      mechanicLastName: mechanic?.last_name || "",
    };

    return NextResponse.json(formattedOrder, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    const orderId = Number(id);

    if (!orderId || Number.isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid part ID" }, { status: 400 });
    }
    const deletedUser = await prisma.service_order
      .delete({ where: { id: orderId } })
      .catch((err) => {
        console.error("Prisma delete error", err);
        return null;
      });
    if (!deletedUser) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting car:", error);
    return NextResponse.json(
      { error: "Failed to delete car" },
      { status: 500 }
    );
  }
}
