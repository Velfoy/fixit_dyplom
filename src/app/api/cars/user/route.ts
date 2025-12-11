import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import getCachedSession from "@/lib/session";
import type { Car, FuelType, Transmission, StatusCar } from "@/types/car";

function mapFuelType(fuel: string | null): FuelType | null {
  if (!fuel) return null;
  const value = fuel.toUpperCase();
  if (["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID"].includes(value)) {
    return value as FuelType;
  }
  return null;
}

function mapTransmission(trans: string | null): Transmission | null {
  if (!trans) return null;
  const value = trans.toUpperCase();
  if (["AUTOMATIC", "MANUAL"].includes(value)) {
    return value as Transmission;
  }
  return null;
}

function mapStatus(status: string | null): StatusCar {
  const value = status?.toUpperCase();
  if (
    [
      "NEW",
      "IN_PROGRESS",
      "WAITING_FOR_PARTS",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ].includes(value!)
  ) {
    return value as StatusCar;
  }
  return "NEW";
}

export async function GET() {
  try {
    const session = await getCachedSession();
    const userId = Number(session?.user?.id);

    if (!userId || Number.isNaN(userId)) {
      console.warn("/api/cars/user: missing userId in session", {
        sessionUser: session?.user,
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { user_id: userId },
    });

    if (!customer) {
      console.warn("/api/cars/user: no customer for user", { userId });
      return NextResponse.json([], { status: 200 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        customer_id: customer.id,
      },
      include: {
        branches: true,
        customer: { include: { users: true } },
        service_order: true,
      },
      orderBy: { updated_at: "desc" },
    });

    const cars: Car[] = vehicles.map((v) => {
      const latestOrder =
        v.service_order && v.service_order.length > 0
          ? [...v.service_order].sort(
              (a, b) => b.updated_at.getTime() - a.updated_at.getTime()
            )[0]
          : null;

      return {
        id: v.id,
        first_name: v.customer?.users?.first_name || "",
        last_name: v.customer?.users?.last_name || "",
        brand: v.brand,
        model: v.model,
        year: v.year ?? null,
        vin: v.vin,
        license_plate: v.license_plate || "",
        mileage: v.mileage ?? null,
        fuel_type: mapFuelType(v.fuel_type),
        engine_size: v.engine_size || "",
        transmission: mapTransmission(v.transmission),
        body_type: v.body_type || "",
        color: v.color || "",
        last_service: v.last_service,
        next_service: v.next_service,
        service_interval_km: v.service_interval_km ?? null,
        next_inspection: v.next_inspection,
        insurance_expiry: v.insurance_expiry,
        status: mapStatus(latestOrder?.status ?? v.status),
        branchId: v.branch_id,
        customerId: v.customer_id,
        branchName: v.branches?.name || "",
        created_at: v.created_at.toISOString(),
        updated_at: v.updated_at.toISOString(),
      };
    });

    console.info("/api/cars/user: fetched", {
      userId,
      customerId: customer.id,
      carsCount: vehicles.length,
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error("GET /api/cars/user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}
