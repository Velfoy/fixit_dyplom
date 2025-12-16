import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCachedSession } from "@/lib/session";

async function getAdminStats() {
  const [
    totalUsers,
    totalCustomers,
    totalMechanics,
    orderStats,
    warehouseStats,
  ] = await Promise.all([
    prisma.users.count(),
    prisma.customer.count(),
    prisma.employees.count({ where: { position: "MECHANIC" } }),
    prisma.service_order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.part.aggregate({
      _count: { id: true },
      _sum: { quantity: true },
    }),
  ]);

  const totalOrders = orderStats.reduce(
    (sum: number, stat: any) => sum + stat._count.id,
    0
  );
  const newOrders =
    orderStats.find((s: any) => s.status === "NEW")?._count.id || 0;
  const inProgressOrders =
    orderStats.find((s: any) => s.status === "IN_PROGRESS")?._count.id || 0;
  const waitingOrders =
    orderStats.find((s: any) => s.status === "WAITING_FOR_PARTS")?._count.id ||
    0;
  const readyOrders =
    orderStats.find((s: any) => s.status === "READY")?._count.id || 0;
  const completedOrders =
    orderStats.find((s: any) => s.status === "COMPLETED")?._count.id || 0;
  const cancelledOrders =
    orderStats.find((s: any) => s.status === "CANCELLED")?._count.id || 0;

  return {
    totalUsers,
    totalCustomers,
    totalMechanics,
    totalOrders,
    newOrders,
    inProgressOrders,
    waitingOrders,
    readyOrders,
    completedOrders,
    cancelledOrders,
    statusBreakdown: [
      { status: "NEW", label: "New", count: newOrders },
      { status: "IN_PROGRESS", label: "In Progress", count: inProgressOrders },
      {
        status: "WAITING_FOR_PARTS",
        label: "Waiting for Parts",
        count: waitingOrders,
      },
      { status: "READY", label: "Ready", count: readyOrders },
      { status: "COMPLETED", label: "Completed", count: completedOrders },
      { status: "CANCELLED", label: "Cancelled", count: cancelledOrders },
    ],
    totalParts: warehouseStats._count.id || 0,
    totalPartsQuantity: warehouseStats._sum.quantity || 0,
  };
}

async function getClientStats(userId: number) {
  const [myOrders, myCars] = await Promise.all([
    prisma.service_order.groupBy({
      by: ["status"],
      where: { customer: { user_id: userId } },
      _count: { id: true },
    }),
    prisma.vehicle.count({ where: { customer: { user_id: userId } } }),
  ]);

  const totalOrders = myOrders.reduce(
    (sum: number, stat: any) => sum + stat._count.id,
    0
  );
  const newOrders =
    myOrders.find((s: any) => s.status === "NEW")?._count.id || 0;
  const inProgressOrders =
    myOrders.find((s: any) => s.status === "IN_PROGRESS")?._count.id || 0;
  const waitingOrders =
    myOrders.find((s: any) => s.status === "WAITING_FOR_PARTS")?._count.id || 0;
  const readyOrders =
    myOrders.find((s: any) => s.status === "READY")?._count.id || 0;
  const completedOrders =
    myOrders.find((s: any) => s.status === "COMPLETED")?._count.id || 0;
  const cancelledOrders =
    myOrders.find((s: any) => s.status === "CANCELLED")?._count.id || 0;

  return {
    totalOrders,
    newOrders,
    inProgressOrders,
    waitingOrders,
    readyOrders,
    completedOrders,
    cancelledOrders,
    statusBreakdown: [
      { status: "NEW", label: "New", count: newOrders },
      { status: "IN_PROGRESS", label: "In Progress", count: inProgressOrders },
      {
        status: "WAITING_FOR_PARTS",
        label: "Waiting for Parts",
        count: waitingOrders,
      },
      { status: "READY", label: "Ready", count: readyOrders },
      { status: "COMPLETED", label: "Completed", count: completedOrders },
      { status: "CANCELLED", label: "Cancelled", count: cancelledOrders },
    ],
    myCars,
  };
}

async function getMechanicStats(userId: number) {
  const employee = await prisma.employees.findFirst({
    where: { user_id: userId },
  });

  if (!employee) {
    return {
      assignedOrders: 0,
      pendingOrders: 0,
      inProgressOrders: 0,
      completedOrders: 0,
    };
  }

  const [assignedTasks, orderStats] = await Promise.all([
    prisma.service_task.count({ where: { mechanic_id: employee.id } }),
    prisma.service_task.groupBy({
      by: ["status"],
      where: { mechanic_id: employee.id },
      _count: { id: true },
    }),
  ]);

  const pendingTasks =
    orderStats.find((s: any) => s.status === "PENDING")?._count.id || 0;
  const inProgressTasks =
    orderStats.find((s: any) => s.status === "IN_PROGRESS")?._count.id || 0;
  const completedTasks =
    orderStats.find((s: any) => s.status === "DONE")?._count.id || 0;
  const blockedTasks =
    orderStats.find((s: any) => s.status === "BLOCKED")?._count.id || 0;

  return {
    assignedOrders: assignedTasks,
    pendingOrders: pendingTasks,
    inProgressOrders: inProgressTasks,
    completedOrders: completedTasks,
    blockedOrders: blockedTasks,
  };
}

async function getWarehouseStats() {
  const [totalParts, lowStock, recentOrders] = await Promise.all([
    prisma.part.count(),
    prisma.part.count({ where: { quantity: { lte: 10 } } }),
    prisma.service_order.count({
      where: {
        created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const totalValue = await prisma.part.aggregate({
    _sum: { quantity: true },
  });

  return {
    totalParts,
    lowStock,
    recentOrders,
    totalQuantity: totalValue._sum.quantity || 0,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getCachedSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role?.toLowerCase();
    const userId = session.user.id ? Number(session.user.id) : 0;

    let stats = null;

    if (role === "admin") {
      stats = await getAdminStats();
    } else if (role === "client") {
      stats = await getClientStats(userId);
    } else if (role === "mechanic") {
      stats = await getMechanicStats(userId);
    } else if (role === "warehouse") {
      stats = await getWarehouseStats();
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    return NextResponse.json({ stats, role });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
