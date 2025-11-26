type User = {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};
type UserRole = "ADMIN" | "WAREHOUSE" | "MECHANIC" | "CLIENT";

export type { User, UserRole };
