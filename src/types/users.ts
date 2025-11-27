type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
};
type UserRole = "ADMIN" | "WAREHOUSE" | "MECHANIC" | "CLIENT";

export type { User, UserRole };
