import { authorizePage } from "@/lib/authorize";

export default async function UsersPage() {
  const session = await authorizePage(["admin"]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <p>Welcome, {session.user.name}! Only admins can view this page.</p>
    </div>
  );
}
