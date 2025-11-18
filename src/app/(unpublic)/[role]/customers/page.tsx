// app/admin/users/page.tsx
import { authorizePage } from "@/lib/authorize";
import CustomersView from "../../../../components/pages/CustomerView";

export default async function UsersPage() {
  const session = await authorizePage(["admin"]);

  return <CustomersView session={session} />;
}
