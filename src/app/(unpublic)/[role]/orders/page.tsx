import { authorizePage } from "@/lib/authorize";

export default async function OrdersPage() {
  const session = await authorizePage(["client"]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Orders</h1>
      <p>Welcome, {session.user.name}! Here are your orders.</p>
    </div>
  );
}
