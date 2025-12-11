import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Mechanic, EmploymentType } from "@/types/mechanics";
import { error } from "console";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minimal = searchParams.get("minimal") === "true";

    const usersWithEmployees = await prisma.users.findMany({
      include: {
        employees: {
          include: { branches: true },
        },
      },
    });

    const mechanicsUsers = usersWithEmployees.filter(
      (u) => u.employees !== null
    );
    if (minimal) {
      const minimalMechanics = await prisma.employees.findMany({
        // where: {
        //   NOT: {
        //     service_order: {
        //       some: {
        //         status: { notIn: ["COMPLETED", "CANCELLED"] },
        //       },
        //     },
        //   },
        // },
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      const minimalMechanicsFormatted = minimalMechanics.map((m) => ({
        id: m.id,
        first_name: m.users.first_name,
        last_name: m.users.last_name,
        email: m.users.email,
        specialization: m.specialization,
      }));
      return NextResponse.json(minimalMechanicsFormatted, { status: 200 });
    }
    const mechanics: Mechanic[] = await Promise.all(
      mechanicsUsers.map(async (u) => {
        const emp = u.employees!;

        const orderStats = await prisma.service_order.groupBy({
          by: ["status"],
          where: { mechanic_id: emp.id },
          _count: { id: true },
          _sum: { total_cost: true },
        });

        const totalOrders: { [status: string]: number } = {};
        let totalRevenue = 0;
        orderStats.forEach((s) => {
          totalOrders[s.status] = s._count.id;
          totalRevenue += Number(s._sum.total_cost ?? 0);
        });

        return {
          id: emp.id,
          firstName: u.first_name ?? "",
          lastName: u.last_name ?? "",
          phone: u.phone ?? "",
          email: u.email ?? "",
          salary: emp.salary?.toNumber() ?? 0,
          employment_type: emp.employment_type as EmploymentType,
          is_Active: emp.is_active,
          specialization: emp.specialization ?? "",
          position: emp.position ?? "",
          branchId: emp.branch_id ?? 0,
          branchName: emp.branches?.name ?? "",
          hired_at: emp.hired_at,
          terminated_at: emp.terminated_at?.toISOString() ?? "",
          createdAt: emp.created_at.toISOString(),
          updatedAt: emp.updated_at.toISOString(),
          totalOrders,
          totalRevenue,
        };
      })
    );

    return NextResponse.json(mechanics, { status: 200 });
  } catch (err) {
    console.error("GET /api/mechanics error:", err);
    return NextResponse.json(
      { error: "Failed to fetch mechanics" },
      { status: 500 }
    );
  }
}

//POST /api/mechanics
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      position,
      salary,
      branch_id,
      user_id,
      hired_at,
      terminated_at,
      employment_type,
      is_active,
      specialization,
    } = body;
    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }
    const existingMechanic = await prisma.employees.findUnique({
      where: { user_id },
    });
    if (existingMechanic) {
      return NextResponse.json(
        {
          error: "Mechanic with such user id already exists",
        },
        { status: 400 }
      );
    }
    const mechanic = await prisma.employees.create({
      data: {
        position,
        salary,
        branch_id,
        user_id,
        hired_at,
        terminated_at,
        employment_type,
        is_active,
        specialization,
      },
    });
    const mechanicWithRealtions = await prisma.employees.findUnique({
      where: { id: mechanic.id },
      include: { users: true, branches: true },
    });
    return NextResponse.json({
      id: mechanic.id,
      firstName: mechanicWithRealtions?.users?.first_name ?? "",
      lastName: mechanicWithRealtions?.users.last_name ?? "",
      phone: mechanicWithRealtions?.users.phone ?? "",
      email: mechanicWithRealtions?.users.email ?? "",
      salary: mechanicWithRealtions?.salary ?? "",
      employment_type: mechanicWithRealtions?.employment_type ?? "FULL_TIME",
      is_active: mechanicWithRealtions?.is_active ?? "",
      specialization: mechanicWithRealtions?.specialization ?? "",
      position: mechanicWithRealtions?.position ?? "",
      branch_id: mechanicWithRealtions?.branch_id ?? "",
      branchName: mechanicWithRealtions?.branches?.name ?? "",
      hired_at: mechanicWithRealtions?.hired_at ?? "",
      terminated_at: mechanicWithRealtions?.terminated_at ?? "",
      totalOrders: 0,
      totalRevenue: 0,
    });
  } catch (error) {
    console.error("POST /api/mechanics error:", error);
    return NextResponse.json(
      { error: "Failed to create mechanic" },
      { status: 500 }
    );
  }
}

//PUT /api/mechanics
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      salary,
      employment_type,
      is_active,
      specialization,
      position,
      hired_at,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing mechanic id" },
        { status: 400 }
      );
    }

    // 1️⃣ Check if mechanic exists
    const existingMechanic = await prisma.employees.findUnique({
      where: { id: Number(id) },
      include: { users: true },
    });

    if (!existingMechanic) {
      return NextResponse.json(
        { error: "Mechanic not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Update mechanic
    const updatedMechanic = await prisma.employees.update({
      where: { id: Number(id) },
      data: {
        salary: salary ?? existingMechanic.salary,
        employment_type: employment_type ?? existingMechanic.employment_type,
        is_active: is_active ?? existingMechanic.is_active,
        specialization: specialization ?? existingMechanic.specialization,
        position: position ?? existingMechanic.position,
        hired_at: hired_at ? new Date(hired_at) : existingMechanic.hired_at,
      },
      include: {
        users: true,
        branches: true,
      },
    });

    // 3️⃣ Recalculate order stats (important!)
    const orderStats = await prisma.service_order.groupBy({
      by: ["status"],
      where: { mechanic_id: updatedMechanic.id },
      _count: { id: true },
      _sum: { total_cost: true },
    });

    const totalOrders: { [status: string]: number } = {};
    let totalRevenue = 0;

    orderStats.forEach((s) => {
      totalOrders[s.status] = s._count.id;
      totalRevenue += Number(s._sum.total_cost ?? 0);
    });

    // 4️⃣ Return final mechanic object
    return NextResponse.json(
      {
        id: updatedMechanic.id,
        firstName: updatedMechanic.users?.first_name ?? "",
        lastName: updatedMechanic.users?.last_name ?? "",
        phone: updatedMechanic.users?.phone ?? "",
        email: updatedMechanic.users?.email ?? "",
        salary: updatedMechanic.salary?.toNumber?.() ?? updatedMechanic.salary,
        employment_type: updatedMechanic.employment_type,
        is_Active: updatedMechanic.is_active,
        specialization: updatedMechanic.specialization ?? "",
        position: updatedMechanic.position ?? "",
        branchId: updatedMechanic.branch_id ?? 0,
        branchName: updatedMechanic.branches?.name ?? "",
        hired_at: updatedMechanic.hired_at?.toISOString() ?? "",
        terminated_at: updatedMechanic.terminated_at?.toISOString() ?? "",
        createdAt: updatedMechanic.created_at.toISOString(),
        updatedAt: updatedMechanic.updated_at.toISOString(),
        totalOrders,
        totalRevenue,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/mechanics error:", error);
    return NextResponse.json(
      { error: "Failed to update mechanic" },
      { status: 500 }
    );
  }
}
