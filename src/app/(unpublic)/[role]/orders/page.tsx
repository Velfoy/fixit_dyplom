import { OrdersView } from "@/components/pages/OrdersView";
import { authorizePage } from "@/lib/authorize";
import { ServiceOrders } from "@/types/serviceorders";

export default async function OrdersPage() {
  const session = await authorizePage(["client", "admin", "mechanic"]);
  const dataServiceOrders: ServiceOrders[] = [];
  return <OrdersView dataServiceOrders={dataServiceOrders} session={session} />;
}
