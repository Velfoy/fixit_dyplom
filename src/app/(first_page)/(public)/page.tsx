import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <main className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-3xl font-bold">My App</h1>

      {!user ? (
        <Link
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Log in / Register
        </Link>
      ) : (
        <div className="flex flex-col items-center space-y-3">
          <p className="text-lg">
            Welcome, <span className="font-semibold">{user.name}</span>!
          </p>
          <Link
            href={`/${user.role?.toLowerCase()}/dashboard`}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Go to Dashboard
          </Link>
          <form action="/api/auth/signout?callbackUrl=/" method="post">
            <button className="bg-red-600 px-3 py-1 rounded">Logout</button>
          </form>
        </div>
      )}
    </main>
  );
}
