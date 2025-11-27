import { authorizePage } from "@/lib/authorize";
import UsersView from "@/components/pages/UsersView";
import type { User } from "@/types/users";

export default async function UsersPage() {
  const session = await authorizePage(["admin"]); // keep the role as you use it

  const res = await fetch("http://localhost:3000/api/users", {
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch users", res.status);
    // Fallback – empty array so the page still renders
    return <UsersView dataUsers={[]} session={session} />;
  }

  const data: User[] = await res.json();

  return <UsersView dataUsers={data} session={session} />;
}
