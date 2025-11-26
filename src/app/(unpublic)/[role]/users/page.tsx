import { authorizePage } from "@/lib/authorize";
import UsersView from "@/components/pages/UsersView";
import type { User } from "@/types/users";

export default async function UsersPage() {
  const session = await authorizePage(["admin"]);
  // const data = await fetch(
  //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers`,
  //   {
  //     headers: {
  //       Cookie: `next-auth.session-token=${session?.user?.sessionToken}`,
  //     },
  //   }
  // ).then((res) => res.json());
  const data: User[] = [];

  return <UsersView dataUsers={data} session={session} />;
}
