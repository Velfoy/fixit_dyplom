import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { StatusServiceOrder } from "@/types/serviceorders";
import getCachedSession from "@/lib/session";

function mapOrder(
  o: any,
  currentUserId: number | null = null,
  currentEmployeeId: number | null = null
) {
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
    endDate: o.end_date?.toISOString() || "",
    total_cost: Number(o.total_cost) || 0,
    progress: Number(o.progress) || 0,
    priority: o.priority || "NORMAL",
    mechanicFirstName: o.employees?.users?.first_name || "",
    mechanicLastName: o.employees?.users?.last_name || "",
    mechanicEmail: o.employees?.users?.email || "",
    mechanicPhone: o.employees?.users?.phone || "",
    currentUserId,
    currentEmployeeId,
    task: (o.service_task || []).map((t: any) => ({
      id: t.id,
      mechanic_id: t.mechanic_id ?? null,
      mechanicId: t.mechanic_id ?? null,
      mechanicUserId: t.employees?.user_id ?? t.employees?.users?.id ?? null,
      mechanicFirstName: t.employees?.users?.first_name || "",
      mechanicLastName: t.employees?.users?.last_name || "",
      title: t.title,
      description: t.description || "",
      status: t.status as StatusServiceOrder,
      created_at: t.created_at.toISOString(),
      updated_at: t.updated_at.toISOString(),
      priority: t.priority as any,
    })),
  };
}

export async function GET(req: NextRequest, context: any) {
  try {
    const session = await getCachedSession();
    const sessionUserId = Number(session?.user?.id) || null;
    let sessionEmployeeId: number | null = null;
    if (sessionUserId) {
      const employee = await prisma.employees.findUnique({
        where: { user_id: sessionUserId },
        select: { id: true },
      });
      sessionEmployeeId = employee?.id ?? null;
    }

    const params = await context.params;
    const id = Number(params?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const o = await prisma.service_order.findUnique({
      where: { id },
      include: {
        vehicle: true,
        employees: { include: { users: true } },
        service_task: { include: { employees: { include: { users: true } } } },
      },
    });

    if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(mapOrder(o, sessionUserId, sessionEmployeeId), {
      status: 200,
    });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: any) {
  try {
    const session = await getCachedSession();
    const sessionUserId = Number(session?.user?.id) || null;
    let sessionEmployeeId: number | null = null;
    if (sessionUserId) {
      const employee = await prisma.employees.findUnique({
        where: { user_id: sessionUserId },
        select: { id: true },
      });
      sessionEmployeeId = employee?.id ?? null;
    }

    const params = await context.params;
    const id = Number(params?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const { issue, description, endDate, total_cost, priority, status } = body;

    // If completing the order, automatically deduct warehouse parts
    if (status === "COMPLETED") {
      // Get all parts that need to be deducted
      const partsToDeduct = await prisma.$queryRaw`
        SELECT sop.*, p.quantity as part_quantity, p.name as part_name
        FROM service_order_part sop
        JOIN part p ON sop.part_id = p.id
        WHERE sop.service_order_id = ${id}
        AND sop.deduct_from_warehouse = true
        AND sop.warehouse_deducted_at IS NULL
      `;

      // Deduct each part from warehouse
      for (const orderPart of partsToDeduct as any[]) {
        // Check if warehouse has enough quantity
        if (orderPart.part_quantity < orderPart.quantity) {
          return NextResponse.json(
            {
              error: `Cannot complete order: Insufficient quantity for part "${orderPart.part_name}". Available: ${orderPart.part_quantity}, Needed: ${orderPart.quantity}`,
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

        // Mark as deducted
        await prisma.$executeRaw`UPDATE service_order_part SET warehouse_deducted_at = NOW() WHERE id = ${orderPart.id}`;
      }
    }

    const updated = await prisma.service_order.update({
      where: { id },
      data: {
        issue: issue ?? undefined,
        description: description ?? undefined,
        end_date: endDate ? new Date(endDate) : undefined,
        total_cost: total_cost !== undefined ? Number(total_cost) : undefined,
        priority: priority ?? undefined,
        status: status ?? undefined,
      },
      include: {
        vehicle: true,
        employees: { include: { users: true } },
        service_task: { include: { employees: { include: { users: true } } } },
      },
    });

    return NextResponse.json(
      mapOrder(updated, sessionUserId, sessionEmployeeId),
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
