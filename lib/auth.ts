import { type NextAuthOptions, type Session, type User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      const castUser = user as User & { role?: "admin" | "user" };
      const s: Session = session;
      if (s.user) {
        s.user = {
          ...s.user,
          id: castUser.id,
          role: castUser.role ?? "user",
        } as Session["user"] & { id: string; role?: "admin" | "user" };
      }
      return s;
    },
  },
  pages: {
    signIn: "/api/auth/signin",
  },
};

export default authOptions;

