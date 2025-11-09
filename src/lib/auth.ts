// ...existing code...
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma"; // adjust if you export named prisma

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // note: include `req` param to match expected signature
      async authorize(credentials) {
        console.log("authorize called", { credentials });
        if (!credentials?.email || !credentials?.password) {
          console.log("missing credentials");
          return null;
        }

        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });
        console.log("db user:", Boolean(user), user?.email);

        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        console.log("password valid:", valid);
        if (!valid) return null;

        return {
          id: String(user.id), // next-auth expects string id
          name: user.name,
          email: user.email,
          role: user.role,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        role: (token as any).role,
        id: (token as any).id,
      } as any;
      return session;
    },
  },
  pages: { signIn: "/auth/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
