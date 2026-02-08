import { NextAuthOptions, User, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { JWT } from "next-auth/jwt";

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

        const u = user as typeof user & {
          first_name?: string;
          last_name?: string;
          name?: string;
        };

        const fullName =
          [u.first_name, u.last_name].filter(Boolean).join(" ") ||
          u.name ||
          undefined;

        return {
          id: String(user.id),
          name: fullName,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User & { role?: string };
    }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { role?: string; id?: string };
    }) {
      session.user = {
        ...session.user,
        role: token.role,
        id: token.id,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/signout",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
