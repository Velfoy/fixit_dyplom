export type FuelType = "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID";
export type Transmission = "AUTOMATIC" | "MANUAL";
export type StatusCar =
  | "NEW"
  | "IN_PROGRESS"
  | "WAITING_FOR_PARTS"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export interface Car {
  id: number;
  first_name: string;
  last_name: string;
  brand: string;
  model: string;
  year?: number | null;
  vin: string;
  license_plate: string;
  mileage?: number | null;
  fuel_type?: FuelType | null;
  engine_size: string;
  transmission?: Transmission | null;
  body_type: string;
  color: string;
  last_service?: Date | string | null;
  next_service?: Date | string | null;
  service_interval_km?: number | null;
  next_inspection?: Date | string | null;
  insurance_expiry?: Date | string | null;
  status: StatusCar;
  branchId: number | null;
  customerId: number | null;
  branchName: string;
  created_at: string;
  updated_at: string;
}
