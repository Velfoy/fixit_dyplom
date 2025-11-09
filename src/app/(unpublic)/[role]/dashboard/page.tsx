import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Dashboard — {role?.toUpperCase()}
      </h1>

      {role === "admin" && (
        <p className="text-green-600">
          Welcome, admin! You can manage users and system settings.
        </p>
      )}

      {role === "client" && (
        <p className="text-blue-600">
          Welcome, client! Here you can view your orders and info.
        </p>
      )}

      {role === "mechanik" && (
        <p className="text-yellow-600">
          Welcome, mechanik! Here you can track repair jobs.
        </p>
      )}
    </div>
  );
}
