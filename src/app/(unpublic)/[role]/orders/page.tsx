import { OrdersView } from "@/components/pages/OrdersView";
import { authorizePage } from "@/lib/authorize";
import { ServiceOrders } from "@/types/serviceorders";
import { headers } from "next/headers";

export default async function OrdersPage() {
  const session = await authorizePage(["client", "admin", "mechanic"]);
  if (session?.user?.role === "ADMIN") {
    try {
      const h = await headers();
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const url = new URL("/api/orders", baseUrl).toString();
      const res = await fetch(url, {
        cache: "no-store",
        headers: Object.fromEntries(h.entries()),
      });
      const dataServiceOrders: ServiceOrders[] = res.ok ? await res.json() : [];
      return (
        <OrdersView dataServiceOrders={dataServiceOrders} session={session} />
      );
    } catch (error) {
      console.error(error);
      return <OrdersView dataServiceOrders={[]} session={session} />;
    }
  } else if (session?.user?.role === "MECHANIC") {
    try {
      const h = await headers();
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const url = new URL("/api/orders/mechanic", baseUrl).toString();
      const res = await fetch(url, {
        cache: "no-store",
        headers: Object.fromEntries(h.entries()),
      });
      const dataServiceOrders: ServiceOrders[] = res.ok ? await res.json() : [];
      return (
        <OrdersView dataServiceOrders={dataServiceOrders} session={session} />
      );
    } catch (error) {
      console.error(error);
      console.log("Returning empty orders for mechanic due to error.");
      return <OrdersView dataServiceOrders={[]} session={session} />;
    }
  } else {
    return <OrdersView dataServiceOrders={[]} session={session} />;
  }
}
