import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
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

        // 👇 Cast to any to safely access first_name / last_name if they exist
        const u = user as any;

        // Prefer first_name + last_name if present, otherwise fall back to name
        const fullName =
          [u.first_name, u.last_name].filter(Boolean).join(" ") ||
          u.name ||
          undefined;

        return {
          id: String(user.id), // NextAuth expects string id
          name: fullName,
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

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
