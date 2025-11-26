import { authorizePage } from "@/lib/authorize";
import MechanicsView from "@/components/pages/MechanicsView";
import type { Mechanic } from "@/types/mechanics";

export default async function MechanicsPage() {
  const session = await authorizePage(["admin"]);
  // const data = await fetch(
  //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/customers`,
  //   {
  //     headers: {
  //       Cookie: `next-auth.session-token=${session?.user?.sessionToken}`,
  //     },
  //   }
  // ).then((res) => res.json());
  const data: Mechanic[] = [];

  return <MechanicsView dataUsers={data} session={session} />;
}
