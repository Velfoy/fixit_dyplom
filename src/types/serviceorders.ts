type ServiceOrders = {
  id: string;
  orderNumber: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  description: string;
  status: StatusServiceOrder;
  startDate: Date;
  endDate: Date;
  total_cost: number;
  created_at: string;
  updated_at: string;
  progress: number;
  mechanicFirstName: string;
  mechanicLastName: string;
};
export type StatusServiceOrder =
  | "NEW"
  | "IN_PROGRESS"
  | "WAITING_FOR_PARTS"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type { ServiceOrders };
