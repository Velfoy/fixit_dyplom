import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
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

// GET all cars
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        branches: true,
        customer: { include: { users: true } },
        service_order: true,
      },
      orderBy: { updated_at: "desc" },
    });

    const cars: Car[] = vehicles.map((v) => {
      // get latest service order
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

    return NextResponse.json(cars);
  } catch (error) {
    console.error("GET /api/cars error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}

// POST create new car
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.brand || !data.model || !data.vin || !data.customerId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        brand: data.brand,
        model: data.model,
        year: data.year ?? null,
        vin: data.vin,
        license_plate: data.license_plate ?? null,
        mileage: data.mileage ?? null,
        fuel_type: data.fuel_type ?? null,
        engine_size: data.engine_size ?? null,
        transmission: data.transmission ?? null,
        body_type: data.body_type ?? null,
        color: data.color ?? null,
        last_service: data.last_service ? new Date(data.last_service) : null,
        next_service: data.next_service ? new Date(data.next_service) : null,
        service_interval_km: data.service_interval_km ?? null,
        next_inspection: data.next_inspection
          ? new Date(data.next_inspection)
          : null,
        insurance_expiry: data.insurance_expiry
          ? new Date(data.insurance_expiry)
          : null,
        status: data.status ?? "NEW",
        branch_id: data.branchId ?? null,
        customer_id: data.customerId,
      },
      include: {
        branches: true,
        customer: { include: { users: true } },
      },
    });

    const car: Car = {
      id: vehicle.id,
      first_name: vehicle.customer?.users?.first_name || "",
      last_name: vehicle.customer?.users?.last_name || "",
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year ?? null,
      vin: vehicle.vin,
      license_plate: vehicle.license_plate || "",
      mileage: vehicle.mileage ?? null,
      fuel_type: mapFuelType(vehicle.fuel_type),
      engine_size: vehicle.engine_size || "",
      transmission: mapTransmission(vehicle.transmission),
      body_type: vehicle.body_type || "",
      color: vehicle.color || "",
      last_service: vehicle.last_service,
      next_service: vehicle.next_service,
      service_interval_km: vehicle.service_interval_km ?? null,
      next_inspection: vehicle.next_inspection,
      insurance_expiry: vehicle.insurance_expiry,
      status: mapStatus(vehicle.status),
      branchId: vehicle.branch_id,
      customerId: vehicle.customer_id,
      branchName: vehicle.branches?.name || "",
      created_at: vehicle.created_at.toISOString(),
      updated_at: vehicle.updated_at.toISOString(),
    };

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error("POST /api/cars error:", error);
    return NextResponse.json(
      { error: "Failed to create car" },
      { status: 500 }
    );
  }
}

// PUT update existing car
export async function PUT(req: Request) {
  try {
    const data = await req.json();

    if (!data.id) {
      return NextResponse.json(
        { error: "Car ID is required" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: data.id },
      data: {
        brand: data.brand,
        model: data.model,
        year: data.year ?? null,
        vin: data.vin,
        license_plate: data.license_plate ?? null,
        mileage: data.mileage ?? null,
        fuel_type: data.fuel_type ?? null,
        engine_size: data.engine_size ?? null,
        transmission: data.transmission ?? null,
        body_type: data.body_type ?? null,
        color: data.color ?? null,
        last_service: data.last_service ? new Date(data.last_service) : null,
        next_service: data.next_service ? new Date(data.next_service) : null,
        service_interval_km: data.service_interval_km ?? null,
        next_inspection: data.next_inspection
          ? new Date(data.next_inspection)
          : null,
        insurance_expiry: data.insurance_expiry
          ? new Date(data.insurance_expiry)
          : null,
        status: data.status ?? "NEW",
        branch_id: data.branchId ?? null,
        customer_id: data.customerId ?? undefined,
      },
      include: {
        branches: true,
        customer: { include: { users: true } },
      },
    });

    const car: Car = {
      id: vehicle.id,
      first_name: vehicle.customer?.users?.first_name || "",
      last_name: vehicle.customer?.users?.last_name || "",
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year ?? null,
      vin: vehicle.vin,
      license_plate: vehicle.license_plate || "",
      mileage: vehicle.mileage ?? null,
      fuel_type: mapFuelType(vehicle.fuel_type),
      engine_size: vehicle.engine_size || "",
      transmission: mapTransmission(vehicle.transmission),
      body_type: vehicle.body_type || "",
      color: vehicle.color || "",
      last_service: vehicle.last_service,
      next_service: vehicle.next_service,
      service_interval_km: vehicle.service_interval_km ?? null,
      next_inspection: vehicle.next_inspection,
      insurance_expiry: vehicle.insurance_expiry,
      status: mapStatus(vehicle.status),
      branchId: vehicle.branch_id,
      customerId: vehicle.customer_id,
      branchName: vehicle.branches?.name || "",
      created_at: vehicle.created_at.toISOString(),
      updated_at: vehicle.updated_at.toISOString(),
    };

    return NextResponse.json(car, { status: 200 });
  } catch (error) {
    console.error("PUT /api/cars error:", error);
    return NextResponse.json(
      { error: "Failed to update car" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Car id is required" },
        { status: 400 }
      );
    }

    const carId = Number(id);

    // Optional: check if the car exists
    const existingCar = await prisma.vehicle.findUnique({
      where: { id: carId },
    });
    if (!existingCar) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    // Delete the car
    await prisma.vehicle.delete({ where: { id: carId } });

    return NextResponse.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error);
    return NextResponse.json(
      { error: "Failed to delete car" },
      { status: 500 }
    );
  }
}
