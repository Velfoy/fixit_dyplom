import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { StatusServiceOrder } from "@/types/serviceorders";
import getCachedSession from "@/lib/session";

function mapOrder(
  o: any,
  currentUserId: number | null = null,
  currentEmployeeId: number | null = null
) {
  // Check if there's a successful payment
  const hasSuccessfulPayment = o.payment?.some(
    (p: any) => p.status === "SUCCESS"
  );
  const paymentStatus = hasSuccessfulPayment ? "PAID" : null;

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
    paymentStatus,
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
        payment: true,
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
    const {
      issue,
      description,
      endDate,
      total_cost,
      priority,
      status,
      paymentStatus,
      paidAt,
      paidAmount,
    } = body;

    // If payment status is being updated
    if (paymentStatus === "PAID") {
      // Find or create invoice for this order
      let invoice = await prisma.invoice.findFirst({
        where: { service_order_id: id },
      });

      if (!invoice) {
        // Create invoice if it doesn't exist
        invoice = await prisma.invoice.create({
          data: {
            invoice_number: `INV-${id}-${Date.now()}`,
            service_order_id: id,
            total_amount: paidAmount || 0,
            tax_amount: 0,
            status: "PAID",
            paid_at: new Date(paidAt || Date.now()),
          },
        });
      } else {
        // Update existing invoice
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            total_amount: paidAmount || 0,
            status: "PAID",
            paid_at: new Date(paidAt || Date.now()),
          },
        });
      }

      // Create payment record
      await prisma.payment.create({
        data: {
          invoice_id: invoice.id,
          service_order_id: id,
          payment_provider: "STRIPE",
          provider_transaction_id: body.transactionId || null,
          method: "CARD",
          status: "SUCCESS",
          amount: paidAmount || 0,
          currency: "USD",
          completed_at: new Date(),
        },
      });
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
        payment: true,
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
