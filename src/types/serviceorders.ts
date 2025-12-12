type ServiceOrders = {
  id: number;
  orderNumber: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  carLicensePlate: string;
  issue: string;
  description: string;
  status: StatusServiceOrder;
  startDate: string;
  endDate: string;
  total_cost: number;
  created_at: string;
  updated_at: string;
  progress: number;
  priority: string;
  mechanicFirstName: string;
  mechanicLastName: string;
};
export type PriorityOrder = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type StatusServiceOrder =
  | "NEW"
  | "IN_PROGRESS"
  | "WAITING_FOR_PARTS"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";
type Order = {
  id: number;
  orderNumber: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  carLicensePlate: string;
  issue: string;
  description: string;
  status: StatusServiceOrder;
  endDate: string;
  total_cost: number;
  progress: number;
  priority: string;
  mechanicFirstName: string;
  mechanicEmail: string;
  mechanicPhone: string;
  mechanicLastName: string;
  currentUserId?: number | null;
  currentEmployeeId?: number | null;
  paymentStatus?: string | null;
  task: Task[];
};
export type Task = {
  id: number;
  mechanic_id?: number | null;
  mechanicId?: number | null;
  mechanicUserId?: number | null;
  mechanicFirstName: string;
  mechanicLastName: string;
  title: string;
  description: string;
  status: StatusServiceOrder;
  created_at: string;
  updated_at: string;
  priority: PriorityOrder;
};
export type { ServiceOrders, Order };
