import prisma from "@/lib/prisma";
import {
  PriorityOrder,
  ServiceOrders,
  StatusServiceOrder,
} from "@/types/serviceorders";
import { NextRequest, NextResponse } from "next/server";
import getCachedSession from "@/lib/session";
export async function GET() {
  try {
    const session = await getCachedSession();
    const userId = Number(session?.user?.id);
    if (!userId || Number.isNaN(userId)) {
      console.warn("/api/orders/user: missing userId in session", {
        sessionUser: session?.user,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { user_id: userId },
    });

    if (!customer) {
      console.warn("/api/orders/user: no customer for user", { userId });
      return NextResponse.json([], { status: 202 });
    }

    const orders = await prisma.service_order.findMany({
      where: {
        customer_id: customer.id,
      },
      include: {
        vehicle: true,
        employees: { include: { users: true } },
        service_task: { include: { employees: { include: { users: true } } } },
      },
      orderBy: { updated_at: "desc" },
    });

    console.info("/api/orders/user: fetched", {
      userId,
      customerId: customer.id,
      ordersCount: orders.length,
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
    console.error("GET /api/orders/user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
